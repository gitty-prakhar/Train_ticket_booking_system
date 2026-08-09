import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import VerifyOtp      from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import SearchResults  from "./pages/SearchResults";
import BookingConfirm from "./pages/BookingConfirm";
import MyBookings     from "./pages/MyBookings";
import BookingDetail  from "./pages/BookingDetail";
import Profile        from "./pages/Profile";
import Admin          from "./pages/Admin";
import Payments       from "./pages/Payments";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    {/* Public */}
                    <Route path="/"                element={<Home />} />
                    <Route path="/login"           element={<Login />} />
                    <Route path="/register"        element={<Register />} />
                    <Route path="/verify"          element={<VerifyOtp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/search"          element={<SearchResults />} />

                    {/* Protected */}
                    <Route path="/booking/confirm" element={<ProtectedRoute><BookingConfirm /></ProtectedRoute>} />
                    <Route path="/bookings"        element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                    <Route path="/bookings/:pnr"   element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
                    <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/payments"        element={<ProtectedRoute><Payments /></ProtectedRoute>} />

                    {/* Admin */}
                    <Route path="/admin"           element={<AdminRoute><Admin /></AdminRoute>} />

                    {/* 404 */}
                    <Route path="*" element={
                        <div className="page">
                            <div className="container empty-state">
                                <h3>404 — Page Not Found</h3>
                                <p>The page you're looking for doesn't exist.</p>
                            </div>
                        </div>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
