import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;
    return user ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "admin") return <Navigate to="/" replace />;
    return children;
}
