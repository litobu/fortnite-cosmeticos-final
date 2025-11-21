export function createProductCard(item){
  const el = document.createElement('article');
  el.className = 'product-card';

  const image = document.createElement('div');
  image.className = 'product-media';
  const imgSrc = item.image || item.images?.icon || item.thumbnail || item.icon || '';
  if(imgSrc) image.style.backgroundImage = `url("${imgSrc}")`;

  const title = document.createElement('div');
  title.className = 'product-title';
  title.textContent = item.name ?? item.title ?? 'Sem nome';

  const meta = document.createElement('div');
  meta.className = 'product-meta';
  const type = document.createElement('span');
  type.textContent = item.rarity ?? item.type ?? '';
  const price = document.createElement('span');
  price.className = 'price-badge';
  price.textContent = item.price ? `${item.price} V-Bucks` : (item.cost ?? '—');

  meta.appendChild(type);
  meta.appendChild(price);

  el.appendChild(image);
  el.appendChild(title);
  el.appendChild(meta);

  return el;
}