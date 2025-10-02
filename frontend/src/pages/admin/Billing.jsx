import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'

export default function Billing(){
  const [customers,setCustomers] = useState([])
  const [rows,setRows] = useState([])
  const today = new Date().toISOString().slice(0,10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10)
  const [form,setForm] = useState({ customerId:'', startDate:monthStart, endDate:today, remaining2000:0, remaining5000:0 })

  async function load(){
    setCustomers(await api('/api/customers'))
    setRows(await api('/api/billings'))
  }
  useEffect(()=>{ load() }, [])

  async function createBill(e){
    e.preventDefault()
    await api('/api/billings', { method:'POST', body: JSON.stringify(form) })
    setForm({ ...form, customerId:'' })
    load()
  }

  async function removeBill(id){
    if(!confirm('Hapus tagihan ini?')) return
    await api('/api/billings/'+id, { method:'DELETE' })
    load()
  }

  // --- tombol Unduh PDF ---
  const downloadPDF = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${base}/api/billings/${id}/invoice.pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Gagal unduh PDF')
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `invoice-${id}.pdf`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={createBill} className="card">
        <h2 className="font-bold mb-4">Buat Penagihan</h2>
        <select className="border rounded px-3 py-2 w-full mb-3" value={form.customerId} onChange={e=>setForm({...form, customerId:e.target.value})}>
          <option value="">Pilih Pelanggan</option>
          {customers.map(c=><option key={c._id} value={c._id}>{c.name} — {c.type}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input type="date" className="border rounded px-3 py-2 w-full" value={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} />
          <input type="date" className="border rounded px-3 py-2 w-full" value={form.endDate} onChange={e=>setForm({...form, endDate:e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input type="number" className="border rounded px-3 py-2 w-full" placeholder="Sisa 2000" value={form.remaining2000} onChange={e=>setForm({...form, remaining2000:parseInt(e.target.value||0)})} />
          <input type="number" className="border rounded px-3 py-2 w-full" placeholder="Sisa 5000" value={form.remaining5000} onChange={e=>setForm({...form, remaining5000:parseInt(e.target.value||0)})} />
        </div>
        <button className="btn">Proses</button>
      </form>

      <div className="card">
        <h2 className="font-bold mb-4">Riwayat Penagihan</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Nama</th>
              <th>Jenis</th>
              <th>Penerimaan</th>
              <th>Setoran</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id} className="border-t">
                <td>{r.customerId?.name}</td>
                <td>{r.customerId?.type}</td>
                <td>Rp {((r.penerimaanToko||0)).toLocaleString()}</td>
                <td>Rp {((r.setoran||0)).toLocaleString()}</td>
                <td className="text-right space-x-3">
                  <button className="underline" onClick={()=>downloadPDF(r._id)}>Unduh PDF</button>
                  <button className="text-red-600 underline" onClick={()=>removeBill(r._id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
