import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http')
  ? process.env.NEXT_PUBLIC_API_URL
  : (process.env.NEXT_PUBLIC_API_URL ? `http://${process.env.NEXT_PUBLIC_API_URL}` : 'http://127.0.0.1:8000');

const api = axios.create({
  baseURL: API_BASE, // Change to your FastAPI URL on deploy
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
