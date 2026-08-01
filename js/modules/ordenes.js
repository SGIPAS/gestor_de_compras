import { supabase } from '../supabase-client.js';
import { currentUser } from './auth.js';

export async function renderizarFormulario() {
    const { data: proveedores } = await supabase.from('proveedores').select('*').order('nombre');
    const opciones = proveedores?.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('') || '';

    const html = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">Nueva Orden de Compra</h2>
            <form id="form-orden" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-600">Proveedor</label>
                    <select id="orden-proveedor" class="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                        <option value="">Seleccione...</option>
                        ${opciones}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-600">Número de Pedido</label>
                    <input type="text" id="orden-pedido" class="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-600">Descripción</label>
                    <textarea id="orden-desc" rows="2" class="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-600">Monto (USD)</label>
                    <input type="number" step="0.01" id="orden-monto" class="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-600">Estado</label>
                    <select id="orden-estado" class="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                        <option value="pendiente">Pendiente</option>
                        <option value="en_camino">En camino</option>
                        <option value="recibido">Recibido</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg transition-colors">Guardar Orden</button>
            </form>
        </div>
    `;

    document.getElementById('tab-content').innerHTML = html;

    document.getElementById('form-orden').addEventListener('submit', async (e) => {
        e.preventDefault();
        const proveedor_id = document.getElementById('orden-proveedor').value;
        const numero_pedido = document.getElementById('orden-pedido').value.trim();
        const descripcion = document.getElementById('orden-desc').value.trim();
        const monto = parseFloat(document.getElementById('orden-monto').value);
        const estado = document.getElementById('orden-estado').value;
        const fecha_recepcion = estado === 'recibido' ? new Date().toISOString().split('T')[0] : null;

        if (!proveedor_id) return alert('Seleccione un proveedor.');

        const { error } = await supabase.from('ordenes_compra').insert([{
            proveedor_id, numero_pedido, descripcion, monto, estado,
            fecha_recepcion, registrado_por: currentUser.id
        }]);
        if (error) return alert('Error: ' + error.message);
        alert('Orden guardada.');
        document.getElementById('form-orden').reset();
    });
}

export async function renderizarLista() {
    const { data: ordenes } = await supabase
        .from('ordenes_compra')
        .select('*, proveedores(nombre)')
        .order('fecha_pedido', { ascending: false });

    let html = `<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Órdenes de Compra</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-100 text-gray-600 uppercase">
                    <tr><th class="p-3 font-semibold">Fecha</th><th class="p-3 font-semibold">Proveedor</th><th class="p-3 font-semibold">Descripción</th><th class="p-3 font-semibold">Monto</th><th class="p-3 font-semibold">Estado</th><th class="p-3 font-semibold">Acción</th></tr>
                </thead>
                <tbody class="divide-y divide-gray-200">`;

    ordenes?.forEach(o => {
        html += `<tr class="hover:bg-gray-50">
            <td class="p-3">${new Date(o.fecha_pedido).toLocaleDateString('es-VE')}</td>
            <td class="p-3 font-medium text-gray-800">${o.proveedores?.nombre || '--'}</td>
            <td class="p-3">${o.descripcion}</td>
            <td class="p-3 font-medium">$${o.monto.toFixed(2)}</td>
            <td class="p-3">${badgeEstado(o.estado)}</td>
            <td class="p-3">
                ${o.estado !== 'recibido' ? `<button class="btn-recibir bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-medium transition-colors" data-id="${o.id}">✅ Recibir</button>` : ''}
            </td>
        </tr>`;
    });

    html += `</tbody></table></div></div>`;
    document.getElementById('tab-content').innerHTML = html;

    document.querySelectorAll('.btn-recibir').forEach(btn => {
        btn.addEventListener('click', async () => {
            await supabase.from('ordenes_compra').update({
                estado: 'recibido',
                fecha_recepcion: new Date().toISOString().split('T')[0]
            }).eq('id', btn.dataset.id);
            renderizarLista();
        });
    });
}

function badgeEstado(estado) {
    const colores = {
        pendiente: 'bg-yellow-100 text-yellow-700',
        en_camino: 'bg-blue-100 text-blue-700',
        recibido: 'bg-green-100 text-green-700'
    };
    return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold ${colores[estado]}">${estado.replace('_', ' ')}</span>`;
}