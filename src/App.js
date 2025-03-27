// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ZipCodeProvider } from './contexts/ZipCodeContext';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import Bills from './pages/Bills/Bills';
import Reps from './pages/Reps/Reps';
import BillPage from './pages/BillPage/BillPage';
import AboutPage from './pages/AboutPage/AboutPage'
import MapPage from './pages/MapPage/MapPage'
import ChangeZip from './pages/ChangeZip/ChangeZip';
import './index.css';
import Footer from './components/Footer/Footer';
import MarkdownPage from './pages/MarkdownPage/MarkdownPage';


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
						<Route path="/change-zip" element={<ChangeZip />} />
						<Route path="/about" element={<AboutPage />} />
						<Route path="/bills" element={<Bills />} />
						<Route path="/reps" element={<Reps />} />
						<Route path="/bill/:billId" element={<BillPage />} />
						<Route path="/map" element={<MapPage />} />
						<Route path="/privacy" element={<MarkdownPage fileName={"privacy.md"}/>} />
						<Route path="/terms-of-use" element={<MarkdownPage fileName={"terms.md"} /> } />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</div>
				<Footer />
			</Router>
		</ZipCodeProvider>
	);
}

export default App;
