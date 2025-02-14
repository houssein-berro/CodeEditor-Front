import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navBar.css";

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/logo.png" alt="logo" />
      </div>
      <ul className="nav-links">
       
        <li>
          <Link to="/codeEditor">Coder</Link>
        </li>
        <li>
          <Link to="/user/userCodes">My Codes</Link>
        </li>
        <li>
          <Link to="/chats">Chats</Link>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
