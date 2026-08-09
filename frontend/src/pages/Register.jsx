import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import { Train, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
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
            <div className="auth-card card fade-in">
                <div className="auth-header">
                    <div className="auth-logo"><Train size={28} /></div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join millions of happy travellers</p>
                </div>

                <form onSubmit={submit} className="auth-form">
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label"><User size={13} /> Username</label>
                        <input className="form-input" name="username" placeholder="Choose a username" value={form.username} onChange={handle} />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Mail size={13} /> Email Address</label>
                        <input className="form-input" name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handle} />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Lock size={13} /> Password</label>
                        <div className="pw-wrapper">
                            <input
                                className="form-input"
                                type={showPw ? "text" : "password"}
                                name="password"
                                placeholder="Min. 8 characters"
                                value={form.password}
                                onChange={handle}
                            />
                            <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
