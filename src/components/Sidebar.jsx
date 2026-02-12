import React from 'react';
import { NavLink } from 'react-router-dom';
import { FolderPlus, Layers, ArrowRightLeft, LayoutDashboard } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <LayoutDashboard size={28} />
        <h1>Filing Sys</h1>
      </div>
      <nav className="nav-menu">
        <NavLink to="/masters" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Layers size={20} />
          <span>Masters</span>
        </NavLink>
        <NavLink to="/create-file" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FolderPlus size={20} />
          <span>File Creation</span>
        </NavLink>
        <NavLink to="/movements" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ArrowRightLeft size={20} />
          <span>Movements</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <p>© 2026 Filing System</p>
      </div>
    </aside>
  );
};

export default Sidebar;
