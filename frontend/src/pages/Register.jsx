import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import { Train, Eye, EyeOff, ArrowRight } from "lucide-react";
import "./Auth.css";

export default function Register() {
    const [form, setForm]     = useState({ username: "", email: "", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState("");
    const navigate = useNavigate();

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.username || !form.email || !form.password) { setError("All fields are required."); return; }
        if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
        setLoading(true);
        try {
            await registerUser(form);
            navigate("/verify", { state: { email: form.email } });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
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
                    <h1>Join millions of<br />happy travellers.</h1>
                    <p>
                        Create your account in seconds and get access to real-time
                        train availability, smart waitlists, and instant e-tickets.
                    </p>
                    <div className="auth-brand-features">
                        <div className="auth-feature"><span className="auth-feature-dot" /> Email verified OTP registration</div>
                        <div className="auth-feature"><span className="auth-feature-dot" /> Secure password hashing</div>
                        <div className="auth-feature"><span className="auth-feature-dot" /> Wallet balance system</div>
                        <div className="auth-feature"><span className="auth-feature-dot" /> Booking history & PNR tracking</div>
                    </div>
                </div>
                <div className="auth-brand-footer">© 2026 IRCTC Pro. All rights reserved.</div>
            </div>

            {/* Right Form Panel */}
            <div className="auth-form-panel">
                <div className="auth-form-box fade-in">
                    <div className="auth-form-header">
                        <h2>Create your account</h2>
                        <p>Free forever. No credit card required.</p>
                    </div>

                    <form onSubmit={submit} className="auth-form">
                        {error && <div className="alert alert-error">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input className="form-input" name="username" placeholder="Choose a unique username" value={form.username} onChange={handle} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{position:'relative'}}>
                                <input
                                    className="form-input"
                                    type={showPw ? "text" : "password"}
                                    name="password"
                                    placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={handle}
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
                            {loading ? "Creating account..." : <><span>Create Account</span> <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
