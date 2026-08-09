import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../api";
import { Ticket, Calendar, ArrowRight, TrainFront } from "lucide-react";
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

    if (loading) return <div className="page"><div className="spinner-wrapper"><div className="spinner"></div></div></div>;

    return (
        <div className="page">
            <div className="container">
                <div className="section-title">My Bookings</div>
                
                {error && <div className="alert alert-error" style={{marginBottom: 24}}>{error}</div>}

                {bookings.length === 0 ? (
                    <div className="empty-state glass-panel fade-in">
                        <Ticket size={48} />
                        <h3>No Bookings Found</h3>
                        <p>You haven't booked any train tickets yet.</p>
                        <Link to="/" className="btn btn-primary" style={{marginTop: 20}}>Search Trains</Link>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((b, i) => (
                            <Link to={`/bookings/${b.pnr}`} key={b._id} className={`booking-card glass-panel fade-in stagger-${(i%3)+1}`}>
                                <div className="b-header">
                                    <div className="b-pnr font-mono">PNR: {b.pnr}</div>
                                    <div className={`badge ${b.status === 'Confirmed' ? 'badge-success' : b.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                                        {b.status}
                                    </div>
                                </div>
                                
                                <div className="b-route">
                                    <div className="b-station">
                                        <div className="b-code font-mono">{b.boardingStationId?.code}</div>
                                    </div>
                                    <div className="b-arrow"><ArrowRight size={16} /></div>
                                    <div className="b-station text-right">
                                        <div className="b-code font-mono">{b.destinationStationId?.code}</div>
                                    </div>
                                </div>
                                
                                <div className="b-footer">
                                    <div className="b-info"><Calendar size={14}/> {new Date(b.travelDate).toLocaleDateString("en-IN", {day:'numeric', month:'short'})}</div>
                                    <div className="b-info"><TrainFront size={14}/> {b.coachType}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
