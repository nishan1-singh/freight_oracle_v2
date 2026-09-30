"""
model_service.py
-----------------
Loads the trained model artifacts once and exposes a small, framework-agnostic
`predict()` function. Keeping this separate from main.py means the FastAPI
layer stays thin, and the models could just as easily be served from a CLI,
a batch job, or a different web framework without touching this file.
"""

import json
import os

import joblib
import pandas as pd

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# Weather-severity values used to build the "freight rate vs weather severity"
# curve returned alongside every prediction (see predict() below). Matches the
# 0-10 range validated in schemas.FreightPredictionRequest.
WEATHER_SENSITIVITY_POINTS = [0, 2, 4, 6, 8, 10]

_rate_model = None
_type_model = None
_metadata = None


class ModelNotLoadedError(RuntimeError):
    pass


def load_models() -> None:
    """Load model artifacts into memory. Call once at API startup."""
    global _rate_model, _type_model, _metadata

    rate_path = os.path.join(MODELS_DIR, "freight_rate_model.joblib")
    type_path = os.path.join(MODELS_DIR, "vessel_type_model.joblib")
    metadata_path = os.path.join(MODELS_DIR, "metadata.json")

    for path in (rate_path, type_path, metadata_path):
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Missing model artifact: {path}. Run `python train_model.py` first."
            )

    _rate_model = joblib.load(rate_path)
    _type_model = joblib.load(type_path)
    with open(metadata_path) as f:
        _metadata = json.load(f)


def is_loaded() -> bool:
    return _rate_model is not None and _type_model is not None


def get_metadata() -> dict:
    if _metadata is None:
        raise ModelNotLoadedError("Models are not loaded yet.")
    return _metadata


def predict(
    vessel_capacity: float,
    origin_port: str,
    destination_port: str,
    bunker_fuel_price: float,
    weather_severity_rate: float,
    distance_nm: float,
) -> dict:
    """Run both models on a single input row and return:

    - the point prediction for freight rate and vessel type
    - the full class-probability breakdown for the vessel-type classifier
      (powers the frontend's pie chart)
    - a freight-rate sensitivity curve across weather severity, holding every
      other input fixed (powers the frontend's line graph)
    """
    if not is_loaded():
        raise ModelNotLoadedError("Models are not loaded. Call load_models() first.")

    base_row = {
        "vessel_capacity": vessel_capacity,
        "origin_port": origin_port,
        "destination_port": destination_port,
        "bunker_fuel_price": bunker_fuel_price,
        "weather_severity_rate": weather_severity_rate,
        "distance_nm": distance_nm,
    }
    row = pd.DataFrame([base_row])

    freight_rate = float(_rate_model.predict(row)[0])

    vessel_type = str(_type_model.predict(row)[0])
    proba = _type_model.predict_proba(row)[0]
    confidence = float(max(proba))
    vessel_type_probabilities = {
        str(cls): round(float(p), 4) for cls, p in zip(_type_model.classes_, proba)
    }

    # Hold every input fixed except weather severity, and predict the freight
    # rate at each point on the curve in a single vectorized batch call.
    sensitivity_df = pd.DataFrame(
        [{**base_row, "weather_severity_rate": w} for w in WEATHER_SENSITIVITY_POINTS]
    )
    sensitivity_preds = _rate_model.predict(sensitivity_df)
    weather_sensitivity = [
        {"weather_severity_rate": w, "freight_rate_usd": round(float(p), 2)}
        for w, p in zip(WEATHER_SENSITIVITY_POINTS, sensitivity_preds)
    ]

    return {
        "freight_rate_usd": round(freight_rate, 2),
        "vessel_type": vessel_type,
        "vessel_type_confidence": round(confidence, 4),
        "vessel_type_probabilities": vessel_type_probabilities,
        "weather_sensitivity": weather_sensitivity,
    }
