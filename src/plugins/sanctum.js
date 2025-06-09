import axios from 'axios';

const csrfInstance = axios.create({
  baseURL: 'https://gordon-college-career-hub-backend.onrender.com',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

export async function initializeCsrfCookie() {
  try {
    await csrfInstance.get('/sanctum/csrf-cookie');
    console.log('CSRF cookie initialized');
  } catch (error) {
    console.error('Failed to initialize CSRF cookie:', error);
    throw error;
  }
}

export async function refreshCsrfToken() {
  try {
    await initializeCsrfCookie();
    return true;
  } catch (error) {
    console.error('Failed to refresh CSRF token:', error);
    return false;
  }
}