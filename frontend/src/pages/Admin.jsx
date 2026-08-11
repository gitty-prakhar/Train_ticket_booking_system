import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, getAllBookings, getAllUsers, getAllTrains, getAllStations, createStation, createTrain, createSchedule } from "../api";
import { LayoutDashboard, Users, Ticket, Train, MapPin, Plus, X, Activity } from "lucide-react";
import "./Admin.css";

export default function AdminDashboard() {
    const [tab, setTab]     = useState("dashboard");
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers]       = useState([]);
    const [trains, setTrains]     = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    const [showAddStation, setShowAddStation] = useState(false);
    const [showAddSchedule, setShowAddSchedule] = useState(false);
    const [showAddTrain, setShowAddTrain] = useState(false);

    const [stationForm, setStationForm]   = useState({ name:"", code:"", city:"", state:"" });
    const [stationEditId, setStationEditId] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({ trainId:"", journeyDate:"" });
    const [trainForm, setTrainForm]       = useState({ trainNumber:"", trainName:"", trainType:"Rajdhani", sourceStationId:"", destStationId:"", sourceDeparture:"10:00", destArrival:"22:00" });
    const [trainEditId, setTrainEditId]   = useState(null);
    const [formLoading, setFormLoading]   = useState(false);
    const [formError,   setFormError]     = useState("");
    const [formSuccess, setFormSuccess]   = useState("");

    useEffect(() => { loadTab(tab); }, [tab]);

    const loadTab = async (t) => {
        setLoading(true); setError("");
        try {
            if (t === "dashboard") { const r = await getDashboardStats(); setStats(r.data.data); }
            if (t === "bookings")  { const r = await getAllBookings();     setBookings(r.data.data.bookings || []); }
            if (t === "users")     { const r = await getAllUsers();        setUsers(r.data.data.users || []); }
            if (t === "trains")    { const [tr, st] = await Promise.all([getAllTrains(), getAllStations()]); setTrains(tr.data.data); setStations(st.data.data); }
            if (t === "stations")  { const r = await getAllStations();     setStations(r.data.data); }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load data.");
        } finally { setLoading(false); }
    };

    const submitStation = async (e) => {
        e.preventDefault();
        setFormError(""); setFormLoading(true);
        try {
            if (stationEditId) {
                await updateStation(stationEditId, stationForm);
                setFormSuccess("Station updated successfully!");
            } else {
                await createStation(stationForm);
                setFormSuccess("Station created successfully!");
            }
            setTimeout(() => { setShowAddStation(false); loadTab("stations"); }, 1500);
            setStationForm({ name:"", code:"", city:"", state:"" });
        } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
        finally { setFormLoading(false); }
    };

    const handleDeleteStation = async (id) => {
        if (!window.confirm("Are you sure you want to delete this station?")) return;
        try {
            await deleteStation(id);
            loadTab("stations");
        } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    };

    const submitSchedule = async (e) => {
        e.preventDefault();
        setFormError(""); setFormLoading(true);
        try {
            const r = await createSchedule(scheduleForm);
            setFormSuccess(`Schedule created! Generated ${r.data.data.totalSeats} seats.`);
            setTimeout(() => { setShowAddSchedule(false); }, 1500);
            setScheduleForm({ trainId:"", journeyDate:"" });
        } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
        finally { setFormLoading(false); }
    };

    const submitTrain = async (e) => {
        e.preventDefault();
        setFormError(""); setFormLoading(true);
        try {
            const payload = {
                trainNumber: trainForm.trainNumber,
                trainName: trainForm.trainName,
                trainType: trainForm.trainType,
                runningDays: [0, 1, 2, 3, 4, 5, 6],
                stops: [
                    { stationId: trainForm.sourceStationId, arrivalTime: trainForm.sourceDeparture, departureTime: trainForm.sourceDeparture, stopNumber: 1, distanceFromOrigin: 0 },
                    { stationId: trainForm.destStationId, arrivalTime: trainForm.destArrival, departureTime: trainForm.destArrival, stopNumber: 2, distanceFromOrigin: 500 }
                ]
            };
            if (trainEditId) {
                await updateTrain(trainEditId, payload);
                setFormSuccess("Train updated successfully!");
            } else {
                await createTrain(payload);
                setFormSuccess("Train created successfully!");
            }
            setTimeout(() => { setShowAddTrain(false); loadTab("trains"); }, 1500);
        } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
        finally { setFormLoading(false); }
    };

    const handleDeleteTrain = async (id) => {
        if (!window.confirm("Are you sure you want to delete this train?")) return;
        try {
            await deleteTrain(id);
            loadTab("trains");
        } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    };

    const tabs = [
        { id:"dashboard", label:"Overview", icon:<LayoutDashboard size={18} /> },
        { id:"trains",    label:"Trains & Sch", icon:<Train size={18} /> },
        { id:"stations",  label:"Stations", icon:<MapPin size={18} /> },
        { id:"bookings",  label:"Bookings", icon:<Ticket size={18} /> },
        { id:"users",     label:"Users",    icon:<Users size={18} /> },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar glass-panel">
                <div className="sidebar-header">
                    <Activity size={24} className="text-accent" />
                    <h2>Admin Center</h2>
                </div>
                <div className="sidebar-nav">
                    {tabs.map(t => (
                        <button key={t.id} className={`sidebar-link ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <div className="admin-header-top">
                    <h1 className="section-title" style={{marginBottom:0}}>
                        {tabs.find(t=>t.id===tab)?.label}
                    </h1>
                </div>

                {error && <div className="alert alert-error" style={{marginBottom:24}}>{error}</div>}
                
                {loading ? (
                    <div className="spinner-wrapper"><div className="spinner" /></div>
                ) : (
                    <div className="fade-in">
                        {/* Dashboard Stats */}
                        {tab === "dashboard" && stats && (
                            <div className="grid-3">
                                {[
                                    { label:"Total Users",    value: stats.totalUsers,    icon: <Users size={24} />,         color:"#3b82f6" },
                                    { label:"Revenue",        value: stats.totalRevenue,  icon: <IndianRupee size={24} />,   color:"#10b981" },
                                    { label:"Total Trains",   value: stats.totalTrains,   icon: <Train size={24} />,         color:"#f59e0b" },
                                    { label:"Total Bookings", value: stats.totalBookings, icon: <Ticket size={24} />,        color:"#8b5cf6" },
                                    { label:"Confirmed",      value: stats.confirmedBookings, icon: <Ticket size={24} />,    color:"#34d399" },
                                    { label:"Cancelled",      value: stats.cancelledBookings, icon: <Ticket size={24} />,    color:"#fca5a5" },
                                ].map((s,i) => (
                                    <div key={i} className="stat-card glass-panel fade-in stagger-1">
                                        <div className="stat-icon" style={{background:`${s.color}22`, color:s.color}}>{s.icon}</div>
                                        <div>
                                            <div className="stat-value">{s.value?.toLocaleString() ?? "—"}</div>
                                            <div className="stat-label">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Trains Tab */}
                        {tab === "trains" && (
                            <div>
                                <div className="action-bar" style={{gap:12}}>
                                    <button className="btn btn-secondary" onClick={() => { 
                                        setTrainEditId(null);
                                        setTrainForm({ trainNumber:"", trainName:"", trainType:"Rajdhani", sourceStationId:"", destStationId:"", sourceDeparture:"10:00", destArrival:"22:00" });
                                        setShowAddTrain(true); 
                                        setFormError(""); 
                                        setFormSuccess(""); 
                                    }}>
                                        <Plus size={16} /> Create Train
                                    </button>
                                    <button className="btn btn-primary" onClick={() => { setShowAddSchedule(true); setFormError(""); setFormSuccess(""); }}>
                                        <Plus size={16} /> Create Schedule
                                    </button>
                                </div>
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Number</th><th>Name</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {trains.map(t => (
                                                <tr key={t._id}>
                                                    <td className="font-mono text-accent">{t.trainNumber}</td>
                                                    <td style={{color:"#fff", fontWeight:600}}>{t.trainName}</td>
                                                    <td><span className="badge badge-blue">{t.trainType}</span></td>
                                                    <td><span className={`badge ${t.isActive?"badge-success":"badge-danger"}`}>{t.isActive?"Active":"Inactive"}</span></td>
                                                    <td>
                                                        <div style={{display: "flex", gap: "8px"}}>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                                                setTrainEditId(t._id);
                                                                setTrainForm({ 
                                                                    trainNumber: t.trainNumber, 
                                                                    trainName: t.trainName, 
                                                                    trainType: t.trainType || "Rajdhani", 
                                                                    sourceStationId: t.stops?.[0]?.stationId?._id || "", 
                                                                    destStationId: t.stops?.[t.stops.length-1]?.stationId?._id || "", 
                                                                    sourceDeparture: t.stops?.[0]?.departureTime || "10:00", 
                                                                    destArrival: t.stops?.[t.stops.length-1]?.arrivalTime || "22:00" 
                                                                });
                                                                setShowAddTrain(true);
                                                                setFormError(""); setFormSuccess("");
                                                            }}>Edit</button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTrain(t._id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Stations Tab */}
                        {tab === "stations" && (
                            <div>
                                <div className="action-bar">
                                    <button className="btn btn-primary" onClick={() => { 
                                        setStationEditId(null);
                                        setStationForm({ name:"", code:"", city:"", state:"" });
                                        setShowAddStation(true); 
                                        setFormError(""); 
                                        setFormSuccess(""); 
                                    }}>
                                        <Plus size={16} /> Add Station
                                    </button>
                                </div>
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Code</th><th>Name</th><th>City</th><th>State</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {stations.map(s => (
                                                <tr key={s._id}>
                                                    <td className="font-mono text-accent">{s.code}</td>
                                                    <td style={{color:"#fff"}}>{s.name}</td>
                                                    <td>{s.city}</td>
                                                    <td>{s.state}</td>
                                                    <td>
                                                        <div style={{display: "flex", gap: "8px"}}>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                                                setStationEditId(s._id);
                                                                setStationForm({ name: s.name, code: s.code, city: s.city, state: s.state });
                                                                setShowAddStation(true);
                                                                setFormError(""); setFormSuccess("");
                                                            }}>Edit</button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStation(s._id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Bookings Tab */}
                        {tab === "bookings" && (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>PNR</th><th>Route</th><th>Class</th><th>Fare</th><th>Status</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {bookings.map(b => (
                                            <tr key={b._id}>
                                                <td className="font-mono text-accent">{b.pnr}</td>
                                                <td>{b.boardingStationId?.code} → {b.destinationStationId?.code}</td>
                                                <td><span className="badge badge-blue">{b.coachType}</span></td>
                                                <td>₹{b.totalFare?.toLocaleString("en-IN")}</td>
                                                <td>
                                                    <span className={`badge ${b.status==="Confirmed"?"badge-success":b.status==="Cancelled"?"badge-danger":"badge-warning"}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td>{b.travelDate ? new Date(b.travelDate).toLocaleDateString("en-IN") : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Users Tab */}
                        {tab === "users" && (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Wallet</th><th>Joined</th></tr></thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id}>
                                                <td style={{color:"#fff", fontWeight:600}}>{u.username}</td>
                                                <td>{u.email}</td>
                                                <td><span className={`badge ${u.role==="admin"?"badge-warning":"badge-blue"}`}>{u.role}</span></td>
                                                <td className="font-mono">₹{u.wallet?.toLocaleString("en-IN") || 0}</td>
                                                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal: Add Station */}
                {showAddStation && (
                    <div className="modal-overlay fade-in" onClick={() => setShowAddStation(false)}>
                        <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{stationEditId ? "Edit Station" : "Add New Station"}</h3>
                                <button className="btn-icon" onClick={() => setShowAddStation(false)}><X size={20} /></button>
                            </div>
                            {formError && <div className="alert alert-error" style={{marginBottom:16}}>{formError}</div>}
                            {formSuccess && <div className="alert alert-success" style={{marginBottom:16}}>{formSuccess}</div>}
                            <form onSubmit={submitStation}>
                                <div className="grid-2" style={{marginBottom:24}}>
                                    <div className="form-group">
                                        <label className="form-label">Station Name</label>
                                        <input className="form-input" placeholder="e.g. Mumbai Central" value={stationForm.name} onChange={e=>setStationForm({...stationForm,name:e.target.value})} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Station Code</label>
                                        <input className="form-input" placeholder="e.g. BCT" value={stationForm.code} onChange={e=>setStationForm({...stationForm,code:e.target.value.toUpperCase()})} maxLength={6} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input className="form-input" placeholder="e.g. Mumbai" value={stationForm.city} onChange={e=>setStationForm({...stationForm,city:e.target.value})} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input className="form-input" placeholder="e.g. Maharashtra" value={stationForm.state} onChange={e=>setStationForm({...stationForm,state:e.target.value})} required />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary btn-block" disabled={formLoading}>{formLoading ? (stationEditId ? "Updating..." : "Creating...") : (stationEditId ? "Update Station" : "Create Station")}</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Add Schedule */}
                {showAddSchedule && (
                    <div className="modal-overlay fade-in" onClick={() => setShowAddSchedule(false)}>
                        <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Create Schedule & Seats</h3>
                                <button className="btn-icon" onClick={() => setShowAddSchedule(false)}><X size={20} /></button>
                            </div>
                            {formError && <div className="alert alert-error" style={{marginBottom:16}}>{formError}</div>}
                            {formSuccess && <div className="alert alert-success" style={{marginBottom:16}}>{formSuccess}</div>}
                            <form onSubmit={submitSchedule}>
                                <div className="form-group" style={{marginBottom:16}}>
                                    <label className="form-label">Select Train</label>
                                    <select className="form-select" value={scheduleForm.trainId} onChange={e=>setScheduleForm({...scheduleForm,trainId:e.target.value})} required>
                                        <option value="">-- Select a Train --</option>
                                        {trains.map(t => <option key={t._id} value={t._id}>{t.trainNumber} — {t.trainName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{marginBottom:24}}>
                                    <label className="form-label">Journey Date</label>
                                    <input type="date" className="form-input" value={scheduleForm.journeyDate} onChange={e=>setScheduleForm({...scheduleForm,journeyDate:e.target.value})} min={new Date().toISOString().split("T")[0]} required />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block" disabled={formLoading}>{formLoading ? "Creating..." : "Generate Schedule"}</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Add Train */}
                {showAddTrain && (
                    <div className="modal-overlay fade-in" onClick={() => setShowAddTrain(false)}>
                        <div className="modal-card glass-panel" onClick={e => e.stopPropagation()} style={{maxWidth: 600}}>
                            <div className="modal-header">
                                <h3>{trainEditId ? "Edit Train" : "Create New Train"}</h3>
                                <button className="btn-icon" onClick={() => setShowAddTrain(false)}><X size={20} /></button>
                            </div>
                            {formError && <div className="alert alert-error" style={{marginBottom:16}}>{formError}</div>}
                            {formSuccess && <div className="alert alert-success" style={{marginBottom:16}}>{formSuccess}</div>}
                            
                            <form onSubmit={submitTrain}>
                                <div className="grid-3" style={{marginBottom:16}}>
                                    <div className="form-group">
                                        <label className="form-label">Train No.</label>
                                        <input className="form-input font-mono" placeholder="12951" value={trainForm.trainNumber} onChange={e=>setTrainForm({...trainForm,trainNumber:e.target.value})} required />
                                    </div>
                                    <div className="form-group" style={{gridColumn: "span 2"}}>
                                        <label className="form-label">Train Name</label>
                                        <input className="form-input" placeholder="Mumbai Rajdhani" value={trainForm.trainName} onChange={e=>setTrainForm({...trainForm,trainName:e.target.value})} required />
                                    </div>
                                </div>
                                
                                <div className="grid-2" style={{marginBottom:16}}>
                                    <div className="form-group">
                                        <label className="form-label">Source Station</label>
                                        <select className="form-select" value={trainForm.sourceStationId} onChange={e=>setTrainForm({...trainForm,sourceStationId:e.target.value})} required>
                                            <option value="">-- Select --</option>
                                            {stations.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Departure Time</label>
                                        <input type="time" className="form-input" value={trainForm.sourceDeparture} onChange={e=>setTrainForm({...trainForm,sourceDeparture:e.target.value})} required />
                                    </div>
                                </div>

                                <div className="grid-2" style={{marginBottom:24}}>
                                    <div className="form-group">
                                        <label className="form-label">Destination Station</label>
                                        <select className="form-select" value={trainForm.destStationId} onChange={e=>setTrainForm({...trainForm,destStationId:e.target.value})} required>
                                            <option value="">-- Select --</option>
                                            {stations.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Arrival Time</label>
                                        <input type="time" className="form-input" value={trainForm.destArrival} onChange={e=>setTrainForm({...trainForm,destArrival:e.target.value})} required />
                                    </div>
                                </div>
                                
                                <button type="submit" className="btn btn-primary btn-block" disabled={formLoading}>{formLoading ? (trainEditId ? "Updating..." : "Creating...") : (trainEditId ? "Update Train" : "Create Train")}</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

import { IndianRupee } from "lucide-react";
