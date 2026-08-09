import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyOtp } from "../api";
import { Train, ShieldCheck } from "lucide-react";
import "./Auth.css";

export default function VerifyOtp() {
    const location  = useLocation();
    const navigate  = useNavigate();
    const email     = location.state?.email || "";

    const [digits, setDigits]   = useState(["","","","","",""]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");
    const [success, setSuccess] = useState("");
    const refs = useRef([]);

    const handleDigit = (i, val) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...digits];
        next[i] = val;
        setDigits(next);
        if (val && i < 5) refs.current[i + 1]?.focus();
    };

    const handleKey = (i, e) => {
        if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    };

    const handlePaste = (e) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (text.length === 6) {
            setDigits(text.split(""));
            refs.current[5]?.focus();
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        const otp = digits.join("");
        if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
        setError(""); setLoading(true);
        try {
            await verifyOtp({ email, otp });
            setSuccess("Account verified! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP.");
            setDigits(["","","","","",""]);
            refs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="auth-page">
                <div className="auth-card card fade-in text-center">
                    <p className="auth-subtitle">No email found. Please <Link to="/register">register</Link> first.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card card fade-in">
                <div className="auth-header">
                    <div className="auth-logo" style={{background:"rgba(16,185,129,0.15)",color:"var(--success)"}}>
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="auth-title">Verify Your Email</h1>
                    <p className="auth-subtitle">
                        We sent a 6-digit code to<br />
                        <strong style={{color:"var(--text-primary)"}}>{email}</strong>
                    </p>
                </div>

                <form onSubmit={submit} className="auth-form">
                    {error   && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="otp-grid" onPaste={handlePaste}>
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={(el) => (refs.current[i] = el)}
                                className="otp-input"
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={d}
                                onChange={(e) => handleDigit(i, e.target.value)}
                                onKeyDown={(e) => handleKey(i, e)}
                            />
                        ))}
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? "Verifying..." : "Verify Account"}
                    </button>

                    <p className="auth-footer">
                        Didn't receive the code? <Link to="/register">Resend OTP</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
