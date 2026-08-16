import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api";
import { Lock, Mail, Wallet, Shield, CheckCircle, AlertCircle } from "lucide-react";
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
        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) { setError("All fields are required."); return; }
        if (form.newPassword !== form.confirmPassword) { setError("New passwords do not match."); return; }
        if (form.newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
        setLoading(true);
        try {
            await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
            setSuccess("Password updated successfully!");
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password.");
        } finally { setLoading(false); }
    };

    return (
        <div className="page fade-in">
            <div className="container" style={{maxWidth: 960}}>
                <h1 className="page-title" style={{marginBottom:28}}>Profile</h1>

                <div className="profile-layout">
                    {/* Sidebar */}
                    <div className="profile-sidebar-card">
                        <div className="profile-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <p className="profile-name">{user.username}</p>
                        <p className="profile-email">{user.email}</p>
                        <span className={`badge ${user.role==="admin"?"badge-warning":"badge-blue"}`} style={{margin:'0 auto 20px'}}>
                            {user.role}
                        </span>
                        <div className="profile-divider" />
                        <div className="profile-stat">
                            <span className="profile-stat-label">Wallet</span>
                            <span className="profile-stat-value">₹{(user.wallet || 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="profile-stat">
                            <span className="profile-stat-label">Phone</span>
                            <span className="profile-stat-value">{user.phone || "—"}</span>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="profile-main-card">
                        <p className="profile-section-title">Account Details</p>
                        <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:32}}>
                            <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:'var(--bg-secondary)',borderRadius:'var(--radius)',border:'1px solid var(--border-subtle)'}}>
                                <Mail size={16} color="var(--text-muted)" />
                                <div>
                                    <p style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.5,fontWeight:700}}>Email</p>
                                    <p style={{fontSize:14,color:'var(--text-primary)',fontWeight:500,marginTop:2}}>{user.email}</p>
                                </div>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:'var(--bg-secondary)',borderRadius:'var(--radius)',border:'1px solid var(--border-subtle)'}}>
                                <Wallet size={16} color="var(--text-muted)" />
                                <div>
                                    <p style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.5,fontWeight:700}}>Wallet Balance</p>
                                    <p style={{fontSize:14,color:'var(--success)',fontWeight:700,marginTop:2}}>₹{(user.wallet || 0).toLocaleString("en-IN")}</p>
                                </div>
                            </div>
                        </div>

                        <p className="profile-section-title">Change Password</p>
                        {error   && <div className="alert alert-error"   style={{marginBottom:16}}><AlertCircle size={15} /> {error}</div>}
                        {success && <div className="alert alert-success" style={{marginBottom:16}}><CheckCircle size={15} /> {success}</div>}
                        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input className="form-input" type="password" name="oldPassword" placeholder="Enter current password" value={form.oldPassword} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input className="form-input" type="password" name="newPassword" placeholder="Min. 8 characters" value={form.newPassword} onChange={handle} required minLength={8} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input className="form-input" type="password" name="confirmPassword" placeholder="Repeat new password" value={form.confirmPassword} onChange={handle} required />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{alignSelf:'flex-start',marginTop:4}}>
                                <Lock size={15} /> {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
