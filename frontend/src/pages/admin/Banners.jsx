import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'

export default function Banners(){
  const [rows,setRows] = useState([])
  const [form,setForm] = useState({ imageUrl:'', title:'', active:true })

  async function load(){ setRows(await api('/api/banners')) }
  useEffect(()=>{ load() }, [])

  async function save(e){
    e.preventDefault()
    await api('/api/banners', { method:'POST', body: JSON.stringify(form) })
    setForm({ imageUrl:'', title:'', active:true })
    load()
  }
  async function toggleActive(b){
    await api('/api/banners/'+b._id, { method:'PUT', body: JSON.stringify({ active: !b.active }) })
    load()
  }
  async function remove(id){
    if(!confirm('Hapus banner?')) return
    await api('/api/banners/'+id, { method:'DELETE' })
    load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={save} className="card">
        <h2 className="font-bold mb-4">Tambah Banner</h2>
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Image URL" value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})} />
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Judul" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
        <label className="block mb-3">
          <input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} /> Aktif
        </label>
        <button className="btn">Simpan</button>
      </form>

      <div className="card">
        <h2 className="font-bold mb-4">Daftar Banner Aktif</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map(b=>(
            <div key={b._id} className="border rounded-lg overflow-hidden">
              <img src={b.imageUrl} className="w-full h-32 object-cover" />
              <div className="p-3">
                <div className="font-semibold">{b.title || '-'}</div>
                <div className="text-xs mb-2">Status: {b.active? 'Aktif':'Nonaktif'}</div>
                <div className="flex justify-between text-sm">
                  <button className="underline" onClick={()=>toggleActive(b)}>{b.active? 'Nonaktifkan':'Aktifkan'}</button>
                  <button className="text-red-600 underline" onClick={()=>remove(b._id)}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
