import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

export default function Product(){
  const { id } = useParams();
  const [item, setItem] = useState(null);
  useEffect(()=> {
    axios.get('/api/cosmetics', { params:{id} })
      .then(r=>{
        const found = r.data.data?.find(x=> x.id === id) || null;
        setItem(found);
      })
      .catch(e=> console.error(e));
  }, [id]);

  if (!item) return <div>Loading...</div>;
  return (
    <div>
      <h2>{item.name}</h2>
      <img src={item.images?.featured || item.images?.icon} alt={item.name} style={{maxWidth:320}}/>
      <p>{item.description}</p>
    </div>
  )
}