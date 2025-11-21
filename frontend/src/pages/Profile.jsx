import React, {useEffect, useState} from 'react'
import axios from 'axios'
export default function Profile(){
  const [user, setUser] = useState(null);
  useEffect(()=> {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('/api/me', { headers: { Authorization: 'Bearer '+token } })
      .then(r=> setUser(r.data.user))
      .catch(()=> {});
  }, []);
  if (!user) return <div>Please login to see your profile (or register)</div>;
  return (
    <div>
      <h2>My Profile</h2>
      <div>Email: {user.email}</div>
      <div>V-Bucks: {user.vbucks}</div>
    </div>
  )
}