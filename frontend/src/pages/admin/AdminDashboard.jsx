import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'

export default function AdminDashboard(){
  const [stats,setStats] = useState(null)
  const [err,setErr] = useState(null)

  useEffect(()=>{
    (async ()=>{
      try{
        const bills = await api('/api/billings')
        const totalPenerimaan = bills.reduce((a,b)=> a+(b.penerimaanToko||0), 0)
        const totalSetoran = bills.reduce((a,b)=> a+(b.setoran||0), 0)
        const tokoCount = bills.filter(b=>b.customerId?.type==='toko').length
        const bulananCount = bills.filter(b=>b.customerId?.type==='bulanan').length
        setStats({ totalPenerimaan, totalSetoran, tokoCount, bulananCount })
      }catch(e){ setErr(e.message) }
    })()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Dashboard Admin</h1>
      {err && <div className="text-red-600">{err}</div>}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card"><div className="text-sm">Penerimaan Toko</div><div className="text-2xl font-bold">Rp {stats.totalPenerimaan.toLocaleString()}</div></div>
          <div className="card"><div className="text-sm">Setoran</div><div className="text-2xl font-bold">Rp {stats.totalSetoran.toLocaleString()}</div></div>
          <div className="card"><div className="text-sm">Tagihan Toko</div><div className="text-2xl font-bold">{stats.tokoCount}</div></div>
          <div className="card"><div className="text-sm">Tagihan Bulanan</div><div className="text-2xl font-bold">{stats.bulananCount}</div></div>
        </div>
      )}
    </div>
  )
}
