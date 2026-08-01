import { supabase } from '../supabase-client.js';

export async function renderizarProveedores() {
    const { data: proveedores } = await supabase.from('proveedores').select('*').order('nombre');

    document.getElementById('tab-content').innerHTML = `
        <div class="bg-slate-800 rounded-lg p-6">
            <h2 class="text-xl font-bold text-white mb-4">Proveedores</h2>
            <form id="form-proveedor" class="mb-4 flex gap-2">
                <input type="text" id="prov-nombre" placeholder="Nombre" class="flex-1 bg-slate-700 border border-slate-600 rounded p-2 text-white" required>
                <input type="text" id="prov-contacto" placeholder="Contacto" class="flex-1 bg-slate-700 border border-slate-600 rounded p-2 text-white">
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded">Agregar</button>
            </form>
            <div class="space-y-2">
                ${proveedores?.map(p => `<div class="bg-slate-700 p-2 rounded">${p.nombre} ${p.contacto ? ' - ' + p.contacto : ''}</div>`).join('') || '<p class="text-slate-400">Sin proveedores.</p>'}
            </div>
        </div>
    `;

    document.getElementById('form-proveedor').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('prov-nombre').value.trim();
        const contacto = document.getElementById('prov-contacto').value.trim();
        await supabase.from('proveedores').insert([{ nombre, contacto }]);
        renderizarProveedores();
    });
}