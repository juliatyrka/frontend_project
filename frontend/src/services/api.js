import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const localApi = axios.create({
  baseURL: API_BASE_URL,
});

export const offApi = axios.create({
  baseURL: 'https://world.openfoodfacts.org',
});