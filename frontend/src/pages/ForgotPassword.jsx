import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../api";
import { Train, Mail, Lock } from "lucide-react";
import "./Auth.css";

export default function ForgotPassword() {
    const [step, setStep]     = useState(1); // 1=email, 2=reset
    const [email, setEmail]   = useState("");
    const [otp, setOtp]       = useState("");
    const [newPw, setNewPw]   = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const sendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await forgotPassword({ email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const resetPw = async (e) => {
        e.preventDefault();
        setError("");
        if (newPw.length < 8) { setError("Password must be at least 8 characters."); return; }
        setLoading(true);
        try {
            await resetPassword({ email, otp, newPassword: newPw });
            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1800);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card card fade-in">
                <div className="auth-header">
                    <div className="auth-logo"><Train size={28} /></div>
                    <h1 className="auth-title">{step === 1 ? "Forgot Password" : "Reset Password"}</h1>
                    <p className="auth-subtitle">
                        {step === 1
                            ? "Enter your email and we'll send you an OTP"
                            : "Enter the OTP sent to your email and your new password"}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={sendOtp} className="auth-form">
                        {error && <div className="alert alert-error">{error}</div>}
                        <div className="form-group">
                            <label className="form-label"><Mail size={13} /> Email Address</label>
                            <input className="form-input" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                        <p className="auth-footer"><Link to="/login">Back to Login</Link></p>
                    </form>
                ) : (
                    <form onSubmit={resetPw} className="auth-form">
                        {error   && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        <div className="form-group">
                            <label className="form-label">OTP Code</label>
                            <input className="form-input" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                        </div>
                        <div className="form-group">
                            <label className="form-label"><Lock size={13} /> New Password</label>
                            <input className="form-input" type="password" placeholder="Min. 8 characters" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
