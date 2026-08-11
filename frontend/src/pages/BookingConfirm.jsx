import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking, createOrder, verifyPayment, getAllStations } from "../api";
import { Users, CreditCard, Ticket, ShieldCheck, MapPin, Plus, Trash2, ShieldAlert } from "lucide-react";
import "./BookingConfirm.css";

export default function BookingConfirm() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [passengers, setPassengers] = useState([
        { name: "", age: "", gender: "Male", berthPreference: "No Preference" }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Full station IDs are needed for booking, but state only has codes (from search).
    const [boardingStationId, setBoardingStationId] = useState("");
    const [destinationStationId, setDestinationStationId] = useState("");

    useEffect(() => {
        if (!state) { navigate("/"); return; }
        
        const fetchStationIds = async () => {
            try {
                const res = await getAllStations();
                const allSt = res.data.data;
                const b = allSt.find(s => s.code === state.from);
                const d = allSt.find(s => s.code === state.to);
                if (b) setBoardingStationId(b._id);
                if (d) setDestinationStationId(d._id);
            } catch (err) {
                console.error("Failed to map station codes to IDs");
            }
        };
        fetchStationIds();
    }, [state, navigate]);

    if (!state) return null;

    const addPassenger = () => {
        if (passengers.length >= 6) {
            setError("Maximum 6 passengers allowed per booking.");
            return;
        }
        setPassengers([...passengers, { name: "", age: "", gender: "Male", berthPreference: "No Preference" }]);
    };

    const removePassenger = (index) => {
        const newP = [...passengers];
        newP.splice(index, 1);
        setPassengers(newP);
    };

    const handlePassengerChange = (index, field, value) => {
        const newP = [...passengers];
        newP[index][field] = value;
        setPassengers(newP);
    };

    const totalFare = passengers.reduce((total, p) => {
        const age = Number(p.age) || 25;
        if (age < 5) return total;
        if (age >= 5 && age <= 12) return total + Math.max(Math.round(state.farePerPerson / 2), 30);
        return total + state.farePerPerson;
    }, 0);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleConfirmBooking = async () => {
        if (!boardingStationId || !destinationStationId) {
            setError("Station data is still loading or invalid.");
            return;
        }
        
        // Validation
        for (let p of passengers) {
            if (!p.name || !p.age) {
                setError("Please fill all passenger details.");
                return;
            }
        }
        if (passengers.length > state.availableSeats) {
            setError(`Only ${state.availableSeats} seats available. You selected ${passengers.length}.`);
            return;
        }

        setLoading(true); setError("");
        try {
            // 1. Create Booking in DB
            const payload = {
                scheduleId: state.scheduleId,
                boardingStationId,
                destinationStationId,
                coachType: state.coachType,
                passengers: passengers.map(p => ({ ...p, age: Number(p.age) }))
            };
            const res = await createBooking(payload);
            const booking = res.data.data;
            
            // 2. Load Razorpay script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                setError("Failed to load Razorpay SDK. Check your connection.");
                setLoading(false);
                return;
            }

            // 3. Create Razorpay order on backend
            const orderRes = await createOrder({ bookingId: booking._id });
            const { orderId, amount, currency, keyId, pnr } = orderRes.data.data;

            // 4. Open Razorpay Widget
            const options = {
                key: keyId, 
                amount: amount,
                currency: currency,
                name: "IRCTC Next-Gen",
                description: `Ticket Booking - PNR: ${pnr}`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: booking._id
                        });
                        navigate(`/bookings/${pnr}`, { replace: true });
                    } catch (err) {
                        setError("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: passengers[0]?.name || "Passenger",
                    contact: "9999999999"
                },
                theme: { color: "#3b82f6" },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        navigate(`/bookings/${pnr}`, { replace: true });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                setError(response.error.description);
            });
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.message || "Booking failed.");
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="booking-layout">
                    
                    {/* Left Column: Journey & Passenger Details */}
                    <div className="booking-main">
                        <div className="section-title" style={{marginBottom: 24}}>Review Booking</div>
                        
                        {error && <div className="alert alert-error" style={{marginBottom: 20}}><ShieldAlert size={18}/> {error}</div>}

                        <div className="glass-panel journey-summary">
                            <div className="train-badge">
                                <span>{state.train.trainNumber}</span>
                                {state.train.trainName}
                            </div>
                            
                            <div className="journey-route">
                                <div className="j-station">
                                    <div className="j-time">{state.fromStation.departureTime}</div>
                                    <div className="j-code">{state.from}</div>
                                </div>
                                <div className="j-line">
                                    <div className="j-date">{new Date(state.journeyDate).toLocaleDateString("en-IN", {day:'numeric', month:'short'})}</div>
                                    <div className="j-duration">Direct</div>
                                </div>
                                <div className="j-station text-right">
                                    <div className="j-time">{state.toStation.arrivalTime}</div>
                                    <div className="j-code">{state.to}</div>
                                </div>
                            </div>
                            <div className="j-class-info">
                                <span>Class: <strong>{state.coachType}</strong></span>
                                <span>Available: <strong className="text-success">{state.availableSeats} Seats</strong></span>
                            </div>
                        </div>

                        <div className="glass-panel passenger-section">
                            <div className="passenger-header">
                                <h3><Users size={20} /> Passenger Details</h3>
                                <button className="btn btn-secondary btn-sm" onClick={addPassenger} disabled={passengers.length >= 6}>
                                    <Plus size={16} /> Add Passenger
                                </button>
                            </div>
                            
                            <div className="passenger-list">
                                {passengers.map((p, index) => (
                                    <div key={index} className="passenger-form fade-in">
                                        <div className="p-header">
                                            <span>Passenger {index + 1}</span>
                                            {index > 0 && (
                                                <button className="btn-icon text-danger" onClick={() => removePassenger(index)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid-4 p-fields">
                                            <div className="form-group" style={{gridColumn: "span 2"}}>
                                                <label className="form-label">Full Name</label>
                                                <input className="form-input" placeholder="Name" value={p.name} onChange={e=>handlePassengerChange(index,'name',e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Age</label>
                                                <input type="number" className="form-input" placeholder="Age" value={p.age} onChange={e=>handlePassengerChange(index,'age',e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Gender</label>
                                                <select className="form-select" value={p.gender} onChange={e=>handlePassengerChange(index,'gender',e.target.value)}>
                                                    <option>Male</option><option>Female</option><option>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Fare Summary */}
                    <div className="booking-sidebar">
                        <div className="glass-panel fare-summary">
                            <h3>Fare Summary</h3>
                            
                            <div className="fare-row">
                                <span>Ticket Fare ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})</span>
                                <span>₹{totalFare.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="fare-row text-success">
                                <span>Convenience Fee</span>
                                <span>Free</span>
                            </div>
                            
                            <div className="divider"></div>
                            
                            <div className="fare-total">
                                <span>Total Amount</span>
                                <span>₹{totalFare.toLocaleString("en-IN")}</span>
                            </div>

                            <button className="btn btn-primary btn-block confirm-btn" onClick={handleConfirmBooking} disabled={loading}>
                                {loading ? <div className="spinner" style={{width:20,height:20,borderWidth:2}}></div> : <><CreditCard size={18}/> Pay & Book</>}
                            </button>
                            
                            <div className="secure-badge">
                                <ShieldCheck size={16} className="text-success" />
                                <span>Safe and Secure Payments. 100% Authentic.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
