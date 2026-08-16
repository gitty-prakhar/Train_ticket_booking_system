import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../api";
import { Ticket, Calendar, TrainFront, ArrowRight, MapPin } from "lucide-react";
import "./MyBookings.css";

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await getMyBookings();
                setBookings(res.data.data.bookings || []);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch bookings.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="page"><div className="spinner-wrapper"><div className="spinner" /></div></div>;

    return (
        <div className="page">
            <div className="container">
                <div className="bookings-header">
                    <div>
                        <h1 className="page-title">My Bookings</h1>
                        <p style={{fontSize:14,color:'var(--text-muted)',marginTop:4}}>
                            {bookings.length} {bookings.length === 1 ? "ticket" : "tickets"} found
                        </p>
                    </div>
                    <Link to="/" className="btn btn-primary"><TrainFront size={16} /> Book New Ticket</Link>
                </div>

                {error && <div className="alert alert-error" style={{marginBottom: 24}}>{error}</div>}

                {bookings.length === 0 ? (
                    <div className="empty-state card" style={{padding:60}}>
                        <Ticket size={40} style={{margin:'0 auto 16px',opacity:.3,display:'block'}} />
                        <h3>No bookings yet</h3>
                        <p>You haven't booked any train tickets yet. Search for trains to get started.</p>
                        <Link to="/" className="btn btn-primary" style={{marginTop:20,display:'inline-flex'}}>Search Trains</Link>
                    </div>
                ) : (
                    <div>
                        {bookings.map((b, i) => (
                            <Link to={`/bookings/${b.pnr}`} key={b._id} className="booking-card" style={{display:'block',textDecoration:'none'}}>
                                <div className="booking-card-top">
                                    <div>
                                        <span className="booking-pnr">{b.pnr}</span>
                                    </div>
                                    <div className="booking-route">
                                        <span>{b.boardingStationId?.code}</span>
                                        <ArrowRight size={14} style={{color:'var(--text-muted)'}} />
                                        <span>{b.destinationStationId?.code}</span>
                                    </div>
                                    <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto'}}>
                                        <span className="badge badge-blue">{b.coachType}</span>
                                        <span className={`badge ${b.status==="Confirmed"?"badge-success":b.status==="Cancelled"?"badge-danger":"badge-warning"}`}>{b.status}</span>
                                    </div>
                                    <div style={{fontWeight:700,color:'var(--text-primary)',fontSize:15}}>
                                        ₹{b.totalFare?.toLocaleString("en-IN")}
                                    </div>
                                </div>
                                <div className="booking-meta">
                                    <div className="booking-meta-item">
                                        <Calendar size={13} />
                                        {b.travelDate ? new Date(b.travelDate).toLocaleDateString("en-IN", {day:'numeric',month:'long',year:'numeric'}) : "—"}
                                    </div>
                                    <div className="booking-meta-item">
                                        <MapPin size={13} />
                                        {b.boardingStationId?.name || b.boardingStationId?.code} → {b.destinationStationId?.name || b.destinationStationId?.code}
                                    </div>
                                    <div className="booking-meta-item" style={{marginLeft:'auto',color:'var(--text-accent)',fontWeight:600}}>
                                        View details →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
