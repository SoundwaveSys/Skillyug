import React from 'react';
import '../css files/AdminHome.css';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

const AdminHome = () => {
  return (
    <div className="admin-home">
     <AdminNavbar />
      <div className="admin-content">
        
        </div>
        <Footer />
    </div>
  );
};

export default AdminHome;
