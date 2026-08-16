import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api";
import { Train, Eye, EyeOff, ArrowRight } from "lucide-react";
import "./Auth.css";

export default function Login() {
    const [form, setForm]     = useState({ email: "", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState("");
    const { login }   = useAuth();
    const navigate    = useNavigate();

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.email || !form.password) { setError("All fields are required."); return; }
        setLoading(true);
        try {
            const res = await loginUser(form);
            login(res.data.data.user, res.data.data.accessToken);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left Brand Panel */}
            <div className="auth-brand">
                <div className="auth-brand-top">
                    <Link to="/" className="auth-brand-logo">
                        <Train size={22} color="var(--accent)" />
                        IRCTC Pro
                    </Link>
                    <h1>Your journey<br />starts here.</h1>
                    <p>
                        Book train tickets, track PNR status, and manage all your travel
                        in one beautifully designed app.
                    </p>
                    <div className="auth-brand-features">
                        <div className="auth-feature"><span className="auth-feature-dot" /> Instant seat locks via Redis</div>
                        <div className="auth-feature"><span className="auth-feature-dot" /> Secure Razorpay payments</div>
                        <div className="auth-feature"><span className="auth-feature-dot" /> AWS S3 E-Ticket PDFs</div>
                        <div className="auth-feature"><span className="auth-feature-dot" /> WhatsApp booking alerts</div>
                    </div>
                </div>
                <div className="auth-brand-footer">© 2026 IRCTC Pro. All rights reserved.</div>
            </div>

            {/* Right Form Panel */}
            <div className="auth-form-panel">
                <div className="auth-form-box fade-in">
                    <div className="auth-form-header">
                        <h2>Welcome back</h2>
                        <p>Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={submit} className="auth-form">
                        {error && <div className="alert alert-error">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Email or Username</label>
                            <input
                                className="form-input"
                                name="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handle}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                <label className="form-label">Password</label>
                                <Link to="/forgot-password" style={{fontSize:'12px',color:'var(--text-accent)'}}>Forgot password?</Link>
                            </div>
                            <div style={{position:'relative'}}>
                                <input
                                    className="form-input"
                                    type={showPw ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handle}
                                    autoComplete="current-password"
                                    style={{paddingRight: 44}}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex',alignItems:'center'}}
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
                            {loading ? "Signing in..." : <><span>Sign In</span> <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account? <Link to="/register">Create one for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
