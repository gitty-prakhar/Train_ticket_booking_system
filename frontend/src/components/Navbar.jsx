import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Train, User, LogOut, Ticket, Settings, Wallet } from "lucide-react";
import "./Navbar.css";
import { useState } from "react";
import { logoutUser } from "../api";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdown, setDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <Train size={28} className="logo-icon" />
                    <span className="logo-text">IRCTC</span>
                    <span className="logo-dot"></span>
                </Link>

                <div className="nav-links">
                    {user ? (
                        <>
                            {user.role === "admin" && (
                                <Link to="/admin" className="nav-link admin-link">
                                    <Settings size={16} /> Admin Panel
                                </Link>
                            )}
                            
                            <Link to="/payments" className="nav-wallet" style={{textDecoration: 'none', color: 'inherit'}}>
                                <Wallet size={16} />
                                <span>₹{(user.wallet || 0).toLocaleString("en-IN")}</span>
                            </Link>

                            <div className="nav-profile-container" onMouseEnter={() => setDropdown(true)} onMouseLeave={() => setDropdown(false)}>
                                <button className="nav-profile-btn">
                                    <div className="avatar">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="username">{user.username}</span>
                                </button>
                                
                                {dropdown && (
                                    <div className="nav-dropdown fade-in">
                                        <div className="dropdown-header">
                                            <p className="dropdown-email">{user.email}</p>
                                        </div>
                                        <Link to="/profile" className="dropdown-item">
                                            <User size={16} /> Profile
                                        </Link>
                                        <Link to="/bookings" className="dropdown-item">
                                            <Ticket size={16} /> My Bookings
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={handleLogout} className="dropdown-item text-danger">
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-secondary">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
