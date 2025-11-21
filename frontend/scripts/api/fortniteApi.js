// Proxy para a rota do backend (/api/fortnite/store)
export async function fetchStore(){
  const res = await fetch('/api/fortnite/store');
  if(!res.ok) throw new Error('Falha ao obter loja');
  const data = await res.json();
  return data.items ?? data;
}