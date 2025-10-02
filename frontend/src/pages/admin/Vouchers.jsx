import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'

export default function Vouchers(){
  const [customers,setCustomers] = useState([])
  const [rows,setRows] = useState([])
  const [form,setForm] = useState({ customerId:'', voucherType:2000, quantity:1 })

  async function load(){
    const cs = await api('/api/customers')
    setCustomers(cs.filter(c=>c.type==='toko'))
    setRows(await api('/api/voucher-shipments'))
  }
  useEffect(()=>{ load() }, [])

  async function save(e){
    e.preventDefault()
    await api('/api/voucher-shipments', { method:'POST', body: JSON.stringify(form) })
    setForm({ customerId:'', voucherType:2000, quantity:1 })
    load()
  }

  async function remove(id){
    if(!confirm('Hapus entri?')) return
    await api('/api/voucher-shipments/'+id, { method:'DELETE' })
    load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={save} className="card">
        <h2 className="font-bold mb-4">Pengiriman Vocer (Toko)</h2>
        <select className="border rounded px-3 py-2 w-full mb-3" value={form.customerId} onChange={e=>setForm({...form, customerId:e.target.value})}>
          <option value="">Pilih Toko</option>
          {customers.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2 w-full mb-3" value={form.voucherType} onChange={e=>setForm({...form, voucherType:parseInt(e.target.value)})}>
          <option value={2000}>Vocer 2.000</option>
          <option value={5000}>Vocer 5.000</option>
        </select>
        <input type="number" className="border rounded px-3 py-2 w-full mb-3" value={form.quantity} onChange={e=>setForm({...form, quantity:parseInt(e.target.value||1)})} />
        <button className="btn">Simpan</button>
      </form>

      <div className="card">
        <h2 className="font-bold mb-4">Riwayat</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Toko</th><th>Jenis</th><th>Qty</th><th className="text-right">Aksi</th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id} className="border-t">
                <td>{r.customerId?.name}</td>
                <td>{r.voucherType}</td>
                <td>{r.quantity}</td>
                <td className="text-right"><button className="text-red-600 underline" onClick={()=>remove(r._id)}>Hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
