import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

// --- Small color-math helpers (used to shade the 3D pie/bar faces) ---
const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};
const clampByte = (n) => Math.max(0, Math.min(255, Math.round(n)));
const rgbToHex = ({ r, g, b }) => `#${clampByte(r).toString(16).padStart(2, '0')}${clampByte(g).toString(16).padStart(2, '0')}${clampByte(b).toString(16).padStart(2, '0')}`;
const mixColor = (hexA, hexB, t) => {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });
};
// factor > 1 lightens toward white, factor < 1 darkens toward black
const shade = (hex, factor) => {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (c) => (factor >= 1 ? c + (255 - c) * (factor - 1) : c * factor);
  return rgbToHex({ r: adjust(r), g: adjust(g), b: adjust(b) });
};
// Calm (emerald) -> severe (red) color scale used on the weather bar chart
const severityColor = (w) => mixColor('#10b981', '#ef4444', Math.min(1, Math.max(0, w / 10)));

// --- Reusable Custom Dropdown Component ---
const CustomDropdown = ({ options, value, onChange, placeholder, label, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col relative font-inter" ref={dropdownRef}>
      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white/80 backdrop-blur-sm border text-slate-800 text-[16px] rounded-2xl flex items-center justify-between w-full p-4 outline-none transition-all font-medium cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
          isOpen ? 'border-blue-400 ring-4 ring-blue-500/10 bg-white' : 'border-white hover:border-blue-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {selectedOption ? (
            <>
              <span className="flex items-center justify-center w-6">{selectedOption.icon}</span>
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[90px] left-0 w-full bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col max-h-64 overflow-y-auto custom-scrollbar">
            {options.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-400">No ports available</div>
            )}
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                  value === option.value ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="flex items-center justify-center w-6 shrink-0">{option.icon}</span>
                <span className="font-medium text-[15px]">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ISO country codes for the ports the backend model was actually trained on
// (see PORTS in train_model.py), used only for the flag icon in the
// dropdown/route summary. Any port the backend adds later still works via
// the generic icon fallback instead of crashing.
const PORT_ISO = {
  'Shanghai': 'cn',
  'Singapore': 'sg',
  'Rotterdam': 'nl',
  'Ningbo-Zhoushan': 'cn',
  'Busan': 'kr',
  'Hong Kong': 'hk',
  'Jebel Ali': 'ae',
  'Antwerp': 'be',
  'Los Angeles': 'us',
  'Hamburg': 'de',
  'New York': 'us',
  'Santos': 'br',
  'Mumbai (Nhava Sheva)': 'in',
  'Colombo': 'lk',
  'Chittagong': 'bd',
};

// Colors keyed to the six vessel types the model is trained on (see
// VESSEL_TYPES in train_model.py), so a given type always renders in the
// same color across requests instead of shuffling with sort order.
const VESSEL_TYPE_COLORS = {
  'Ultra Large Container Vessel': '#3b82f6',
  'New Panamax Container': '#10b981',
  'Crude Oil Tanker (VLCC)': '#ef4444',
  'Bulk Carrier (Panamax)': '#f59e0b',
  'Handysize Bulk Carrier': '#8b5cf6',
  'LNG Carrier': '#14b8a6',
};
const FALLBACK_COLORS = ['#64748b', '#ec4899', '#22c55e', '#eab308'];
const getVesselColor = (type, idx) => VESSEL_TYPE_COLORS[type] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardForm() {
  const [activeMenu, setActiveMenu] = useState('input');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  // Backend response state (The 3 Mandatory Outputs)
  const [predictedRate, setPredictedRate] = useState(0);
  const [predictedVesselType, setPredictedVesselType] = useState('');
  const [predictedConfidence, setPredictedConfidence] = useState(0);

  // Extra backend response state that drives the pie chart & bar graph
  const [vesselTypeProbabilities, setVesselTypeProbabilities] = useState({});
  const [weatherSensitivity, setWeatherSensitivity] = useState([]);

  // Ports come straight from the backend's /options endpoint, so the
  // dropdown can never submit a port the model wasn't trained on.
  const [serverPorts, setServerPorts] = useState([]);
  const [portsLoading, setPortsLoading] = useState(true);
  const [portsError, setPortsError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    originPort: '',
    destinationPort: '',
    vesselCapacity: '',
    bunkerFuelPrice: '',
    weatherSeverity: '',
    distanceNm: ''
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load the valid port list (and confirm the backend is reachable) once on mount.
  useEffect(() => {
    let cancelled = false;
    const fetchOptions = async () => {
      setPortsLoading(true);
      setPortsError(null);
      try {
        const res = await axios.get(`${API_BASE}/options`);
        if (!cancelled) setServerPorts(res.data.ports || []);
      } catch (err) {
        if (!cancelled) {
          setPortsError('Could not load ports from the backend. Make sure the FastAPI server is running on port 8000.');
        }
      } finally {
        if (!cancelled) setPortsLoading(false);
      }
    };
    fetchOptions();
    return () => { cancelled = true; };
  }, []);

  const handleCustomDropdownChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // --- PORT OPTIONS, built from whatever ports the backend actually reports ---
  const getFlag = (code) => <img src={`https://flagcdn.com/w40/${code}.png`} alt={code} className="w-6 rounded-sm shadow-sm" />;
  const genericPortIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );

  const portOptions = serverPorts.map((portName) => {
    const iso = PORT_ISO[portName];
    return {
      value: portName,
      label: portName,
      icon: iso ? getFlag(iso) : genericPortIcon,
    };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const payload = {
        vessel_capacity: parseFloat(formData.vesselCapacity),
        bunker_fuel_price: parseFloat(formData.bunkerFuelPrice),
        weather_severity_rate: parseFloat(formData.weatherSeverity),
        distance_nm: parseFloat(formData.distanceNm),
        origin_port: formData.originPort,
        destination_port: formData.destinationPort
      };

      const response = await axios.post(`${API_BASE}/predict`, payload);

      setPredictedRate(response.data.freight_rate_usd);
      setPredictedVesselType(response.data.vessel_type);
      const confidenceVal = response.data.vessel_type_confidence > 1
        ? response.data.vessel_type_confidence
        : response.data.vessel_type_confidence * 100;
      setPredictedConfidence(Math.round(confidenceVal));
      setVesselTypeProbabilities(response.data.vessel_type_probabilities || {});
      setWeatherSensitivity(response.data.weather_sensitivity || []);

      setIsProcessing(false);
      setShowOutput(true);
    } catch (error) {
      console.error("Error predicting route:", error);
      setIsProcessing(false);
      alert(error.response ? `Backend Error: ${JSON.stringify(error.response.data)}` : `Network Error: ${error.message}`);
    }
  };

  // --- Calendar tab state/helpers ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const changeMonth = (delta) => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  const goToToday = () => setCurrentDate(new Date());

  // --- Pie chart slices, built from the full vessel-type probability breakdown ---
  const pieSlices = (() => {
    const entries = Object.entries(vesselTypeProbabilities).sort((a, b) => b[1] - a[1]);
    let cumulative = 0;
    return entries.map(([type, prob], idx) => {
      const pct = prob * 100;
      const slice = { type, pct, color: getVesselColor(type, idx), offset: cumulative };
      cumulative += pct;
      return slice;
    });
  })();

  const buildConicGradient = (slices, colorFn) => {
    if (!slices.length) return '#e2e8f0';
    let acc = 0;
    const stops = slices.map((s) => {
      const start = acc;
      acc += s.pct;
      return `${colorFn(s)} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  };
  const pieGradientTop = buildConicGradient(pieSlices, (s) => s.color);
  const pieGradientBase = buildConicGradient(pieSlices, (s) => shade(s.color, 0.55));

  // --- Isometric 3D bar-chart geometry for weather sensitivity ---
  // Combine the backend's 6-point sensitivity curve with the user's exact
  // submitted severity/rate, so their own route shows up on the chart.
  const currentSeverityNum = parseFloat(formData.weatherSeverity);
  const hasCurrentPoint = weatherSensitivity.length > 0 && !Number.isNaN(currentSeverityNum);
  let chartPoints = weatherSensitivity.map((p) => ({ ...p, isCurrent: false }));
  if (hasCurrentPoint) {
    const matchIdx = chartPoints.findIndex((p) => Math.abs(p.weather_severity_rate - currentSeverityNum) < 0.05);
    if (matchIdx >= 0) {
      chartPoints[matchIdx] = { ...chartPoints[matchIdx], isCurrent: true, freight_rate_usd: predictedRate };
    } else {
      chartPoints.push({ weather_severity_rate: currentSeverityNum, freight_rate_usd: predictedRate, isCurrent: true });
    }
  }
  chartPoints = [...chartPoints].sort((a, b) => a.weather_severity_rate - b.weather_severity_rate);

  const bar3d = { width: 640, height: 300, padLeft: 66, padRight: 46, padTop: 46, padBottom: 46, depthX: 16, depthY: -12, barWidth: 30 };
  const plotW3 = bar3d.width - bar3d.padLeft - bar3d.padRight - bar3d.depthX;
  const baselineY3 = bar3d.height - bar3d.padBottom;
  const topLimitY3 = bar3d.padTop + Math.abs(bar3d.depthY);
  const plotH3 = baselineY3 - topLimitY3;

  const barValues = chartPoints.map((p) => p.freight_rate_usd);
  const barMin = barValues.length ? Math.min(...barValues) : 0;
  const barMax = barValues.length ? Math.max(...barValues) : 1;
  const barBase = barMin - (barMax - barMin || 1) * 0.25;
  const barRange = (barMax - barBase) || 1;

  const xFor3 = (w) => bar3d.padLeft + (w / 10) * plotW3;
  const heightFor3 = (v) => ((v - barBase) / barRange) * plotH3;

  return (
    <div className="w-[95%] xl:w-[90%] mx-auto py-6 relative z-20 flex items-center justify-center min-h-screen">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700;900&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
          .font-roboto { font-family: 'Roboto', sans-serif; }
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        `}
      </style>

      <div className="w-full flex flex-col h-[90vh] min-h-[800px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40 bg-gradient-to-br from-slate-50 to-blue-50/60 backdrop-blur-xl relative font-inter">

        {/* --- NAVBAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center p-5 md:px-10 bg-white/60 backdrop-blur-md border-b border-white/50 gap-4 relative z-10">
          <div className="flex items-center gap-4 text-slate-800 font-bold text-2xl tracking-wide">
            {showOutput && activeMenu === 'input' && (
              <button onClick={() => setShowOutput(false)} className="text-slate-400 hover:text-slate-800 p-2 bg-white/50 rounded-full shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
            </div>
            <h1>{activeMenu === 'calendar' ? 'Logistics Calendar' : showOutput ? 'Model Prediction Results' : 'Configure Global Route'}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-white/50 p-1.5 rounded-full border border-white shadow-sm">
              <button onClick={() => { setActiveMenu('input'); }} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeMenu === 'input' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Forecast</button>
              <button onClick={() => setActiveMenu('calendar')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeMenu === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Calendar</button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center custom-scrollbar">

          {/* --- EXPANDED INPUT FORM --- */}
          {activeMenu === 'input' && !showOutput && (
            <form onSubmit={handleSubmit} className="w-full max-w-6xl bg-white/70 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-xl border border-white flex flex-col gap-10">
              <div className="mb-2">
                <h2 className="text-3xl font-bold text-slate-800">Route & Cargo Details</h2>
                <p className="text-slate-500 mt-2 text-lg">Input parameters to generate predictions for domestic Indian runs or international import/export routes.</p>
              </div>

              {portsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-semibold">
                  {portsError}
                </div>
              )}

              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Route</span>
                  <div className="flex-1 border-t border-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <CustomDropdown label="Origin Port" placeholder={portsLoading ? 'Loading ports...' : 'Select Origin'} options={portOptions} value={formData.originPort} onChange={(val) => handleCustomDropdownChange('originPort', val)} disabled={portsLoading} />
                  <CustomDropdown label="Destination Port" placeholder={portsLoading ? 'Loading ports...' : 'Select Destination'} options={portOptions} value={formData.destinationPort} onChange={(val) => handleCustomDropdownChange('destinationPort', val)} disabled={portsLoading} />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Cargo & Conditions</span>
                  <div className="flex-1 border-t border-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  <div className="flex flex-col font-inter">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Weather Severity (0-10)</label>
                    <input type="number" name="weatherSeverity" value={formData.weatherSeverity} onChange={handleChange} required placeholder="e.g. 3.2" min="0" max="10" step="0.1" className="bg-white/80 border border-white text-slate-800 text-[16px] rounded-2xl focus:ring-4 focus:ring-blue-400/30 block w-full p-4 outline-none shadow-sm transition-all" />
                  </div>
                  <div className="flex flex-col font-inter">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Capacity (DWT / TEU)</label>
                    <input type="number" name="vesselCapacity" value={formData.vesselCapacity} onChange={handleChange} required placeholder="e.g. 14000" min="1" className="bg-white/80 border border-white text-slate-800 text-[16px] rounded-2xl focus:ring-4 focus:ring-blue-400/30 block w-full p-4 outline-none shadow-sm transition-all" />
                  </div>
                  <div className="flex flex-col font-inter">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Bunker Fuel ($/ton)</label>
                    <input type="number" name="bunkerFuelPrice" value={formData.bunkerFuelPrice} onChange={handleChange} required placeholder="e.g. 650" min="1" step="0.01" className="bg-white/80 border border-white text-slate-800 text-[16px] rounded-2xl focus:ring-4 focus:ring-blue-400/30 block w-full p-4 outline-none shadow-sm transition-all" />
                  </div>
                  <div className="flex flex-col font-inter">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Distance (NM)</label>
                    <input type="number" name="distanceNm" value={formData.distanceNm} onChange={handleChange} required placeholder="e.g. 1200" min="1" className="bg-white/80 border border-white text-slate-800 text-[16px] rounded-2xl focus:ring-4 focus:ring-blue-400/30 block w-full p-4 outline-none shadow-sm transition-all" />
                  </div>
                </div>
              </div>

              {formData.originPort && formData.destinationPort && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 text-blue-700 font-bold text-sm w-fit">
                  <span>{formData.originPort}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  <span>{formData.destinationPort}</span>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={isProcessing || portsLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-lg px-12 py-5 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-70 w-full md:w-auto">
                  {isProcessing ? 'Processing Model Data...' : 'Generate AI Predictions'}
                </button>
              </div>
            </form>
          )}

          {/* --- OUTPUT DASHBOARD --- */}
          {activeMenu === 'input' && showOutput && (
            <div className="w-[95%] max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in">

              {/* MANDATORY OUTPUTS: Freight Rate, Optimal Vessel, Confidence Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#0f172a] rounded-[2rem] p-10 text-white shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full pointer-events-none"></div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                  </div>
                  <p className="text-slate-400 font-inter uppercase tracking-widest text-sm font-semibold mb-2">Freight Rate</p>
                  <h2 className="text-6xl font-black font-roboto text-emerald-400">${predictedRate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</h2>
                </div>

                <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="4" y="10" width="16" height="6" rx="1" />
                      <rect x="10" y="4" width="4" height="6" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-inter uppercase tracking-widest text-sm font-semibold mb-2">Optimal Vessel</p>
                  <h3 className="text-3xl font-black font-roboto text-blue-600">{predictedVesselType || 'N/A'}</h3>
                </div>

                <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-slate-500 font-inter uppercase tracking-widest text-sm font-semibold mb-2">Confidence Score</p>
                  <h3 className="text-5xl font-black font-roboto text-slate-800">{predictedConfidence}%</h3>
                </div>
              </div>

              {/* ROUTE SUMMARY (replaces the map) */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg flex flex-col gap-6">
                <h3 className="font-bold text-slate-800 text-xl">Route Summary</h3>
                <div className="flex items-center justify-center gap-4 md:gap-10 flex-wrap">
                  <div className="flex flex-col items-center gap-2 min-w-[120px]">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      {portOptions.find((p) => p.value === formData.originPort)?.icon || genericPortIcon}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Origin</span>
                    <span className="font-bold text-slate-800 text-center">{formData.originPort || '—'}</span>
                  </div>

                  <div className="flex-1 min-w-[60px] max-w-[180px] flex items-center gap-1 text-blue-300">
                    <div className="flex-1 border-t-2 border-dashed border-blue-200"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  </div>

                  <div className="flex flex-col items-center gap-2 min-w-[120px]">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      {portOptions.find((p) => p.value === formData.destinationPort)?.icon || genericPortIcon}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination</span>
                    <span className="font-bold text-slate-800 text-center">{formData.destinationPort || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                  {[
                    { label: 'Distance', value: `${Number(formData.distanceNm || 0).toLocaleString()} NM` },
                    { label: 'Vessel Capacity', value: `${Number(formData.vesselCapacity || 0).toLocaleString()} DWT/TEU` },
                    { label: 'Bunker Fuel', value: `$${formData.bunkerFuelPrice || 0}/ton` },
                    { label: 'Weather Severity', value: `${formData.weatherSeverity || 0} / 10` },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                      <span className="text-base font-bold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3D isometric bar chart: freight rate sensitivity to weather severity */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg flex flex-col lg:col-span-2">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h3 className="font-bold text-slate-800 text-xl">Freight Rate vs. Weather Severity</h3>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Your route highlighted</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-6">Predicted rate at each severity level, with every other input on this route held fixed.</p>
                  <svg viewBox={`0 0 ${bar3d.width} ${bar3d.height}`} className="w-full h-auto">
                    {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                      const y = topLimitY3 + plotH3 * t;
                      const val = barMax - (barMax - barBase) * t;
                      return (
                        <g key={t}>
                          <line x1={bar3d.padLeft} x2={bar3d.width - bar3d.padRight} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                          <text x={bar3d.padLeft - 10} y={y + 4} fontSize="11" fill="#94a3b8" textAnchor="end">${Math.round(val).toLocaleString()}</text>
                        </g>
                      );
                    })}

                    {chartPoints.map((p, idx) => {
                      const barTopY = baselineY3 - heightFor3(p.freight_rate_usd);
                      const xLeft = xFor3(p.weather_severity_rate) - bar3d.barWidth / 2;
                      const frontColor = p.isCurrent ? '#6366f1' : severityColor(p.weather_severity_rate);
                      const topColor = shade(frontColor, 1.35);
                      const sideColor = shade(frontColor, 0.6);

                      const topPoly = [
                        [xLeft, barTopY],
                        [xLeft + bar3d.barWidth, barTopY],
                        [xLeft + bar3d.barWidth + bar3d.depthX, barTopY + bar3d.depthY],
                        [xLeft + bar3d.depthX, barTopY + bar3d.depthY],
                      ].map((pt) => pt.join(',')).join(' ');

                      const sidePoly = [
                        [xLeft + bar3d.barWidth, barTopY],
                        [xLeft + bar3d.barWidth + bar3d.depthX, barTopY + bar3d.depthY],
                        [xLeft + bar3d.barWidth + bar3d.depthX, baselineY3 + bar3d.depthY],
                        [xLeft + bar3d.barWidth, baselineY3],
                      ].map((pt) => pt.join(',')).join(' ');

                      const labelX = xLeft + bar3d.barWidth / 2 + bar3d.depthX / 2;

                      return (
                        <g key={`bar-${idx}`}>
                          <rect x={xLeft} y={barTopY} width={bar3d.barWidth} height={baselineY3 - barTopY} fill={frontColor} />
                          <polygon points={sidePoly} fill={sideColor} />
                          <polygon points={topPoly} fill={topColor} />
                          {p.isCurrent && (
                            <text x={labelX} y={barTopY + bar3d.depthY - 22} fontSize="10" fontWeight="bold" fill="#6366f1" textAnchor="middle">YOUR ROUTE</text>
                          )}
                          <text x={labelX} y={barTopY + bar3d.depthY - 8} fontSize="11" fontWeight="bold" fill="#334155" textAnchor="middle">
                            ${Math.round(p.freight_rate_usd).toLocaleString()}
                          </text>
                          <text x={xFor3(p.weather_severity_rate)} y={baselineY3 + 24} fontSize="11" fill="#94a3b8" textAnchor="middle">{p.weather_severity_rate}</text>
                        </g>
                      );
                    })}
                  </svg>
                  <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Weather Severity (0 = calm, 10 = severe)</p>
                </div>

                {/* 3D tilted pie chart: full vessel-type probability breakdown */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg flex flex-col items-center">
                  <h3 className="font-bold text-slate-800 w-full text-left text-xl mb-6">Vessel Type Probability</h3>
                  <div className="relative flex items-center justify-center" style={{ width: 200, height: 210 }}>
                    <div className="absolute inset-0" style={{ perspective: '900px' }}>
                      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg)' }}>
                        <div className="absolute inset-0 rounded-full" style={{ background: pieGradientBase, transform: 'translateZ(-16px)' }} />
                        <div className="absolute inset-0 rounded-full" style={{ background: pieGradientTop, boxShadow: '0 14px 26px rgba(15,23,42,0.25)' }} />
                      </div>
                    </div>
                    <div className="relative z-10 bg-white/90 px-4 py-2 rounded-xl shadow-md">
                      <span className="text-lg font-bold text-slate-800">{predictedConfidence}%</span>
                    </div>
                  </div>
                  <div className="w-full mt-4 flex flex-col gap-3">
                    {pieSlices.map((slice) => (
                      <div key={slice.type} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-600 font-medium min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
                            <span className="truncate">{slice.type}</span>
                          </span>
                          <span className="font-bold text-slate-800 shrink-0">{slice.pct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${slice.pct}%`, backgroundColor: slice.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- CALENDAR TAB --- */}
          {activeMenu === 'calendar' && (
            <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-white flex flex-col gap-8 animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                  <p className="text-slate-500 mt-1">Track voyage and booking dates for your routes.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => changeMonth(-1)} className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-500 hover:text-blue-600 shadow-sm transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </button>
                  <button type="button" onClick={goToToday} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 text-sm font-bold shadow-sm transition-all">Today</button>
                  <button type="button" onClick={() => changeMonth(1)} className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-500 hover:text-blue-600 shadow-sm transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {WEEKDAY_LABELS.map((d) => (
                  <div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-2">{d}</div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday =
                    day === currentTime.getDate() &&
                    currentDate.getMonth() === currentTime.getMonth() &&
                    currentDate.getFullYear() === currentTime.getFullYear();
                  return (
                    <div
                      key={day}
                      className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                        isToday ? 'bg-blue-600 text-white shadow-md' : 'bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}