import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api";
import { Train, Mail, Lock, Eye, EyeOff } from "lucide-react";
import "./Auth.css";

export default function Login() {
    const [form, setForm]   = useState({ email: "", password: "" });
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
            <div className="auth-card card fade-in">
                <div className="auth-header">
                    <div className="auth-logo"><Train size={28} /></div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to book your next journey</p>
                </div>

                <form onSubmit={submit} className="auth-form">
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label"><Mail size={13} /> Email or Username</label>
                        <input
                            className="form-input"
                            name="email"
                            placeholder="Enter email or username"
                            value={form.email}
                            onChange={handle}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Lock size={13} /> Password</label>
                        <div className="pw-wrapper">
                            <input
                                className="form-input"
                                type={showPw ? "text" : "password"}
                                name="password"
                                placeholder="Enter password"
                                value={form.password}
                                onChange={handle}
                                autoComplete="current-password"
                            />
                            <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="auth-meta">
                        <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                    <p className="auth-footer">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
