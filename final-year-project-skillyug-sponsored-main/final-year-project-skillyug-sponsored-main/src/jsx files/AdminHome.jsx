import React, { useState } from 'react';
import '../css files/AdminHome.css';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState('overview');



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
