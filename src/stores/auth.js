// Simple in-memory auth state (no Pinia needed)
import { ref } from 'vue'

export const isAuthenticated = ref(false)

// Hardcoded credentials for the lab
const VALID_USER = 'student'
const VALID_PASS = 'fit5032'

export function login(username, password) {
  if (username === VALID_USER && password === VALID_PASS) {
    isAuthenticated.value = true
    return true
  }
  return false
}

export function logout() {
  isAuthenticated.value = false
}


export const setRole = (role) => localStorage.setItem("role", role);
export const getRole = () => localStorage.getItem("role") || "user";
export const clearRole = () => localStorage.removeItem("role");
