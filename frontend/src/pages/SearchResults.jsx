import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Train, Clock, ArrowRight, GitMerge } from "lucide-react";
import "./SearchResults.css";

export default function SearchResults() {
    const { state }   = useLocation();
    const navigate    = useNavigate();
    const { user }    = useAuth();
    const results     = state?.results || [];
    const [error, setError] = useState("");

    if (!state) return (
        <div className="page">
            <div className="container">
                <div className="empty-state">
                    <Train size={48} />
                    <h3>No search performed</h3>
                    <p><Link to="/">Go back to home</Link> and search for trains.</p>
                </div>
            </div>
        </div>
    );

    const handleSelectClass = (schedule, classInfo) => {
        if (!user) { navigate("/login"); return; }
        setError("");
        navigate("/booking/confirm", {
            state: {
                scheduleId:     schedule.scheduleId,
                train:          schedule.train,
                journeyDate:    schedule.journeyDate,
                fromStation:    schedule.fromStation,
                toStation:      schedule.toStation,
                coachType:      classInfo.coachType,
                farePerPerson:  classInfo.farePerPerson,
                availableSeats: classInfo.availableSeats,
                from: state.from,
                to:   state.to,
            }
        });
    };

    const directResults     = results.filter((r) => r.type === "direct");
    const connectingResults = results.filter((r) => r.type === "connecting");

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="results-header">
                    <div>
                        <h1 className="section-title" style={{marginBottom:8}}>
                            {state.from} <ArrowRight size={24} style={{verticalAlign:"middle", color:"var(--accent)", margin:"0 12px"}} /> {state.to}
                        </h1>
                        <p className="results-date">
                            <Calendar size={16} />
                            {new Date(state.date).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="results-count">
                        <span className="count-number">{directResults.length}</span> Direct &nbsp;·&nbsp;
                        <span className="count-number">{connectingResults.length}</span> Connecting
                    </div>
                </div>

                {error && <div className="alert alert-error" style={{marginBottom: 24}}>{error}</div>}

                {results.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <Train size={48} />
                        <h3>No Trains Available</h3>
                        <p>We couldn't find any direct or connecting trains between these stations on this date.</p>
                        <Link to="/" className="btn btn-primary" style={{marginTop: 20}}>Search Again</Link>
                    </div>
                ) : (
                    <div className="results-list">

                        {/* ── DIRECT TRAINS ─────────────────────────────────── */}
                        {directResults.length > 0 && (
                            <>
                                <div className="section-divider">
                                    <span>Direct Trains</span>
                                </div>
                                {directResults.map((schedule, i) => (
                                    <DirectTrainCard
                                        key={schedule.scheduleId}
                                        schedule={schedule}
                                        index={i}
                                        state={state}
                                        onSelectClass={handleSelectClass}
                                    />
                                ))}
                            </>
                        )}

                        {/* ── CONNECTING TRAINS ─────────────────────────────── */}
                        {connectingResults.length > 0 && (
                            <>
                                <div className="section-divider connecting">
                                    <GitMerge size={16} />
                                    <span>Connecting Routes (1 Change)</span>
                                </div>
                                {connectingResults.map((result, i) => (
                                    <ConnectingTrainCard
                                        key={`${result.leg1.scheduleId}-${result.leg2.scheduleId}`}
                                        result={result}
                                        index={i}
                                        onSelectClass={handleSelectClass}
                                    />
                                ))}
                            </>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}

// ─── DIRECT TRAIN CARD ────────────────────────────────────────────────────────

function DirectTrainCard({ schedule, index, state, onSelectClass }) {
    return (
        <div className={`train-card glass-panel fade-in stagger-${(index%3)+1}`}>
            <div className="train-header">
                <div className="train-info">
                    <div className="train-icon"><Train size={24} /></div>
                    <div>
                        <h3 className="train-name">{schedule.train.trainName}</h3>
                        <span className="train-number font-mono">{schedule.train.trainNumber}</span>
                    </div>
                </div>
                <span className="badge badge-success">Direct</span>
            </div>

            <div className="divider" style={{margin:"20px 0"}} />

            <div className="train-route">
                <div className="station-block">
                    <div className="time">{schedule.fromStation.departureTime}</div>
                    <div className="code font-mono">{schedule.fromStation.code}</div>
                </div>
                <div className="route-line-container">
                    <div className="duration"><Clock size={12} /> {schedule.distanceKm} km</div>
                    <div className="route-line"></div>
                    <div className="route-stops">Direct</div>
                </div>
                <div className="station-block text-right">
                    <div className="time">{schedule.toStation.arrivalTime}</div>
                    <div className="code font-mono">{schedule.toStation.code}</div>
                </div>
            </div>

            <ClassSelector classes={schedule.classes} schedule={schedule} onSelectClass={onSelectClass} />
        </div>
    );
}

// ─── CONNECTING TRAIN CARD ───────────────────────────────────────────────────

function ConnectingTrainCard({ result, index, onSelectClass }) {
    const { hub, leg1, leg2 } = result;

    return (
        <div className={`train-card connecting-card glass-panel fade-in stagger-${(index%3)+1}`}>

            {/* Header badge */}
            <div className="train-header">
                <div className="connecting-label">
                    <GitMerge size={18} className="text-accent" />
                    <span>Connecting Route via <strong>{hub.name} ({hub.code})</strong></span>
                </div>
                <span className="badge badge-warning">1 Change</span>
            </div>

            <div className="divider" style={{margin:"20px 0"}} />

            {/* Leg 1 */}
            <div className="leg-section">
                <div className="leg-label"><span className="leg-badge">Leg 1</span> {leg1.train.trainName} <span className="font-mono text-muted">{leg1.train.trainNumber}</span></div>
                <div className="train-route" style={{marginBottom: 0}}>
                    <div className="station-block">
                        <div className="time">{leg1.fromStation.departureTime}</div>
                        <div className="code font-mono">{leg1.fromStation.code}</div>
                    </div>
                    <div className="route-line-container">
                        <div className="duration"><Clock size={12} /> {leg1.distanceKm} km</div>
                        <div className="route-line"></div>
                    </div>
                    <div className="station-block text-right">
                        <div className="time">{leg1.toStation.arrivalTime}</div>
                        <div className="code font-mono">{leg1.toStation.code}</div>
                    </div>
                </div>
                <ClassSelector classes={leg1.classes} schedule={leg1} onSelectClass={onSelectClass} compact />
            </div>

            {/* Layover badge */}
            <div className="layover-badge">
                <Clock size={14} />
                <span>Layover at <strong>{hub.name}</strong>: {hub.layover}</span>
            </div>

            {/* Leg 2 */}
            <div className="leg-section">
                <div className="leg-label"><span className="leg-badge">Leg 2</span> {leg2.train.trainName} <span className="font-mono text-muted">{leg2.train.trainNumber}</span></div>
                <div className="train-route" style={{marginBottom: 0}}>
                    <div className="station-block">
                        <div className="time">{leg2.fromStation.departureTime}</div>
                        <div className="code font-mono">{leg2.fromStation.code}</div>
                    </div>
                    <div className="route-line-container">
                        <div className="duration"><Clock size={12} /> {leg2.distanceKm} km</div>
                        <div className="route-line"></div>
                    </div>
                    <div className="station-block text-right">
                        <div className="time">{leg2.toStation.arrivalTime}</div>
                        <div className="code font-mono">{leg2.toStation.code}</div>
                    </div>
                </div>
                <ClassSelector classes={leg2.classes} schedule={leg2} onSelectClass={onSelectClass} compact />
            </div>
        </div>
    );
}

// ─── CLASS SELECTOR ──────────────────────────────────────────────────────────

function ClassSelector({ classes, schedule, onSelectClass, compact }) {
    return (
        <div className={`classes-section ${compact ? "compact" : ""}`}>
            <h4 className="classes-title">{compact ? "Book Leg" : "Select Class"}</h4>
            <div className="classes-grid">
                {classes.map(cls => (
                    <div
                        key={cls.coachType}
                        className={`class-card ${cls.availableSeats === 0 ? "full" : ""}`}
                        onClick={() => cls.availableSeats > 0 && onSelectClass(schedule, cls)}
                    >
                        <div className="class-header">
                            <span className="class-type font-mono">{cls.coachType}</span>
                            <span className="class-fare">₹{cls.farePerPerson.toLocaleString("en-IN")}</span>
                        </div>
                        <div className={`class-seats ${cls.availableSeats < 10 && cls.availableSeats > 0 ? "low" : ""}`}>
                            {cls.availableSeats > 0 ? `AVL ${cls.availableSeats}` : "WL"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
