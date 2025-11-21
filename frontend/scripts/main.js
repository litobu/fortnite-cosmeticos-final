// Entry do frontend — carrega catálogo e renderiza
import { fetchStore } from './api/fortniteApi.js';
import { renderCatalog } from './components/catalog.js';

const catalogEl = document.getElementById('catalog');

async function load(){
  try{
    console.log('1. catalogEl existe?', catalogEl);
    
    if(catalogEl) catalogEl.innerHTML = '<p class="muted">Carregando catálogo...</p>';
    
    console.log('2. Chamando fetchStore...');
    const items = await fetchStore();
    console.log('3. Items recebidos:', items);
    
    if(!items || items.length === 0){
      console.log('4. Nenhum item retornado');
      if(catalogEl) catalogEl.innerHTML = '<p class="muted">Nenhum item encontrado.</p>';
      return;
    }
    
    console.log('5. Renderizando catálogo...');
    renderCatalog(catalogEl, items);
    console.log('6. Catálogo renderizado com sucesso');
  }catch(err){
    console.error('Erro:', err);
    if(catalogEl) catalogEl.innerHTML = `<p class="muted">Erro: ${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', load);