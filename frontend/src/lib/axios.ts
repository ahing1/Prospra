import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Change to your FastAPI URL on deploy
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
