import axios from 'axios';
//const BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';
const api = axios.create({
    baseURL: "http://localhost:5000",
});

// Add token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
});

export default api;