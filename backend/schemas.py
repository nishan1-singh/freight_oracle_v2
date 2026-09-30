"""
schemas.py
----------
Pydantic models describing the API's request and response bodies.
Kept separate from main.py so validation rules are easy to find/change.
"""

from pydantic import BaseModel, Field


class FreightPredictionRequest(BaseModel):
    vessel_capacity: float = Field(..., gt=0, description="Vessel capacity in DWT / TEU")
    origin_port: str = Field(..., description="Origin port name")
    destination_port: str = Field(..., description="Destination port name")
    bunker_fuel_price: float = Field(..., gt=0, description="Bunker fuel price in USD/ton")
    weather_severity_rate: float = Field(..., ge=0, le=10, description="Weather severity, 0 (calm) - 10 (severe)")
    distance_nm: float = Field(..., gt=0, description="Route distance in nautical miles")

    model_config = {
        "json_schema_extra": {
            "example": {
                "vessel_capacity": 20500,
                "origin_port": "Shanghai",
                "destination_port": "Rotterdam",
                "bunker_fuel_price": 560.5,
                "weather_severity_rate": 3.2,
                "distance_nm": 8500,
            }
        }
    }


class WeatherSensitivityPoint(BaseModel):
    weather_severity_rate: float
    freight_rate_usd: float


class FreightPredictionResponse(BaseModel):
    freight_rate_usd: float
    vessel_type: str
    vessel_type_confidence: float
    # Full class-probability breakdown from the classifier, e.g.
    # {"Ultra Large Container Vessel": 0.62, "New Panamax Container": 0.18, ...}
    # Used by the frontend to render the vessel-type pie chart.
    vessel_type_probabilities: dict[str, float]
    # Predicted freight rate at several weather-severity values, holding every
    # other input fixed. Used by the frontend to render the sensitivity graph.
    weather_sensitivity: list[WeatherSensitivityPoint]


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool


class OptionsResponse(BaseModel):
    ports: list[str]
    vessel_types: list[str]
