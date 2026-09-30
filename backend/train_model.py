"""
train_model.py
----------------
Generates a synthetic maritime freight dataset and trains two models:

  1. A regressor that predicts `freight_rate_usd` from:
       vessel_capacity, origin_port, destination_port,
       bunker_fuel_price, weather_severity_rate, distance_nm
  2. A classifier that predicts `vessel_type` from the same inputs.

The real notebook (model.md) only ever used `vessel_capacity` to forecast
future freight rates for a fixed set of vessels, and never modeled the
route / fuel / weather features you listed. Since no dataset with those
columns exists, this script builds a synthetic-but-realistic one (vessel
type ranges, port lists, and price relationships are loosely based on the
values seen in model.md) so the API has something real to load and serve.

Run:
    python train_model.py

Outputs (written to ./models):
    freight_rate_model.joblib   - sklearn Pipeline (preprocessing + regressor)
    vessel_type_model.joblib    - sklearn Pipeline (preprocessing + classifier)
    metadata.json               - ports list, vessel types, feature schema
"""

import json
import os

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

RANDOM_STATE = 42
N_SAMPLES = 6000
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# ---------------------------------------------------------------------------
# 1. Reference data: vessel types (with realistic capacity bands) and ports
# ---------------------------------------------------------------------------

VESSEL_TYPES = {
    "Ultra Large Container Vessel": {"capacity": (18000, 24000), "base_rate": 1400},
    "New Panamax Container": {"capacity": (9000, 13000), "base_rate": 900},
    "Crude Oil Tanker (VLCC)": {"capacity": (270000, 320000), "base_rate": 1600},
    "Bulk Carrier (Panamax)": {"capacity": (65000, 82000), "base_rate": 1100},
    "Handysize Bulk Carrier": {"capacity": (15000, 40000), "base_rate": 750},
    "LNG Carrier": {"capacity": (120000, 180000), "base_rate": 1800},
}

PORTS = [
    "Shanghai", "Singapore", "Rotterdam", "Ningbo-Zhoushan", "Busan",
    "Hong Kong", "Jebel Ali", "Antwerp", "Los Angeles", "Hamburg",
    "New York", "Santos", "Mumbai (Nhava Sheva)", "Colombo", "Chittagong",
]

# Rough relative distance factor per port (used only to make the synthetic
# distance_nm feature internally consistent, not real navigational data).
_PORT_POSITION = {p: i for i, p in enumerate(PORTS)}


def _synthetic_distance(origin: str, destination: str, rng: np.random.Generator) -> float:
    """Fabricate a plausible distance in nautical miles for a port pair."""
    base = abs(_PORT_POSITION[origin] - _PORT_POSITION[destination]) * 650 + 300
    noise = rng.normal(0, 400)
    return float(np.clip(base + noise, 100, 12000))


# ---------------------------------------------------------------------------
# 2. Synthetic dataset generation
# ---------------------------------------------------------------------------

def generate_dataset(n_samples: int = N_SAMPLES, seed: int = RANDOM_STATE) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    vessel_names = list(VESSEL_TYPES.keys())

    rows = []
    for _ in range(n_samples):
        vessel_type = rng.choice(vessel_names)
        cap_low, cap_high = VESSEL_TYPES[vessel_type]["capacity"]
        vessel_capacity = float(rng.uniform(cap_low, cap_high))

        origin_port, destination_port = rng.choice(PORTS, size=2, replace=False)
        distance_nm = _synthetic_distance(origin_port, destination_port, rng)

        bunker_fuel_price = float(np.clip(rng.normal(550, 120), 250, 950))  # USD/ton
        weather_severity_rate = float(np.clip(rng.beta(2, 5) * 10, 0, 10))  # 0 (calm) - 10 (severe)

        base_rate = VESSEL_TYPES[vessel_type]["base_rate"]
        freight_rate_usd = (
            base_rate
            + 0.015 * distance_nm
            + 0.9 * bunker_fuel_price
            + 40 * weather_severity_rate
            + 0.002 * vessel_capacity
            + rng.normal(0, 150)  # market noise
        )
        freight_rate_usd = float(max(freight_rate_usd, 50))

        rows.append(
            {
                "vessel_capacity": round(vessel_capacity, 1),
                "origin_port": origin_port,
                "destination_port": destination_port,
                "bunker_fuel_price": round(bunker_fuel_price, 2),
                "weather_severity_rate": round(weather_severity_rate, 2),
                "distance_nm": round(distance_nm, 1),
                "vessel_type": vessel_type,
                "freight_rate_usd": round(freight_rate_usd, 2),
            }
        )

    return pd.DataFrame(rows)


NUMERIC_FEATURES = [
    "vessel_capacity",
    "bunker_fuel_price",
    "weather_severity_rate",
    "distance_nm",
]
CATEGORICAL_FEATURES = ["origin_port", "destination_port"]
FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def _make_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("num", "passthrough", NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ]
    )


def train_and_save():
    os.makedirs(MODELS_DIR, exist_ok=True)
    df = generate_dataset()

    X = df[FEATURE_COLUMNS]
    y_rate = df["freight_rate_usd"]
    y_type = df["vessel_type"]

    X_train, X_test, y_rate_train, y_rate_test, y_type_train, y_type_test = train_test_split(
        X, y_rate, y_type, test_size=0.2, random_state=RANDOM_STATE
    )

    # --- Freight rate regressor ---
    rate_pipeline = Pipeline(
        steps=[
            ("preprocess", _make_preprocessor()),
            (
                "model",
                GradientBoostingRegressor(
                    n_estimators=300, learning_rate=0.05, max_depth=4, random_state=RANDOM_STATE
                ),
            ),
        ]
    )
    rate_pipeline.fit(X_train, y_rate_train)
    rate_pred = rate_pipeline.predict(X_test)
    print(f"[freight_rate] MAE: {mean_absolute_error(y_rate_test, rate_pred):.2f} "
          f"USD  |  R2: {r2_score(y_rate_test, rate_pred):.3f}")

    # --- Vessel type classifier ---
    type_pipeline = Pipeline(
        steps=[
            ("preprocess", _make_preprocessor()),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=300, max_depth=None, random_state=RANDOM_STATE
                ),
            ),
        ]
    )
    type_pipeline.fit(X_train, y_type_train)
    type_pred = type_pipeline.predict(X_test)
    print(f"[vessel_type] Accuracy: {accuracy_score(y_type_test, type_pred):.3f}")

    import joblib

    joblib.dump(rate_pipeline, os.path.join(MODELS_DIR, "freight_rate_model.joblib"))
    joblib.dump(type_pipeline, os.path.join(MODELS_DIR, "vessel_type_model.joblib"))

    metadata = {
        "feature_columns": FEATURE_COLUMNS,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "ports": PORTS,
        "vessel_types": list(VESSEL_TYPES.keys()),
    }
    with open(os.path.join(MODELS_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved artifacts to: {MODELS_DIR}")


if __name__ == "__main__":
    train_and_save()
