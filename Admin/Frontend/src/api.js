import axios from 'axios';
//const BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';
const api = axios.create({
    baseURL: "https://record-call.onrender.com/",
});

// Add token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {

    }
    return config;
});

export default api;