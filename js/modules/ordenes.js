import { supabase } from '../supabase-client.js';
import { currentUser } from './auth.js';

// Formulario para nueva orden
export async function renderizarFormulario() {
    const { data: proveedores } = await supabase.from('proveedores').select('*').order('nombre');
    const opciones = proveedores?.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('') || '';

    const html = `
        <div class="bg-slate-800 rounded-lg p-6">
            <h2 class="text-xl font-bold text-white mb-4">Nueva Orden de Compra</h2>
            <form id="form-orden" class="space-y-4">
                <div>
                    <label class="block text-sm text-slate-400">Proveedor</label>
                    <select id="orden-proveedor" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
                        <option value="">Seleccione...</option>
                        ${opciones}
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-slate-400">Número de Pedido</label>
                    <input type="text" id="orden-pedido" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
                </div>
                <div>
                    <label class="block text-sm text-slate-400">Descripción</label>
                    <textarea id="orden-desc" rows="2" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required></textarea>
                </div>
                <div>
                    <label class="block text-sm text-slate-400">Monto (USD)</label>
                    <input type="number" step="0.01" id="orden-monto" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white" required>
                </div>
                <div>
                    <label class="block text-sm text-slate-400">Estado</label>
                    <select id="orden-estado" class="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
                        <option value="pendiente">Pendiente</option>
                        <option value="en_camino">En camino</option>
                        <option value="recibido">Recibido</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">Guardar Orden</button>
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

// Lista de órdenes con botón para recibir
export async function renderizarLista() {
    const { data: ordenes } = await supabase
        .from('ordenes_compra')
        .select('*, proveedores(nombre)')
        .order('fecha_pedido', { ascending: false });

    let html = `<div class="bg-slate-800 rounded-lg p-6">
        <h2 class="text-xl font-bold text-white mb-4">Órdenes de Compra</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-700 text-slate-300 uppercase">
                    <tr><th class="p-2">Fecha</th><th class="p-2">Proveedor</th><th class="p-2">Descripción</th><th class="p-2">Monto</th><th class="p-2">Estado</th><th class="p-2">Acción</th></tr>
                </thead>
                <tbody class="divide-y divide-slate-700">`;

    ordenes?.forEach(o => {
        html += `<tr class="hover:bg-slate-750">
            <td class="p-2">${new Date(o.fecha_pedido).toLocaleDateString('es-VE')}</td>
            <td class="p-2">${o.proveedores?.nombre || '--'}</td>
            <td class="p-2">${o.descripcion}</td>
            <td class="p-2">$${o.monto.toFixed(2)}</td>
            <td class="p-2">${badgeEstado(o.estado)}</td>
            <td class="p-2">
                ${o.estado !== 'recibido' ? `<button class="btn-recibir text-green-400 hover:underline text-xs" data-id="${o.id}">✅ Recibir</button>` : ''}
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
        pendiente: 'bg-yellow-900/50 text-yellow-300',
        en_camino: 'bg-blue-900/50 text-blue-300',
        recibido: 'bg-green-900/50 text-green-300'
    };
    return `<span class="px-2 py-1 rounded text-xs font-semibold ${colores[estado]}">${estado.replace('_', ' ')}</span>`;
}