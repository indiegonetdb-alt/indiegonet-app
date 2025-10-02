import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'

export default function Reports(){
  const [rows,setRows] = useState([])
  const [from,setFrom] = useState('')
  const [to,setTo] = useState('')
  const [type,setType] = useState('')

  async function load(){
    const qs = new URLSearchParams()
    if(from) qs.set('from', from)
    if(to) qs.set('to', to)
    if(type) qs.set('type', type)
    const list = await api(`/api/billings${qs.toString()?`?${qs.toString()}`:''}`)
    setRows(list)
  }
  useEffect(()=>{ load() }, [])

  const downloadCSV = async ()=>{
    const token = localStorage.getItem('token')
    const qs = new URLSearchParams()
    if(from) qs.set('from', from)
    if(to) qs.set('to', to)
    if(type) qs.set('type', type)
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const res = await fetch(`${base}/api/reports/csv${qs.toString()?`?${qs.toString()}`:''}`, {
      headers:{ Authorization: `Bearer ${token}` }
    })
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'laporan.csv'
    a.click()
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-xl">Laporan</h2>
      <div className="card grid md:grid-cols-5 gap-3">
        <input type="date" className="border rounded px-3 py-2 w-full" value={from} onChange={e=>setFrom(e.target.value)} />
        <input type="date" className="border rounded px-3 py-2 w-full" value={to} onChange={e=>setTo(e.target.value)} />
        <select className="border rounded px-3 py-2 w-full" value={type} onChange={e=>setType(e.target.value)}>
          <option value="">Semua</option>
          <option value="toko">Toko</option>
          <option value="bulanan">Bulanan</option>
        </select>
        <button className="btn" onClick={load}>Filter</button>
        <button className="btn" onClick={downloadCSV}>Export CSV</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Tanggal</th><th>Nama</th><th>Jenis</th><th>Penerimaan</th><th>Setoran</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r._id} className="border-t">
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>{r.customerId?.name}</td>
                <td>{r.customerId?.type}</td>
                <td>Rp {((r.penerimaanToko||0)).toLocaleString()}</td>
                <td>Rp {((r.setoran||0)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
