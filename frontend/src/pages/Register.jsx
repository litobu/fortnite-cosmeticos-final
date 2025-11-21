import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [email,setEmail]=useState(''); const [pw,setPw]=useState('');
  const nav = useNavigate();
  async function submit(e){
    e.preventDefault();
    try{
      const r = await axios.post('/api/auth/register',{email, password: pw});
      localStorage.setItem('token', r.data.token);
      nav('/');
    }catch(err){ alert('error: '+ (err.response?.data?.error || err.message)); }
  }
  return (
    <form onSubmit={submit}>
      <h2>Register</h2>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
      <button type="submit">Register</button>
    </form>
  )
}