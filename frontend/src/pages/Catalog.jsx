import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Catalog(){
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(()=> {
    axios.get('/api/cosmetics', { params: { page, limit: 24 } })
      .then(r=> setItems(r.data.data || []))
      .catch(e=> console.error(e));
  }, [page]);

  return (
    <div>
      <h2>Catalog</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12}}>
        {items.map(it=> (
          <div key={it.id} style={{border:'1px solid #ddd', padding:10, borderRadius:8}}>
            <Link to={`/product/${it.id}`}>
              <img src={it.images?.icon || it.images?.featured} alt={it.name} style={{width:'100%',height:100,objectFit:'contain'}}/>
              <div style={{fontWeight:700}}>{it.name}</div>
              <div style={{fontSize:12}}>{it.rarity?.value} - {it.type?.value}</div>
            </Link>
          </div>
        ))}
      </div>
      <div style={{marginTop:12}}>
        <button onClick={()=> setPage(p=> Math.max(1,p-1))}>Prev</button>
        <span style={{margin: '0 8px'}}>Page {page}</span>
        <button onClick={()=> setPage(p=> p+1)}>Next</button>
      </div>
    </div>
  )
}