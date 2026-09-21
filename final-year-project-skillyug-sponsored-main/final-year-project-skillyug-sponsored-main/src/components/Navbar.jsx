import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
	const [open, setOpen] = useState(false);

	const toggle = () => setOpen((s) => !s);
	const close = () => setOpen(false);

	return (
		<nav className="navbar">
			<div className="navbar-logo">
				<Link to="/" onClick={close}>
					<img src="assets/skillyug-rebrand-logo.png" alt="Logo" style={{height: '50px', marginTop: '10px'}} />
				</Link>
			</div>

			<button
				className={`navbar-toggle ${open ? 'open' : ''}`}
				aria-label="Toggle navigation"
				aria-expanded={open}
				onClick={toggle}
			>
				<span className="bar" />
				<span className="bar" />
				<span className="bar" />
			</button>

			<ul className={`navbar-menu ${open ? "open" : ""}`}>
				<li><Link to="/pricing" onClick={close}>Pricing</Link></li>
				<li><Link to="/syllabus" onClick={close}>Syllabus</Link></li>
				<li><Link to="/login" className="nav-link" onClick={close}>Login</Link></li>
			</ul>
		</nav>
	);
};

export default Navbar;
