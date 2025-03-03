import React from 'react';
import ReactDOM from 'react-dom/client';
import NoiseDashboard from './NoiseDashboard';
import './index.css'; // Impor file CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NoiseDashboard />
  </React.StrictMode>
);