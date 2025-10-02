import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'

export default function Customers(){
  const [rows,setRows] = useState([])
  const [form,setForm] = useState({ name:'', type:'toko', percent:0, monthlyAmount:0 })
  const [err,setErr] = useState(null)

  async function load(){
    try{ setRows(await api('/api/customers')); }
    catch(e){ setErr(e.message) }
  }
  useEffect(()=>{ load() }, [])

  async function save(e){
    e.preventDefault()
    setErr(null)
    try{
      await api('/api/customers', { method:'POST', body: JSON.stringify(form) })
      setForm({ name:'', type:'toko', percent:0, monthlyAmount:0 })
      load()
    }catch(e){ setErr(e.message) }
  }

  async function remove(id){
    if(!confirm('Hapus pelanggan?')) return
    await api('/api/customers/'+id, { method:'DELETE' })
    load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={save} className="card">
        <h2 className="font-bold mb-4">Tambah Pelanggan</h2>
        {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Nama" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <div className="mb-3">
          <label className="mr-3"><input type="radio" checked={form.type==='toko'} onChange={()=>setForm({...form, type:'toko'})}/> Toko</label>
          <label className="ml-6"><input type="radio" checked={form.type==='bulanan'} onChange={()=>setForm({...form, type:'bulanan'})}/> Bulanan</label>
        </div>
        {form.type==='toko' ? (
          <input type="number" className="border rounded px-3 py-2 w-full mb-3" placeholder="Persenan (mis. 0.1)" value={form.percent} onChange={e=>setForm({...form, percent:parseFloat(e.target.value)})} />
        ):(
          <input type="number" className="border rounded px-3 py-2 w-full mb-3" placeholder="Jumlah Pembayaran / bulan" value={form.monthlyAmount} onChange={e=>setForm({...form, monthlyAmount:parseInt(e.target.value||0)})} />
        )}
        <button className="btn">Simpan</button>
      </form>

      <div className="card">
        <h2 className="font-bold mb-4">Daftar Pelanggan</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Nama</th><th>Jenis</th><th className="text-right">Aksi</th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id} className="border-t">
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td className="text-right">
                  <button className="text-red-600 underline" onClick={()=>remove(r._id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
