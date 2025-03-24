import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NoiseDashboard from './NoiseDashboard';
import Laporan from './Laporan'; // Pastikan path import ini benar
import './App.css';
import TrenData from './TrenData';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<NoiseDashboard />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/tren-data" element={<TrenData />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;