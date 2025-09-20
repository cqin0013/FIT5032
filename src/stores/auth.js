import { ref } from "vue";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

// --- isAuthenticated / logout ---
export const isAuthenticated = ref(!!auth.currentUser);
onAuthStateChanged(auth, (u) => (isAuthenticated.value = !!u));
export const logout = async () => signOut(auth);


const KEY = "role";
export const setRole = (role) => localStorage.setItem(KEY, role);
export const getRole = () => localStorage.getItem(KEY) || "user";
export const clearRole = () => localStorage.removeItem(KEY);
