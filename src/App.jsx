import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NoiseDashboard from './NoiseDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<NoiseDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;