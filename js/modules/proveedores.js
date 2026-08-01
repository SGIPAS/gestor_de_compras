import { supabase } from '../supabase-client.js';

export async function renderizarProveedores() {
    const { data: proveedores } = await supabase.from('proveedores').select('*').order('nombre');

    document.getElementById('tab-content').innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">Proveedores</h2>
            <form id="form-proveedor" class="mb-4 flex gap-2">
                <input type="text" id="prov-nombre" placeholder="Nombre" class="flex-1 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required>
                <input type="text" id="prov-contacto" placeholder="Contacto" class="flex-1 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-lg font-medium transition-colors">Agregar</button>
            </form>
            <div class="space-y-2">
                ${proveedores?.map(p => `<div class="bg-gray-50 border border-gray-200 p-3 rounded-lg flex justify-between"><span class="font-medium">${p.nombre}</span><span class="text-gray-500 text-sm">${p.contacto || ''}</span></div>`).join('') || '<p class="text-gray-500 italic">Sin proveedores registrados.</p>'}
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