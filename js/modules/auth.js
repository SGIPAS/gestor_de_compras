import { supabase } from '../supabase-client.js';

// Variable global para el usuario actual
export let currentUser = null;

// Inicializar sesión al cargar la página
export async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        return true;
    }
    return false;
}

// Login
export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = data.user;
    return currentUser;
}

// Registro
export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

// Logout
export async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
}