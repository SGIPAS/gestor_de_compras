import { supabase } from './supabase-client.js';
import { initAuth, login, signUp, logout, currentUser } from './modules/auth.js';
import { renderizarFormulario, renderizarLista } from './modules/ordenes.js';
import { renderizarProveedores } from './modules/proveedores.js';
import { renderizarResumen } from './modules/resumen.js';

// ==================== EVENTOS DE UI ====================
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    try {
        await login(email, password);
        mostrarPanelPrincipal();
    } catch (err) {
        errorEl.textContent = 'Error: ' + err.message;
        errorEl.classList.remove('hidden');
    }
});

document.getElementById('btn-registro').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt('Ingrese su email para registrarse:');
    const password = prompt('Ingrese una contraseña (mínimo 6 caracteres):');
    if (!email || !password) return;
    try {
        await signUp(email, password);
        alert('Registro exitoso. Ya puede iniciar sesión.');
    } catch (err) {
        alert('Error al registrarse: ' + err.message);
    }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
    await logout();
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('main-section').classList.add('hidden');
});

// Pestañas
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-tab'));
        this.classList.add('active-tab');
        switch (this.dataset.tab) {
            case 'nueva': renderizarFormulario(); break;
            case 'lista': renderizarLista(); break;
            case 'proveedores': renderizarProveedores(); break;
            case 'resumen': renderizarResumen(); break;
        }
    });
});

function mostrarPanelPrincipal() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('main-section').classList.remove('hidden');
    renderizarFormulario(); // Pestaña por defecto
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    const sesionActiva = await initAuth();
    if (sesionActiva) mostrarPanelPrincipal();
});