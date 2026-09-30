# Freight Oracle

This project provides intelligent freight forecasting for optimized vessel chartering, specifically targeting bulk cargo procurement from overseas to the East Coast of India. It was developed by Team NUL POINTERS (Team ID: 160555) for the Smart India Hackathon 2025 under Problem Statement ID SIH26006. 

For a comprehensive overview of the project's strategy, impact hypotheses, and evaluation plan, please refer to the project presentation file: SIH_26006.pptx.

## Core Features

* **Data Layer:** Aggregates inputs including AIS, fixtures, port queues, weather, commodity rates, FX, bunker prices, and procurement history.
* **Forecast Engine:** Utilizes an ensemble of Temporal Fusion Transformers (TFT) and XGBoost with walk-forward validation to generate P10, P50, and P90 forecasts across a 1–12 week horizon.
* **Stochastic MILP Optimizer:** Minimizes risk and landed cost by calculating optimal laycan, draft, vessel class, routing, cargo lots, and stock cover.
* **Decision & Learning Module:** Provides ranked charter options equipped with SHAP drivers and scenario analysis, ensuring the planner retains final approval while the system automatically feeds actuals back into retraining.

## Tech Stack

The platform's architecture is powered by the following technologies:
* **Frontend:** React
* **Backend & ML:** Python, FastAPI, PyTorch, LightGBM, OR-Tools/Pyomo
* **Database & Deployment:** PostgreSQL, Docker

## How to Run the Website

To run the application locally, you will need to start both the Python backend and the React frontend. Ensure you have Python, Node.js, and optionally Docker installed on your machine.

### 1. Start the Backend (FastAPI)
Open a terminal and navigate to your `backend` directory:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
