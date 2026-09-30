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

## How to Run the Project

To run the application locally, you will need to start both the Python backend and the React frontend. Ensure you have Python and Node.js installed on your machine.

### 1. Start the Backend (FastAPI)
The backend serves the API and machine learning models. Open a terminal, navigate to the backend directory, and run the following commands:

```bash
cd backend

# Install the required Python dependencies
pip install -r requirements.txt

# Start the FastAPI server (runs on http://localhost:8000 by default)
uvicorn main:app --reload

```
### 1. Start the frontend (FastAPI)
The backend serves the API and machine learning models. Open a terminal, navigate to the backend directory, and run the following commands:

```bash
cd frontend

# Install the required Node dependencies
npm install

# Start the React development server (runs on http://localhost:3000 or 5173 by default)
npm start

