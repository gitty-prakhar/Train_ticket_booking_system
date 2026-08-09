import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchTrains } from "../api";
import { TrainFront, Calendar, MapPin, Search, Zap, ShieldCheck, Clock } from "lucide-react";
import "./Home.css";

export default function Home() {
    const [from, setFrom] = useState("");
    const [to, setTo]     = useState("");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const res = await searchTrains(from.toUpperCase(), to.toUpperCase(), date);
            navigate("/search", { state: { results: res.data.data, from: from.toUpperCase(), to: to.toUpperCase(), date } });
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-wrapper">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="container hero-container">
                    <div className="hero-content fade-in stagger-1">
                        <div className="hero-badge">
                            <span className="live-dot"></span> Next-Gen Ticketing
                        </div>
                        <h1 className="hero-title">
                            Book Trains with<br/>
                            <span className="hero-highlight">Lightning Speed.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Experience the fastest, most secure way to book your train tickets. Real-time availability, instant confirmation, and smart waitlists.
                        </p>
                    </div>

                    <div className="hero-search fade-in stagger-2">
                        <div className="search-glass-card">
                            <h2 className="search-title">Search Trains</h2>
                            {error && <div className="alert alert-error">{error}</div>}
                            <form onSubmit={handleSearch} className="search-form">
                                <div className="search-input-group">
                                    <div className="search-icon"><MapPin size={20} /></div>
                                    <div className="search-input-wrapper">
                                        <label>From Station</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. NDLS" 
                                            value={from} 
                                            onChange={e => setFrom(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className="search-divider">
                                    <div className="search-divider-line"></div>
                                    <TrainFront size={20} className="search-divider-icon" />
                                    <div className="search-divider-line"></div>
                                </div>

                                <div className="search-input-group">
                                    <div className="search-icon"><MapPin size={20} /></div>
                                    <div className="search-input-wrapper">
                                        <label>To Station</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. BCT" 
                                            value={to} 
                                            onChange={e => setTo(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="search-input-group date-group">
                                    <div className="search-icon"><Calendar size={20} /></div>
                                    <div className="search-input-wrapper">
                                        <label>Journey Date</label>
                                        <input 
                                            type="date" 
                                            value={date} 
                                            onChange={e => setDate(e.target.value)} 
                                            min={new Date().toISOString().split("T")[0]} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-block search-btn" disabled={loading}>
                                    {loading ? (
                                        <><div className="spinner" style={{width:20,height:20,borderWidth:2}}></div> Searching...</>
                                    ) : (
                                        <><Search size={20} /> Search Trains</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section container fade-in stagger-3">
                <div className="grid-3">
                    <div className="feature-card">
                        <div className="feature-icon" style={{background: 'rgba(59,130,246,0.1)', color: '#3b82f6'}}>
                            <Zap size={28} />
                        </div>
                        <h3>Instant Booking</h3>
                        <p>Our distributed locking system ensures zero race conditions. If you select a seat, it's yours.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{background: 'rgba(16,185,129,0.1)', color: '#10b981'}}>
                            <ShieldCheck size={28} />
                        </div>
                        <h3>Secure Payments</h3>
                        <p>Enterprise-grade encryption and asynchronous payment webhooks for bulletproof transactions.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{background: 'rgba(245,158,11,0.1)', color: '#f59e0b'}}>
                            <Clock size={28} />
                        </div>
                        <h3>Smart Waitlist</h3>
                        <p>Automated queue management. Get auto-upgraded the second a confirmed passenger cancels.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
