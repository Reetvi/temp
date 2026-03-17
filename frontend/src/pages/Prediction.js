import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';

const Prediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelInfo, setModelInfo] = useState(null);

  const COLORS = {
    'no_activity': '#a0a0a0',
    'washing_machine': '#2196F3',
    'filling': '#4CAF50',
    'flush': '#FF9800',
    'geyser': '#f44336'
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [predRes, infoRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/v1/predictions-history?limit=100`),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/v1/model-info`)
      ]);
      setPredictions(predRes.data || []);
      setModelInfo(infoRes.data || null);
    } catch (err) {
      console.error('Failed to fetch prediction data', err);
    } finally {
      setLoading(false);
    }
  };

  const getDistributionData = () => {
    const counts = {};
    predictions.forEach(p => {
      counts[p.prediction] = (counts[p.prediction] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  };

  const latestPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="prediction-page fade-in">
      <div className="page-header">
        <h2 className="page-title">AI Water Usage Predictions</h2>
        {modelInfo && (
          <div className="model-badge pulse">
            Model: {modelInfo.model_type} v{modelInfo.version} | Accuracy: {(modelInfo.accuracy * 100).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="prediction-dashboard">
        <div className="prediction-main-card">
          <h3>Current Activity Status</h3>
          {loading && !latestPrediction ? (
            <p className="loading-text">Loading AI Predictions...</p>
          ) : !latestPrediction ? (
            <p className="no-data-text">No prediction history available.</p>
          ) : (
            <div className="latest-status">
              <div 
                className="status-indicator-lg" 
                style={{ backgroundColor: COLORS[latestPrediction.prediction] || '#000' }}
              >
                {latestPrediction.prediction.replace('_', ' ').toUpperCase()}
              </div>
              <div className="confidence-meter">
                <span className="conf-label">Confidence</span>
                <div className="conf-bar-bg">
                  <div 
                    className="conf-bar-fill" 
                    style={{ width: `${Math.round(latestPrediction.confidence * 100)}%` }}
                  ></div>
                </div>
                <span className="conf-value">{Math.round(latestPrediction.confidence * 100)}%</span>
              </div>
              <p className="last-updated-text">
                Last updated: {new Date(latestPrediction.created_at).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        <div className="prediction-charts">
          <div className="chart-card">
            <h3>Prediction Distribution (Last 100)</h3>
            <div className="chart-container-sm">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getDistributionData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="history-table-section slide-up">
        <h3>Recent Classification History</h3>
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Node ID</th>
                <th>Distance (cm)</th>
                <th>Activity Detected</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 15).map((row, idx) => (
                <tr key={idx}>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  <td>{row.node_id}</td>
                  <td>{row.distance.toFixed(1)}</td>
                  <td>
                    <span 
                      className="activity-badge"
                      style={{ backgroundColor: COLORS[row.prediction] || '#888' }}
                    >
                      {row.prediction.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{(row.confidence * 100).toFixed(1)}%</td>
                </tr>
              ))}
              {predictions.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="text-center">No history available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
