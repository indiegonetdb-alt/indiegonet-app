import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'

export default function Messages(){
  const [rows,setRows] = useState([])
  async function load(){ setRows(await api('/api/messages')) }
  useEffect(()=>{ load() }, [])

  async function markRead(id){
    await api('/api/messages/'+id+'/read', { method:'PUT' })
    load()
  }
  async function remove(id){
    if(!confirm('Hapus pesan?')) return
    await api('/api/messages/'+id, { method:'DELETE' })
    load()
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-xl">Pesan Masuk</h2>
      <div className="card">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Status</th><th>Subjek</th><th>Tanggal</th><th className="text-right">Aksi</th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id} className="border-t">
                <td>{r.status}</td>
                <td>{r.subject || '-'}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td className="text-right space-x-3">
                  {r.status !== 'read' && <button className="underline" onClick={()=>markRead(r._id)}>Tandai Dibaca</button>}
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
