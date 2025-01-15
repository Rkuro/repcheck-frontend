// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ZipCodeProvider } from './contexts/ZipCodeContext';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import Bills from './pages/Bills/Bills';
import Reps from './pages/Reps/Reps';
import BillPage from './pages/BillPage/BillPage';
import AboutPage from './pages/AboutPage/AboutPage'
import MapPage from './pages/MapPage/MapPage'
import './index.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ZipCodeProvider>
      <Router>
        <Header toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/reps" element={<Reps />} />
            <Route path="/bill/:billId" element={<BillPage/>} />
            {/* Secret map page */}\
            <Route path="/secret/map" element={<MapPage />}/>
          </Routes>
        </div>
      </Router>
    </ZipCodeProvider>
  );
}

export default App;
