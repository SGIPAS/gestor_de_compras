import { supabase } from '../supabase-client.js';

export async function renderizarResumen() {
    const { data } = await supabase.from('ordenes_compra').select('*');

    const mensual = {};
    data?.forEach(o => {
        const mes = o.fecha_pedido?.substring(0, 7);
        if (mes) {
            mensual[mes] = mensual[mes] || { total: 0, recibido: 0, pendiente: 0, en_camino: 0 };
            mensual[mes].total += o.monto;
            if (o.estado === 'recibido') mensual[mes].recibido += o.monto;
            if (o.estado === 'pendiente') mensual[mes].pendiente += o.monto;
            if (o.estado === 'en_camino') mensual[mes].en_camino += o.monto;
        }
    });

    let html = `<div class="bg-slate-800 rounded-lg p-6">
        <h2 class="text-xl font-bold text-white mb-4">Resumen Mensual de Gastos</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-700 text-slate-300 uppercase">
                    <tr><th class="p-2">Mes</th><th class="p-2">Total</th><th class="p-2">Recibido</th><th class="p-2">Pendiente</th><th class="p-2">En Camino</th></tr>
                </thead>
                <tbody class="divide-y divide-slate-700">`;

    Object.keys(mensual).sort().reverse().forEach(mes => {
        const m = mensual[mes];
        html += `<tr class="hover:bg-slate-750">
            <td class="p-2">${mes}</td>
            <td class="p-2">$${m.total.toFixed(2)}</td>
            <td class="p-2">$${m.recibido.toFixed(2)}</td>
            <td class="p-2">$${m.pendiente.toFixed(2)}</td>
            <td class="p-2">$${m.en_camino.toFixed(2)}</td>
        </tr>`;
    });

    html += `</tbody></table></div></div>`;
    document.getElementById('tab-content').innerHTML = html;
}