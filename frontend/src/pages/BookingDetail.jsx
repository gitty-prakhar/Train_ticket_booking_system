import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingByPNR, cancelBooking } from "../api";
import { ArrowLeft, Ticket, MapPin, User, IndianRupee, ShieldAlert } from "lucide-react";
import "./BookingDetail.css";

export default function BookingDetail() {
    const { pnr } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await getBookingByPNR(pnr);
                setBooking(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch details.");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [pnr]);

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        setCancelling(true);
        try {
            await cancelBooking(booking._id);
            const res = await getBookingByPNR(pnr);
            setBooking(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Cancellation failed.");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <div className="page"><div className="spinner-wrapper"><div className="spinner"></div></div></div>;
    if (error) return <div className="page container"><div className="alert alert-error">{error}</div></div>;
    if (!booking) return null;

    return (
        <div className="page">
            <div className="container" style={{maxWidth: 800}}>
                <button className="btn btn-secondary btn-sm" style={{marginBottom: 24}} onClick={() => navigate("/bookings")}>
                    <ArrowLeft size={16} /> Back to Bookings
                </button>

                <div className="ticket-card glass-panel fade-in">
                    
                    {/* Ticket Header */}
                    <div className="ticket-header">
                        <div className="ticket-brand">
                            <Ticket size={24} className="text-accent" /> E-Ticket
                        </div>
                        <div className="ticket-pnr font-mono">PNR: {booking.pnr}</div>
                    </div>

                    <div className="ticket-body">
                        {/* Status Strip */}
                        <div className={`status-strip ${booking.status.toLowerCase()}`}>
                            Status: {booking.status}
                            {booking.status === "Waitlisted" && ` (WL-${booking.waitlistNumber})`}
                        </div>

                        {/* Route Info */}
                        <div className="ticket-route grid-3">
                            <div>
                                <p className="t-label">Boarding</p>
                                <h3 className="t-station">{booking.boardingStationId?.name} ({booking.boardingStationId?.code})</h3>
                                <p className="t-time">{new Date(booking.travelDate).toLocaleDateString("en-IN")}</p>
                            </div>
                            <div className="t-class">
                                <span>{booking.coachType}</span>
                            </div>
                            <div className="text-right">
                                <p className="t-label">Destination</p>
                                <h3 className="t-station">{booking.destinationStationId?.name} ({booking.destinationStationId?.code})</h3>
                            </div>
                        </div>

                        <div className="divider" style={{margin:"32px 0"}}></div>

                        {/* Passengers */}
                        <div className="ticket-passengers">
                            <h4 className="t-section-title">Passenger Details</h4>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Status</th><th>Seat</th></tr></thead>
                                    <tbody>
                                        {booking.passengers.map((p, i) => (
                                            <tr key={i}>
                                                <td style={{color:"#fff", fontWeight:600}}>{p.name}</td>
                                                <td>{p.age}</td>
                                                <td>{p.gender}</td>
                                                <td>
                                                    <span className={`badge ${p.seatId ? 'badge-success' : 'badge-warning'}`}>
                                                        {p.seatId ? "CNF" : "WL"}
                                                    </span>
                                                </td>
                                                <td className="font-mono text-accent" style={{fontWeight:700}}>
                                                    {p.seatId ? p.seatId.seatNumber : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Fare & Actions */}
                        <div className="ticket-footer">
                            <div className="t-fare">
                                <span>Total Paid</span>
                                <h2>₹{booking.totalFare.toLocaleString("en-IN")}</h2>
                            </div>
                            
                            {booking.status !== "Cancelled" && (
                                <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                                    {cancelling ? "Processing..." : "Cancel Ticket"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
