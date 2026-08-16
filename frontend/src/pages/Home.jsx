import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchTrains } from "../api";
import { TrainFront, Calendar, MapPin, Search, Zap, ShieldCheck, Clock, ArrowRight } from "lucide-react";
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
            setError(err.response?.data?.message || "No trains found for this route.");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: <Zap size={22} />,
            color: "#6366f1",
            bg: "rgba(99,102,241,0.1)",
            title: "Instant Booking",
            desc: "Distributed Redis locks guarantee zero race conditions. Your seat is held the moment you click.",
        },
        {
            icon: <ShieldCheck size={22} />,
            color: "#10b981",
            bg: "rgba(16,185,129,0.1)",
            title: "Secure Payments",
            desc: "Razorpay-powered checkout with signature verification on every transaction.",
        },
        {
            icon: <Clock size={22} />,
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.1)",
            title: "Smart Waitlist",
            desc: "Auto-upgraded the second a confirmed passenger cancels — no manual checking required.",
        },
    ];

    return (
        <div className="home-wrapper">
            {/* Hero */}
            <div className="hero-section">
                <div className="container hero-container">
                    <div className="fade-in stagger-1">
                        <div className="hero-eyebrow">
                            <span className="live-dot" />
                            Real-time availability
                        </div>
                        <h1 className="hero-title">
                            Book train tickets<br />
                            <span className="hero-highlight">without the chaos.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Enterprise-grade booking infrastructure. Instant seat locks, live waitlists,
                            and Razorpay-secured payments — all in one place.
                        </p>
                    </div>

                    <div className="hero-search fade-in stagger-2">
                        <div className="search-glass-card">
                            <p className="search-card-title">Search Trains</p>
                            {error && <div className="alert alert-error" style={{marginBottom: 16}}>{error}</div>}
                            <form onSubmit={handleSearch} className="search-form">
                                <div className="search-field">
                                    <MapPin size={18} className="search-field-icon" />
                                    <div className="search-field-inner">
                                        <label>From</label>
                                        <input
                                            type="text"
                                            placeholder="Station code e.g. NDLS"
                                            value={from}
                                            onChange={e => setFrom(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="search-separator">
                                    <span className="search-sep-line" />
                                    <TrainFront size={16} />
                                    <span className="search-sep-line" />
                                </div>

                                <div className="search-field">
                                    <MapPin size={18} className="search-field-icon" />
                                    <div className="search-field-inner">
                                        <label>To</label>
                                        <input
                                            type="text"
                                            placeholder="Station code e.g. CSMT"
                                            value={to}
                                            onChange={e => setTo(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="search-field">
                                    <Calendar size={18} className="search-field-icon" />
                                    <div className="search-field-inner">
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
                                        <><div className="spinner" style={{width:18,height:18,borderWidth:2}} /> Searching...</>
                                    ) : (
                                        <><Search size={18} /> Search Trains</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats strip */}
            <div className="stats-strip">
                <div className="container">
                    <div className="stats-inner">
                        <div className="stat-item">
                            <span className="value">100K+</span>
                            <span className="label">Tickets Booked</span>
                        </div>
                        <div className="stat-item">
                            <span className="value">500+</span>
                            <span className="label">Train Routes</span>
                        </div>
                        <div className="stat-item">
                            <span className="value">99.9%</span>
                            <span className="label">Uptime</span>
                        </div>
                        <div className="stat-item">
                            <span className="value">&lt; 2s</span>
                            <span className="label">Booking Time</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="features-section">
                <div className="container">
                    <div className="features-header fade-in">
                        <h2>Built for reliability at scale.</h2>
                        <p>Every component is designed to handle peak demand — so your booking never fails.</p>
                    </div>
                    <div className="grid-3">
                        {features.map((f, i) => (
                            <div key={i} className={`feature-card fade-in stagger-${i + 1}`}>
                                <div className="feature-icon-wrap" style={{background: f.bg, color: f.color}}>
                                    {f.icon}
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
