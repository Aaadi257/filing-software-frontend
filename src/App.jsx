import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Masters from './pages/Masters';
import FileCreation from './pages/FileCreation';
import FileMovement from './pages/FileMovement';
import './styles/App.css';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/masters" replace />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/create-file" element={<FileCreation />} />
            <Route path="/movements" element={<FileMovement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
