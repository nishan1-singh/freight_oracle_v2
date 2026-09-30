from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import model_service
from schemas import (
    FreightPredictionRequest,
    FreightPredictionResponse,
    HealthResponse,
    OptionsResponse,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models once when the server starts
    model_service.load_models()
    yield

# Fix: Attach the lifespan to the app instance here
app = FastAPI(lifespan=lifespan)

# Enable CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://192.168.14.93:5173/"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health():
    return HealthResponse(status="ok", models_loaded=model_service.is_loaded())

@app.get("/options", response_model=OptionsResponse, tags=["Reference data"])
def options():
    try:
        meta = model_service.get_metadata()
    except model_service.ModelNotLoadedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return OptionsResponse(ports=meta["ports"], vessel_types=meta["vessel_types"])

@app.post("/predict", response_model=FreightPredictionResponse, tags=["Prediction"])
def predict(payload: FreightPredictionRequest):
    try:
        result = model_service.predict(
            vessel_capacity=payload.vessel_capacity,
            origin_port=payload.origin_port,
            destination_port=payload.destination_port,
            bunker_fuel_price=payload.bunker_fuel_price,
            weather_severity_rate=payload.weather_severity_rate,
            distance_nm=payload.distance_nm,
        )
    except model_service.ModelNotLoadedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return FreightPredictionResponse(**result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)