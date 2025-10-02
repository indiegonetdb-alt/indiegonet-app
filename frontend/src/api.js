const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export async function api(path, opts={}){
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error((await res.json()).msg || 'Request failed');
  return res.json();
}
