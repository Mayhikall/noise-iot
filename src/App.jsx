import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NoiseDashboard from "./NoiseDashboard";
import TrenData from "./TrenData";
import Laporan from "./Laporan"; // Pastikan path import ini benar
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<NoiseDashboard />} />
          <Route path="/tren-data" element={<TrenData />} />
          <Route path="/laporan" element={<Laporan />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
