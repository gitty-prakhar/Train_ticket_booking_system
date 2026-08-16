import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Calendar, Train, Clock, ArrowRight, GitMerge, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./SearchResults.css";

export default function SearchResults() {
    const { state }   = useLocation();
    const navigate    = useNavigate();
    const { user }    = useAuth();
    const results     = state?.results || [];

    if (!state) return (
        <div className="page">
            <div className="container">
                <div className="empty-state card" style={{padding:60}}>
                    <Train size={40} style={{margin:'0 auto 16px',opacity:.3,display:'block'}} />
                    <h3>No search performed</h3>
                    <p><Link to="/">Go back to home</Link> and search for trains.</p>
                </div>
            </div>
        </div>
    );

    const handleSelectClass = (schedule, classInfo) => {
        if (!user) { navigate("/login"); return; }
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

    const directResults     = results.filter(r => r.type === "direct");
    const connectingResults = results.filter(r => r.type === "connecting");

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="results-header">
                    <div>
                        <div className="results-route">
                            <span>{state.from}</span>
                            <ArrowRight size={20} color="var(--text-muted)" />
                            <span>{state.to}</span>
                        </div>
                        <p style={{fontSize:13,color:'var(--text-muted)',marginTop:8,display:'flex',alignItems:'center',gap:6, fontWeight: 600}}>
                            <Calendar size={14} />
                            {new Date(state.date).toLocaleDateString("en-IN", { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                        </p>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span className="results-count">{directResults.length} Direct</span>
                        <span className="results-count">{connectingResults.length} Connecting</span>
                    </div>
                </div>

                {results.length === 0 ? (
                    <div className="empty-state card" style={{padding:60}}>
                        <Train size={40} style={{margin:'0 auto 16px',opacity:.3,display:'block'}} />
                        <h3>No Trains Found</h3>
                        <p>We couldn't find any trains between these stations on this date. Try another date.</p>
                        <Link to="/" className="btn btn-primary" style={{marginTop:20,display:'inline-flex'}}>Search Again</Link>
                    </div>
                ) : (
                    <div>
                        {/* Direct */}
                        {directResults.length > 0 && (
                            <>
                                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,marginTop:8}}>
                                    <span style={{fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:1,color:'var(--text-muted)'}}>Direct Trains</span>
                                    <div style={{flex:1,height:1,background:'var(--border-subtle)'}} />
                                </div>
                                {directResults.map((schedule, i) => (
                                    <DirectTrainCard key={schedule.scheduleId} schedule={schedule} index={i} onSelectClass={handleSelectClass} />
                                ))}
                            </>
                        )}

                        {/* Connecting */}
                        {connectingResults.length > 0 && (
                            <>
                                <div style={{display:'flex',alignItems:'center',gap:12,margin:'32px 0 20px'}}>
                                    <GitMerge size={16} color="var(--text-muted)" />
                                    <span style={{fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:1,color:'var(--text-muted)'}}>Connecting Trains</span>
                                    <div style={{flex:1,height:1,background:'var(--border-subtle)'}} />
                                </div>
                                {connectingResults.map((result, i) => (
                                    <ConnectingTrainCard key={`${result.leg1?.scheduleId}-${result.leg2?.scheduleId}`} result={result} index={i} onSelectClass={handleSelectClass} />
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function DirectTrainCard({ schedule, index, onSelectClass }) {
    const minFare = schedule.classes?.length > 0
        ? Math.min(...schedule.classes.map(c => c.farePerPerson))
        : null;

    return (
        <div className="train-result-card fade-in">
            <div className="train-result-main">
                
                <div className="train-result-name-wrap">
                    <div className="train-number">{schedule.train.trainNumber}</div>
                    <div className="train-name">{schedule.train.trainName}</div>
                </div>

                <div className="train-route-block">
                    <div className="train-time-block">
                        <div className="train-time">{schedule.fromStation.departureTime}</div>
                        <div className="train-station-code">{schedule.fromStation.code}</div>
                    </div>
                    
                    <div className="train-duration">
                        <div className="duration-line">
                            <span className="duration-dash" />
                            <Clock size={14} />
                            <span className="duration-dash" />
                        </div>
                        <div className="duration-text">{schedule.distanceKm} km</div>
                    </div>
                    
                    <div className="train-time-block">
                        <div className="train-time">{schedule.toStation.arrivalTime}</div>
                        <div className="train-station-code">{schedule.toStation.code}</div>
                    </div>
                </div>

                {minFare && (
                    <div className="train-book-side">
                        <div className="train-fare-from">Starts from</div>
                        <div className="train-fare-value">₹{minFare.toLocaleString("en-IN")}</div>
                    </div>
                )}
            </div>
            
            <div className="train-coaches">
                <span className="train-coaches-label">Select class:</span>
                {schedule.classes?.map(cls => (
                    <div
                        key={cls.coachType}
                        className={`coach-pill ${cls.availableSeats === 0 ? "disabled" : ""}`}
                        onClick={() => cls.availableSeats > 0 && onSelectClass(schedule, cls)}
                    >
                        <div className="coach-pill-left">
                            <span className="coach-type">{cls.coachType}</span>
                            <span className="coach-fare">₹{cls.farePerPerson.toLocaleString("en-IN")}</span>
                        </div>
                        <span className={`coach-status ${cls.availableSeats > 0 ? "avl" : "wl"}`}>
                            {cls.availableSeats > 0 ? `${cls.availableSeats} AVL` : "WL"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ConnectingTrainCard({ result, index, onSelectClass }) {
    const { hub, leg1, leg2 } = result;
    return (
        <div className="train-result-card fade-in" style={{marginBottom:16}}>
            <div style={{padding:'16px 24px',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',gap:10}}>
                <GitMerge size={16} color="var(--text-muted)" />
                <span style={{fontSize:14,fontWeight:600,color:'var(--text-secondary)'}}>
                    Connecting via <strong style={{color:'var(--text-primary)', fontWeight: 800}}>{hub?.name} ({hub?.code})</strong>
                    {hub?.layover && <span style={{marginLeft:8,color:'var(--text-muted)',fontSize:13}}>· {hub.layover} layover</span>}
                </span>
                <span className="badge badge-warning" style={{marginLeft:'auto', fontWeight: 800}}>1 Change</span>
            </div>
            <div style={{padding:'0 8px 8px 8px'}}>
                <div style={{padding:'20px 24px 8px',fontSize:12,fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:1}}>Leg 1 — {leg1?.train?.trainName}</div>
                <DirectTrainCard schedule={leg1} index={index} onSelectClass={onSelectClass} />
                
                <div style={{padding:'12px 24px 8px',fontSize:12,fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:1}}>Leg 2 — {leg2?.train?.trainName}</div>
                <DirectTrainCard schedule={leg2} index={index} onSelectClass={onSelectClass} />
            </div>
        </div>
    );
}
