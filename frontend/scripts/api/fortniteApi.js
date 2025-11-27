// Proxy para a rota do backend (/api/fortnite/store)
export async function fetchStore(){
  const res = await fetch('/https://backend-f6oa.onrender.comapi/fortnite/store');
  if(!res.ok) throw new Error('Falha ao obter loja');
  const data = await res.json();
  return data.items ?? data;
}