import React, { useState } from "react";
import "./AdminNavbar.css";
import { Link } from "react-router-dom";

const AdminNavbar = () => {
	const [open, setOpen] = useState(false);

	const toggle = () => setOpen((s) => !s);
	const close = () => setOpen(false);

	return (
		<nav className="admin-navbar">
			<div className="admin-navbar-logo">
				<Link to="/home" onClick={close}>
					<img src="assets/skillyug-rebrand-logo.png" alt="Logo" style={{height: '50px', marginTop: '10px'}} />
				</Link>
			</div>

			<button
				className={`admin-navbar-toggle ${open ? 'open' : ''}`}
				aria-label="Toggle navigation"
				aria-expanded={open}
				onClick={toggle}
			>
				<span className="bar" />
				<span className="bar" />
				<span className="bar" />
			</button>

			<ul className={`admin-navbar-menu ${open ? "open" : ""}`}>
				<li><Link to="/settings" onClick={close}>Create Tests</Link></li>
				<li><Link to="/statistics" onClick={close}>Manage Users</Link></li>
				<li><Link to="/practice" onClick={close}>Discussions</Link></li>
				<li><Link to="/learning" onClick={close}>Analytics</Link></li>
				<li><Link to="/profile" onClick={close}>Add Tests</Link></li>
				<li><Link to="/" className="nav-link" onClick={close}>Log Out</Link></li>
			</ul>
		</nav>
	);
};

export default AdminNavbar;