// src/components/Sidebar/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, closeSidebar }) {
	return (
		<>
			<nav id="sidebar" className={`sidebar ${isOpen ? 'active' : ''}`}>
				<ul>
					<li>
						<NavLink
							to="/"
							onClick={closeSidebar}
							className={({ isActive }) => (isActive ? 'active' : '')}
						>
							Home
						</NavLink>
					</li>
					<li>
						<NavLink
							to="/bills"
							onClick={closeSidebar}
							className={({ isActive }) => (isActive ? 'active' : '')}
						>
							Bills
						</NavLink>
					</li>
					<li>
						<NavLink
							to="/reps"
							onClick={closeSidebar}
							className={({ isActive }) => (isActive ? 'active' : '')}
						>
							Reps
						</NavLink>
					</li>
				</ul>
			</nav>
			{isOpen && <div className="overlay" onClick={closeSidebar}></div>}
		</>
	);
}

export default Sidebar;
