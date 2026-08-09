import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPayments } from "../api";
import { CreditCard, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import "./Payments.css";

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await getMyPayments();
                setPayments(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch payments.");
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) return <div className="page"><div className="spinner-wrapper"><div className="spinner"></div></div></div>;

    return (
        <div className="page">
            <div className="container" style={{maxWidth: 900}}>
                <button className="btn btn-secondary btn-sm" style={{marginBottom: 24}} onClick={() => window.history.back()}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="section-title" style={{display:"flex", alignItems:"center", gap:12}}>
                    <CreditCard size={28} className="text-accent" /> My Payments
                </div>
                
                {error && <div className="alert alert-error" style={{marginBottom: 24}}>{error}</div>}

                {payments.length === 0 ? (
                    <div className="empty-state glass-panel fade-in">
                        <CreditCard size={48} />
                        <h3>No Payments Found</h3>
                        <p>You haven't made any transactions yet.</p>
                        <Link to="/" className="btn btn-primary" style={{marginTop: 20}}>Book a Ticket</Link>
                    </div>
                ) : (
                    <div className="payments-list">
                        {payments.map((p, i) => (
                            <div key={p._id} className={`payment-card glass-panel fade-in stagger-${(i%3)+1}`}>
                                <div className="p-card-header">
                                    <div className="p-transaction-id font-mono">TXN: {p._id}</div>
                                    <div className={`badge ${p.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                        {p.status}
                                    </div>
                                </div>
                                
                                <div className="p-card-body">
                                    <div className="p-amount">
                                        <span className="label">Amount</span>
                                        <h2>₹{p.amount.toLocaleString("en-IN")}</h2>
                                    </div>
                                    
                                    <div className="p-details grid-3">
                                        <div>
                                            <span className="label">Booking PNR</span>
                                            <div className="font-mono" style={{fontWeight:700, color:"#fff"}}>
                                                {p.bookingId ? <Link to={`/bookings/${p.bookingId.pnr}`}>{p.bookingId.pnr}</Link> : "N/A"}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="label">Payment Method</span>
                                            <div style={{fontWeight:600, color:"#fff"}}>{p.method}</div>
                                        </div>
                                        <div>
                                            <span className="label">Date</span>
                                            <div style={{fontWeight:600, color:"var(--text-secondary)"}}>
                                                {new Date(p.createdAt).toLocaleDateString("en-IN", {day:'numeric', month:'short', year:'numeric'})}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
