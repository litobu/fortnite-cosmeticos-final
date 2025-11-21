import { fetchProducts } from '../api/fortniteApi.js';
import { createProductCard } from './productCard.js';


export function renderCatalog(container, items) {
    if (!container) return;
    container.innerHTML = '';
    if (!items || items.length === 0) {
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = 'Nenhum item encontrado.';
        container.appendChild(p);
        return;
    }

    items.forEach(item => {
        const card = createProductCard(item);
        container.appendChild(card);
    });
}