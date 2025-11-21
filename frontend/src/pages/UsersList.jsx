import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
export default function UsersList(){
  const [users, setUsers] = useState([]);
  useEffect(()=> {
    axios.get('/api/users').then(r=> setUsers(r.data.users || []));
  }, []);
  return (
    <div>
      <h2>Registered Users</h2>
      <ul>
        {users.map(u=> <li key={u.id}><Link to={'/users/'+u.id}>{u.email}</Link></li>)}
      </ul>
    </div>
  )
}