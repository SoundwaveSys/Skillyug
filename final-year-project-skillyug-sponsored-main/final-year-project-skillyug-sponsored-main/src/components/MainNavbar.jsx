import React, { useState } from "react";
import "./MainNavbar.css";
import { Link } from "react-router-dom";

const MainNavbar = () => {
	const [open, setOpen] = useState(false);

	const toggle = () => setOpen((s) => !s);
	const close = () => setOpen(false);

	return (
		<nav className="main-navbar">
			<div className="mainnavbar-logo">
				<Link to="/home" onClick={close}>
					<img src="assets/skillyug-rebrand-logo.png" alt="Logo" style={{height: '50px', marginTop: '10px'}} />
				</Link>
			</div>

			<button
				className={`main-navbar-toggle ${open ? 'open' : ''}`}
				aria-label="Toggle navigation"
				aria-expanded={open}
				onClick={toggle}
			>
				<span className="bar" />
				<span className="bar" />
				<span className="bar" />
			</button>

			<ul className={`main-navbar-menu ${open ? "open" : ""}`}>
				{/* <li><Link to="/settings" onClick={close}>Settings</Link></li> */}
				<li><Link to="/statistics" onClick={close}>Statistics</Link></li>
				<li><Link to="/practice" onClick={close}>Practice</Link></li>
				<li><Link to="/exams" onClick={close}>Exams</Link></li>
				
				<li><Link to="/profile" onClick={close}>Profile</Link></li>
				<li><Link to="/" className="nav-link" onClick={close}>Log Out</Link></li>
			</ul>
		</nav>
	);
};

export default MainNavbar;