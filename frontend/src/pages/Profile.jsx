import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api";
import { User, Lock, Mail, Activity, AlertCircle, CheckCircle } from "lucide-react";
import "./Profile.css";

export default function Profile() {
    const { user } = useAuth();
    
    const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!user) return null;

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");

        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (form.newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        try {
            await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
            setSuccess("Password updated successfully!");
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page fade-in">
            <div className="container" style={{maxWidth: 800}}>
                <div className="section-title">My Profile</div>

                <div className="profile-layout grid-2">
                    
                    {/* User Info Card */}
                    <div className="glass-panel profile-card">
                        <div className="profile-avatar">
                            <User size={48} />
                        </div>
                        <h2 className="profile-name">{user.username}</h2>
                        <div className="profile-badge badge badge-blue">{user.role}</div>

                        <div className="profile-details">
                            <div className="p-detail">
                                <Mail size={16} /> 
                                <span>{user.email}</span>
                            </div>
                            <div className="p-detail">
                                <Activity size={16} /> 
                                <span>Wallet Balance: <strong>₹{user.wallet?.toLocaleString("en-IN") || 0}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="glass-panel password-card">
                        <div className="password-header">
                            <Lock size={20} className="text-accent" />
                            <h3>Change Password</h3>
                        </div>

                        {error && <div className="alert alert-error" style={{marginBottom: 16}}><AlertCircle size={16} /> {error}</div>}
                        {success && <div className="alert alert-success" style={{marginBottom: 16}}><CheckCircle size={16} /> {success}</div>}

                        <form onSubmit={submit} className="password-form">
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input className="form-input" type="password" name="oldPassword" value={form.oldPassword} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input className="form-input" type="password" name="newPassword" value={form.newPassword} onChange={handle} required minLength={8} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input className="form-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handle} required minLength={8} />
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{marginTop: 16}}>
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
