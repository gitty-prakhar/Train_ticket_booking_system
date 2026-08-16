import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingByPNR, cancelBooking } from "../api";
import { ArrowLeft, Train, MapPin, Calendar, Clock, Users, IndianRupee, CheckCircle2, XCircle, AlertCircle, Download, Share2 } from "lucide-react";
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

    if (loading) return (
        <div className="page">
            <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <div className="spinner" />
            </div>
        </div>
    );
    if (error) return <div className="page container"><div className="alert alert-error">{error}</div></div>;
    if (!booking) return null;

    const statusConfig = {
        Confirmed: { icon: <CheckCircle2 size={18} />, cls: "confirmed", label: "CONFIRMED" },
        Waitlisted: { icon: <AlertCircle size={18} />, cls: "waitlisted", label: `WAITLISTED (WL-${booking.waitlistNumber})` },
        Cancelled: { icon: <XCircle size={18} />, cls: "cancelled", label: "CANCELLED" },
    };
    const sc = statusConfig[booking.status] || statusConfig.Confirmed;

    const travelDate = new Date(booking.travelDate).toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    return (
        <div className="page bd-page">
            <div className="bd-container">
                {/* Back Button */}
                <button className="bd-back-btn" onClick={() => navigate("/bookings")}>
                    <ArrowLeft size={16} />
                    Back to My Bookings
                </button>

                {/* Main Ticket */}
                <div className="bd-ticket fade-in">

                    {/* Ticket Top - Header */}
                    <div className="bd-ticket-top">
                        <div className="bd-ticket-brand">
                            <div className="bd-brand-icon">
                                <Train size={20} />
                            </div>
                            <div>
                                <div className="bd-brand-name">IRCTC Next-Gen</div>
                                <div className="bd-brand-sub">E-Ticket / Booking Confirmation</div>
                            </div>
                        </div>
                        <div className="bd-pnr-block">
                            <div className="bd-pnr-label">PNR NUMBER</div>
                            <div className="bd-pnr-value">{booking.pnr}</div>
                        </div>
                    </div>

                    {/* Status Banner */}
                    <div className={`bd-status-banner ${sc.cls}`}>
                        {sc.icon}
                        <span>STATUS: {sc.label}</span>
                    </div>

                    {/* Journey Section */}
                    <div className="bd-journey">
                        <div className="bd-station bd-from">
                            <div className="bd-station-label">BOARDING</div>
                            <div className="bd-station-name">{booking.boardingStationId?.name}</div>
                            <div className="bd-station-code">({booking.boardingStationId?.code})</div>
                        </div>

                        <div className="bd-journey-center">
                            <div className="bd-coach-badge">{booking.coachType}</div>
                            <div className="bd-journey-line">
                                <div className="bd-journey-dot" />
                                <div className="bd-journey-track" />
                                <Train size={16} color="var(--accent)" />
                                <div className="bd-journey-track" />
                                <div className="bd-journey-dot" />
                            </div>
                            <div className="bd-journey-date">
                                <Calendar size={13} />
                                {travelDate}
                            </div>
                        </div>

                        <div className="bd-station bd-to">
                            <div className="bd-station-label">DESTINATION</div>
                            <div className="bd-station-name">{booking.destinationStationId?.name}</div>
                            <div className="bd-station-code">({booking.destinationStationId?.code})</div>
                        </div>
                    </div>

                    {/* Perforated divider */}
                    <div className="bd-perforated">
                        <div className="bd-circle-left" />
                        <div className="bd-dashes" />
                        <div className="bd-circle-right" />
                    </div>

                    {/* Passengers Table */}
                    <div className="bd-passengers">
                        <div className="bd-section-header">
                            <Users size={16} />
                            Passenger Details
                        </div>
                        <div className="bd-table-wrap">
                            <table className="bd-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Age</th>
                                        <th>Gender</th>
                                        <th>Status</th>
                                        <th>Seat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {booking.passengers.map((p, i) => (
                                        <tr key={i}>
                                            <td className="bd-td-num">{i + 1}</td>
                                            <td className="bd-td-name">{p.name}</td>
                                            <td>{p.age}</td>
                                            <td>{p.gender}</td>
                                            <td>
                                                <span className={`bd-badge ${p.seatId ? "bd-cnf" : "bd-wl"}`}>
                                                    {p.seatId ? "CNF" : "WL"}
                                                </span>
                                            </td>
                                            <td className="bd-td-seat">
                                                {p.seatId ? p.seatId.seatNumber : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer - Fare & Actions */}
                    <div className="bd-footer">
                        <div className="bd-fare-block">
                            <div className="bd-fare-label">TOTAL PAID</div>
                            <div className="bd-fare-amount">₹{booking.totalFare.toLocaleString("en-IN")}</div>
                            <div className="bd-fare-sub">{booking.passengers.length} Passenger{booking.passengers.length > 1 ? "s" : ""} · {booking.coachType} Class</div>
                        </div>
                        <div className="bd-actions">
                            {booking.status !== "Cancelled" && (
                                <button
                                    className="bd-cancel-btn"
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                >
                                    <XCircle size={16} />
                                    {cancelling ? "Cancelling..." : "Cancel Ticket"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Decorative barcode strip */}
                    <div className="bd-barcode-strip">
                        {Array.from({ length: 60 }).map((_, i) => (
                            <div key={i} className="bd-bar" style={{ height: `${Math.random() * 28 + 8}px` }} />
                        ))}
                        <span className="bd-barcode-pnr">{booking.pnr}</span>
                    </div>
                </div>

                {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
            </div>
        </div>
    );
}
