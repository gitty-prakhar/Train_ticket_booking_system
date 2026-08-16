import { useEffect, useState } from "react";
import { getDashboardStats, getAllBookings, getAllUsers, getAllTrains, getAllStations, createStation, createTrain, createSchedule, deleteStation, deleteTrain, updateStation, updateTrain } from "../api";
import {
    LayoutDashboard, Users, Ticket, Train, MapPin, Plus, X,
    IndianRupee, Activity, ChevronRight, TrendingUp
} from "lucide-react";
import "./Admin.css";

const TABS = [
    { id: "dashboard", label: "Overview",    icon: <LayoutDashboard size={16} /> },
    { id: "trains",    label: "Trains",       icon: <Train size={16} /> },
    { id: "stations",  label: "Stations",     icon: <MapPin size={16} /> },
    { id: "bookings",  label: "Bookings",     icon: <Ticket size={16} /> },
    { id: "users",     label: "Users",        icon: <Users size={16} /> },
];

export default function AdminDashboard() {
    const [tab, setTab]     = useState("dashboard");
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers]       = useState([]);
    const [trains, setTrains]     = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    const [showAddStation, setShowAddStation]   = useState(false);
    const [showAddSchedule, setShowAddSchedule] = useState(false);
    const [showAddTrain, setShowAddTrain]       = useState(false);

    const [stationForm, setStationForm] = useState({ name:"", code:"", city:"", state:"" });
    const [stationEditId, setStationEditId] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({ trainId:"", journeyDate:"" });
    const [trainForm, setTrainForm]   = useState({ trainNumber:"", trainName:"", trainType:"Rajdhani", sourceStationId:"", destStationId:"", sourceDeparture:"10:00", destArrival:"22:00" });
    const [trainEditId, setTrainEditId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError,   setFormError]   = useState("");
    const [formSuccess, setFormSuccess] = useState("");

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
        e.preventDefault(); setFormError(""); setFormLoading(true);
        try {
            stationEditId ? await updateStation(stationEditId, stationForm) : await createStation(stationForm);
            setFormSuccess(stationEditId ? "Station updated!" : "Station created!");
            setTimeout(() => { setShowAddStation(false); setFormSuccess(""); loadTab("stations"); }, 1500);
            setStationForm({ name:"", code:"", city:"", state:"" });
        } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
        finally { setFormLoading(false); }
    };

    const handleDeleteStation = async (id) => {
        if (!window.confirm("Delete this station?")) return;
        try { await deleteStation(id); loadTab("stations"); }
        catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    };

    const submitSchedule = async (e) => {
        e.preventDefault(); setFormError(""); setFormLoading(true);
        try {
            const r = await createSchedule(scheduleForm);
            setFormSuccess(`Done! ${r.data.data.totalSeats} seats generated.`);
            setTimeout(() => { setShowAddSchedule(false); setFormSuccess(""); }, 2000);
            setScheduleForm({ trainId:"", journeyDate:"" });
        } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
        finally { setFormLoading(false); }
    };

    const submitTrain = async (e) => {
        e.preventDefault(); setFormError(""); setFormLoading(true);
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
            trainEditId ? await updateTrain(trainEditId, payload) : await createTrain(payload);
            setFormSuccess(trainEditId ? "Train updated!" : "Train created!");
            setTimeout(() => { setShowAddTrain(false); setFormSuccess(""); loadTab("trains"); }, 1500);
        } catch (err) { setFormError(err.response?.data?.message || "Failed."); }
        finally { setFormLoading(false); }
    };

    const handleDeleteTrain = async (id) => {
        if (!window.confirm("Delete this train and all its data?")) return;
        try { await deleteTrain(id); loadTab("trains"); }
        catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    };

    const STATS = stats ? [
        { label:"Total Users",     value: stats.totalUsers,          icon:<Users size={20} />,         color:"#6366f1", bg:"rgba(99,102,241,0.12)" },
        { label:"Total Revenue",   value:`₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`, icon:<IndianRupee size={20} />, color:"#10b981", bg:"rgba(16,185,129,0.12)" },
        { label:"Active Trains",   value: stats.totalTrains,         icon:<Train size={20} />,         color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
        { label:"Total Bookings",  value: stats.totalBookings,       icon:<Ticket size={20} />,        color:"#3b82f6", bg:"rgba(59,130,246,0.12)" },
        { label:"Confirmed",       value: stats.confirmedBookings,   icon:<TrendingUp size={20} />,    color:"#10b981", bg:"rgba(16,185,129,0.12)" },
        { label:"Cancelled",       value: stats.cancelledBookings,   icon:<X size={20} />,             color:"#f43f5e", bg:"rgba(244,63,94,0.12)" },
    ] : [];

    const currentTab = TABS.find(t => t.id === tab);

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <Activity size={16} color="var(--accent)" />
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            className={`sidebar-link ${tab === t.id ? "active" : ""}`}
                            onClick={() => setTab(t.id)}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main */}
            <main className="admin-content">
                <div className="admin-header-top">
                    <div>
                        <p className="admin-page-title">{currentTab?.label}</p>
                        <p className="admin-page-subtitle">
                            {tab === "dashboard" && "System overview and key metrics"}
                            {tab === "trains" && "Manage trains, routes and schedules"}
                            {tab === "stations" && "Manage railway stations"}
                            {tab === "bookings" && "All passenger bookings"}
                            {tab === "users" && "Registered user accounts"}
                        </p>
                    </div>
                </div>

                {error && <div className="alert alert-error" style={{marginBottom:24}}>{error}</div>}

                {loading ? (
                    <div className="spinner-wrapper"><div className="spinner" /></div>
                ) : (
                    <div className="fade-in">

                        {/* ── Dashboard ── */}
                        {tab === "dashboard" && stats && (
                            <div className="grid-3" style={{gap: 16}}>
                                {STATS.map((s, i) => (
                                    <div key={i} className="stat-card card fade-in" style={{"--delay": `${i*0.05}s`}}>
                                        <div className="stat-icon-wrap" style={{background: s.bg, color: s.color}}>
                                            {s.icon}
                                        </div>
                                        <div className="stat-info">
                                            <div className="stat-value">{s.value?.toLocaleString?.() ?? s.value ?? "—"}</div>
                                            <div className="stat-label">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Trains ── */}
                        {tab === "trains" && (
                            <div>
                                <div className="action-bar">
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setTrainEditId(null); setTrainForm({ trainNumber:"", trainName:"", trainType:"Rajdhani", sourceStationId:"", destStationId:"", sourceDeparture:"10:00", destArrival:"22:00" }); setShowAddTrain(true); setFormError(""); setFormSuccess(""); }}>
                                        <Plus size={15} /> Add Train
                                    </button>
                                    <button className="btn btn-primary btn-sm" onClick={() => { setShowAddSchedule(true); setFormError(""); setFormSuccess(""); }}>
                                        <Plus size={15} /> Create Schedule
                                    </button>
                                </div>
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Number</th><th>Name</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {trains.map(t => (
                                                <tr key={t._id}>
                                                    <td className="font-mono" style={{color:"var(--text-accent)",fontWeight:700}}>{t.trainNumber}</td>
                                                    <td style={{color:"var(--text-primary)",fontWeight:600}}>{t.trainName}</td>
                                                    <td><span className="badge badge-purple">{t.trainType}</span></td>
                                                    <td><span className={`badge ${t.isActive ? "badge-success" : "badge-danger"}`}>{t.isActive ? "Active" : "Inactive"}</span></td>
                                                    <td>
                                                        <div className="row-actions">
                                                            <button className="btn btn-secondary btn-sm" onClick={() => { setTrainEditId(t._id); setTrainForm({ trainNumber:t.trainNumber, trainName:t.trainName, trainType:t.trainType||"Rajdhani", sourceStationId:t.stops?.[0]?.stationId?._id||"", destStationId:t.stops?.[t.stops.length-1]?.stationId?._id||"", sourceDeparture:t.stops?.[0]?.departureTime||"10:00", destArrival:t.stops?.[t.stops.length-1]?.arrivalTime||"22:00" }); setShowAddTrain(true); setFormError(""); setFormSuccess(""); }}>Edit</button>
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

                        {/* ── Stations ── */}
                        {tab === "stations" && (
                            <div>
                                <div className="action-bar">
                                    <button className="btn btn-primary btn-sm" onClick={() => { setStationEditId(null); setStationForm({ name:"", code:"", city:"", state:"" }); setShowAddStation(true); setFormError(""); setFormSuccess(""); }}>
                                        <Plus size={15} /> Add Station
                                    </button>
                                </div>
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Code</th><th>Name</th><th>City</th><th>State</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {stations.map(s => (
                                                <tr key={s._id}>
                                                    <td className="font-mono" style={{color:"var(--text-accent)",fontWeight:700}}>{s.code}</td>
                                                    <td style={{color:"var(--text-primary)"}}>{s.name}</td>
                                                    <td>{s.city}</td>
                                                    <td>{s.state}</td>
                                                    <td>
                                                        <div className="row-actions">
                                                            <button className="btn btn-secondary btn-sm" onClick={() => { setStationEditId(s._id); setStationForm({ name:s.name, code:s.code, city:s.city, state:s.state }); setShowAddStation(true); setFormError(""); setFormSuccess(""); }}>Edit</button>
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

                        {/* ── Bookings ── */}
                        {tab === "bookings" && (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>PNR</th><th>User</th><th>Route</th><th>Class</th><th>Fare</th><th>Status</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {bookings.map(b => (
                                            <tr key={b._id}>
                                                <td className="font-mono" style={{color:"var(--text-accent)",fontWeight:700}}>{b.pnr}</td>
                                                <td style={{color:"var(--text-primary)"}}>{b.userId?.username || "—"}</td>
                                                <td>{b.boardingStationId?.code} → {b.destinationStationId?.code}</td>
                                                <td><span className="badge badge-blue">{b.coachType}</span></td>
                                                <td style={{fontWeight:600}}>₹{b.totalFare?.toLocaleString("en-IN")}</td>
                                                <td><span className={`badge ${b.status==="Confirmed"?"badge-success":b.status==="Cancelled"?"badge-danger":"badge-warning"}`}>{b.status}</span></td>
                                                <td>{b.travelDate ? new Date(b.travelDate).toLocaleDateString("en-IN") : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Users ── */}
                        {tab === "users" && (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Wallet</th><th>Joined</th></tr></thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id}>
                                                <td style={{color:"var(--text-primary)",fontWeight:600}}>{u.username}</td>
                                                <td>{u.email}</td>
                                                <td><span className={`badge ${u.role==="admin"?"badge-warning":"badge-blue"}`}>{u.role}</span></td>
                                                <td className="font-mono" style={{fontWeight:600}}>₹{u.wallet?.toLocaleString("en-IN") || 0}</td>
                                                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Modal: Station ── */}
                {showAddStation && (
                    <div className="modal-overlay fade-in" onClick={() => setShowAddStation(false)}>
                        <div className="modal-card glass-panel admin-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{stationEditId ? "Edit Station" : "Add Station"}</h3>
                                <button className="btn-icon" onClick={() => setShowAddStation(false)}><X size={18} /></button>
                            </div>
                            {formError   && <div className="alert alert-error"   style={{marginBottom:16}}>{formError}</div>}
                            {formSuccess && <div className="alert alert-success" style={{marginBottom:16}}>{formSuccess}</div>}
                            <form onSubmit={submitStation}>
                                <div className="grid-2" style={{gap:14, marginBottom:20}}>
                                    <div className="form-group">
                                        <label className="form-label">Station Name</label>
                                        <input className="form-input" placeholder="e.g. Mumbai Central" value={stationForm.name} onChange={e=>setStationForm({...stationForm,name:e.target.value})} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Code</label>
                                        <input className="form-input font-mono" placeholder="e.g. BCT" value={stationForm.code} onChange={e=>setStationForm({...stationForm,code:e.target.value.toUpperCase()})} maxLength={6} required />
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
                                <button type="submit" className="btn btn-primary btn-block" disabled={formLoading}>
                                    {formLoading ? "Saving..." : stationEditId ? "Update Station" : "Create Station"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Modal: Schedule ── */}
                {showAddSchedule && (
                    <div className="modal-overlay fade-in" onClick={() => setShowAddSchedule(false)}>
                        <div className="modal-card glass-panel admin-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Create Schedule</h3>
                                <button className="btn-icon" onClick={() => setShowAddSchedule(false)}><X size={18} /></button>
                            </div>
                            {formError   && <div className="alert alert-error"   style={{marginBottom:16}}>{formError}</div>}
                            {formSuccess && <div className="alert alert-success" style={{marginBottom:16}}>{formSuccess}</div>}
                            <form onSubmit={submitSchedule}>
                                <div className="form-group" style={{marginBottom:14}}>
                                    <label className="form-label">Select Train</label>
                                    <select className="form-select" value={scheduleForm.trainId} onChange={e=>setScheduleForm({...scheduleForm,trainId:e.target.value})} required>
                                        <option value="">-- Select a Train --</option>
                                        {trains.map(t => <option key={t._id} value={t._id}>{t.trainNumber} — {t.trainName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{marginBottom:20}}>
                                    <label className="form-label">Journey Date</label>
                                    <input type="date" className="form-input" value={scheduleForm.journeyDate} onChange={e=>setScheduleForm({...scheduleForm,journeyDate:e.target.value})} min={new Date().toISOString().split("T")[0]} required />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block" disabled={formLoading}>
                                    {formLoading ? "Generating..." : "Generate Schedule & Seats"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Modal: Train ── */}
                {showAddTrain && (
                    <div className="modal-overlay fade-in" onClick={() => setShowAddTrain(false)}>
                        <div className="modal-card glass-panel admin-modal-lg" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{trainEditId ? "Edit Train" : "Create Train"}</h3>
                                <button className="btn-icon" onClick={() => setShowAddTrain(false)}><X size={18} /></button>
                            </div>
                            {formError   && <div className="alert alert-error"   style={{marginBottom:16}}>{formError}</div>}
                            {formSuccess && <div className="alert alert-success" style={{marginBottom:16}}>{formSuccess}</div>}
                            <form onSubmit={submitTrain}>
                                <div className="grid-3" style={{gap:14, marginBottom:14}}>
                                    <div className="form-group">
                                        <label className="form-label">Train No.</label>
                                        <input className="form-input font-mono" placeholder="12951" value={trainForm.trainNumber} onChange={e=>setTrainForm({...trainForm,trainNumber:e.target.value})} required />
                                    </div>
                                    <div className="form-group" style={{gridColumn:"span 2"}}>
                                        <label className="form-label">Train Name</label>
                                        <input className="form-input" placeholder="Mumbai Rajdhani Express" value={trainForm.trainName} onChange={e=>setTrainForm({...trainForm,trainName:e.target.value})} required />
                                    </div>
                                </div>
                                <div className="form-group" style={{marginBottom:14}}>
                                    <label className="form-label">Train Type</label>
                                    <select className="form-select" value={trainForm.trainType} onChange={e=>setTrainForm({...trainForm,trainType:e.target.value})}>
                                        {["Rajdhani","Shatabdi","Express","Superfast","VandeBharat","Passenger"].map(t=><option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="grid-2" style={{gap:14,marginBottom:14}}>
                                    <div className="form-group">
                                        <label className="form-label">Source Station</label>
                                        <select className="form-select" value={trainForm.sourceStationId} onChange={e=>setTrainForm({...trainForm,sourceStationId:e.target.value})} required>
                                            <option value="">-- Select --</option>
                                            {stations.map(s=><option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Departure Time</label>
                                        <input type="time" className="form-input" value={trainForm.sourceDeparture} onChange={e=>setTrainForm({...trainForm,sourceDeparture:e.target.value})} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Destination Station</label>
                                        <select className="form-select" value={trainForm.destStationId} onChange={e=>setTrainForm({...trainForm,destStationId:e.target.value})} required>
                                            <option value="">-- Select --</option>
                                            {stations.map(s=><option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Arrival Time</label>
                                        <input type="time" className="form-input" value={trainForm.destArrival} onChange={e=>setTrainForm({...trainForm,destArrival:e.target.value})} required />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary btn-block" disabled={formLoading}>
                                    {formLoading ? "Saving..." : trainEditId ? "Update Train" : "Create Train"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
