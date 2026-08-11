import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
    withCredentials: true,
});

// Attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── AUTH ────────────────────────────────────────────────────
export const registerUser    = (data) => API.post("/users/register", data);
export const verifyOtp       = (data) => API.post("/users/verify", data);
export const loginUser       = (data) => API.post("/users/login", data);
export const logoutUser      = ()     => API.post("/users/logout");
export const forgotPassword  = (data) => API.post("/users/forgot-password", data);
export const resetPassword   = (data) => API.post("/users/reset-password", data);
export const getCurrentUser  = ()     => API.get("/users/current-user");
export const changePassword  = (data) => API.post("/users/change-password", data);

// ─── SEARCH ──────────────────────────────────────────────────
export const searchTrains = (from, to, date) =>
    API.get(`/search?from=${from}&to=${to}&date=${date}`);

// ─── TRAINS ──────────────────────────────────────────────────
export const getAllTrains  = ()     => API.get("/trains");
export const createTrain  = (data) => API.post("/trains", data);
export const updateTrain  = (id, data) => API.patch(`/trains/${id}`, data);
export const deleteTrain  = (id)   => API.delete(`/trains/${id}`);

// ─── STATIONS ────────────────────────────────────────────────
export const getAllStations  = ()     => API.get("/stations");
export const createStation   = (data) => API.post("/stations", data);
export const updateStation   = (id, data) => API.patch(`/stations/${id}`, data);
export const deleteStation   = (id)   => API.delete(`/stations/${id}`);

// ─── SCHEDULES ───────────────────────────────────────────────
export const createSchedule = (data) => API.post("/schedules", data);
export const updateScheduleStatus = (id, data) => API.patch(`/schedules/${id}/status`, data);

// ─── SEATS ───────────────────────────────────────────────────
export const lockSeats    = (data) => API.post("/seats/lock", data);
export const releaseSeats = (data) => API.post("/seats/release", data);
export const getSeatMap   = (coachId) => API.get(`/seats/coach/${coachId}`);

// ─── BOOKINGS ────────────────────────────────────────────────
export const createBooking     = (data) => API.post("/bookings", data);
export const getMyBookings     = ()     => API.get("/bookings/my-bookings");
export const getBookingByPNR   = (pnr)  => API.get(`/bookings/pnr/${pnr}`);
export const cancelBooking     = (id)   => API.post(`/bookings/${id}/cancel`);

// ─── ADMIN ───────────────────────────────────────────────────
export const getDashboardStats = () => API.get("/admin/dashboard");
export const getAllBookings     = () => API.get("/admin/bookings");
export const getAllUsers        = () => API.get("/admin/users");

// ─── PAYMENTS ────────────────────────────────────────────────
export const getMyPayments = () => API.get("/payments/my-payments");
// (Note: createOrder and verifyPayment will be used if Razorpay is integrated)
export const createOrder = (data) => API.post("/payments/create-order", data);
export const verifyPayment = (data) => API.post("/payments/verify-payment", data);

export default API;
