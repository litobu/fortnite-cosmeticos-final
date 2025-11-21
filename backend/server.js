import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'database');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = path.join(DB_DIR, 'db.sqlite');
console.log('DB path:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err)=>{
  if(err) console.error('DB open error', err);
  else console.log('DB opened');
});

// create tables
db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password_hash TEXT,
    vbucks INTEGER DEFAULT 10000,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS owned (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    cosmetic_id TEXT,
    bought_at TEXT,
    price INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    cosmetic_id TEXT,
    type TEXT,
    amount INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
});

// config
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const FORTNITE_API_BASE = process.env.FORTNITE_API_BASE || 'https://fortnite-api.io/v2';
const FORTNITE_API_KEY = process.env.FORTNITE_API_KEY || 'sua_api_key_aqui';

// middleware
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// proxy endpoints
app.get('/api/cosmetics', async (req,res)=>{
  try{
    const page = req.query.page || 1;
    const limit = req.query.limit || 24;
    const r = await axios.get(`${FORTNITE_API_BASE}/cosmetics/br`, {
      headers: { 'x-api-key': FORTNITE_API_KEY },
      params: { page, limit },
      timeout: 5000
    });
    res.json(r.data);
  }catch(e){ 
    console.error('API error:', e.message);
    res.status(500).json({error: e.message}); 
  }
});
app.get('/api/cosmetics/new', async (req,res)=>{
  try{
    const r = await axios.get(`${FORTNITE_API_BASE}/cosmetics/br/new`, {
      headers: { 'x-api-key': FORTNITE_API_KEY },
      timeout: 5000
    });
    res.json(r.data);
  }catch(e){ 
    console.error('API error:', e.message);
    res.status(500).json({error: e.message}); 
  }
});
app.get('/api/shop', async (req,res)=>{
  try{
    const r = await axios.get(`${FORTNITE_API_BASE}/shop`, {
      headers: { 'x-api-key': FORTNITE_API_KEY },
      timeout: 5000
    });
    res.json(r.data);
  }catch(e){ 
    console.error('API error:', e.message);
    res.status(500).json({error: e.message}); 
  }
});
app.get('/api/fortnite/store', async (req,res)=>{
  try{
    const r = await axios.get(`${FORTNITE_API_BASE}/cosmetics/br`, {
      headers: { 'x-api-key': FORTNITE_API_KEY },
      timeout: 5000
    });
    const items = (r.data.data || []).slice(0, 20).map(item => ({
      id: item.id,
      name: item.name,
      rarity: item.rarity?.name || 'Common',
      price: item.price?.regularPrice || 500,
      image: item.images?.icon || item.images?.featured || ''
    }));
    res.json({ items });
  }catch(e){
    console.error('API error:', e.message);
    res.json({ items: sampleItems }); // fallback
  }
});

const sampleItems = [
  { id: "1", name: "Axe of Dawn", price: 500, rarity: "Rare", image: "https://fortnite-api.com/images/cosmetics/br/v2/202d4718-cb29-4bba-b794-fc728d71b7b8/icon.png" },
  { id: "2", name: "Stealth Skin", price: 1200, rarity: "Epic", image: "https://fortnite-api.com/images/cosmetics/br/v2/8c32dd5d-57f9-4d1f-8e1e-4e1e4e1e4e1e/icon.png" },
  { id: "3", name: "Glider Master", price: 300, rarity: "Common", image: "https://fortnite-api.com/images/cosmetics/br/v2/glider/icon.png" }
];

// Nova rota para o catálogo (frontend)
// app.get('/api/fortnite/store', (req,res)=>{
//   res.json({ items: sampleItems });
// });

// auth
app.post('/api/auth/register', async (req,res)=>{
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({error:'missing'});
  const exists = await get('SELECT id FROM users WHERE email = ?', [email]);
  if(exists) return res.status(400).json({error:'email_taken'});
  const hash = await bcrypt.hash(password, 10);
  const r = await run('INSERT INTO users (email, password_hash, vbucks) VALUES (?, ?, ?)', [email, hash, 10000]);
  const user = await get('SELECT id, email, vbucks FROM users WHERE id = ?', [r.lastID]);
  const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '30d'});
  res.json({user, token});
});

app.post('/api/auth/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await get('SELECT * FROM users WHERE email = ?', [email]);
  if(!user) return res.status(400).json({error:'invalid'});
  const ok = await bcrypt.compare(password, user.password_hash);
  if(!ok) return res.status(400).json({error:'invalid'});
  const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '30d'});
  res.json({user: {id:user.id, email:user.email, vbucks:user.vbucks}, token});
});

// buy
app.post('/api/shop/buy', authMiddleware, async (req,res)=>{
  const { cosmetic_id, cosmetic_ids, price } = req.body;
  const ids = cosmetic_ids || (cosmetic_id ? [cosmetic_id] : []);
  if(ids.length===0) return res.status(400).json({error:'missing'});
  const user = await get('SELECT * FROM users WHERE id = ?', [req.userId]);
  if(!user) return res.status(404).json({error:'no_user'});
  // check owned
  for(const id of ids){
    const owned = await get('SELECT id FROM owned WHERE user_id = ? AND cosmetic_id = ?', [req.userId, id]);
    if(owned) return res.status(400).json({error:'already_owned', item: id});
  }
  const unitPrice = typeof price === 'number' ? price : 100; // default 100 vbucks per item
  const total = unitPrice * ids.length;
  if(user.vbucks < total) return res.status(400).json({error:'insufficient'});
  const now = new Date().toISOString();
  for(const id of ids){
    await run('INSERT INTO owned (user_id, cosmetic_id, bought_at, price) VALUES (?, ?, ?, ?)', [req.userId, id, now, unitPrice]);
  }
  await run('UPDATE users SET vbucks = vbucks - ? WHERE id = ?', [total, req.userId]);
  await run('INSERT INTO transactions (user_id, cosmetic_id, type, amount) VALUES (?, ?, ?, ?)', [req.userId, null, 'buy', -total]);
  const updated = await get('SELECT id, email, vbucks FROM users WHERE id = ?', [req.userId]);
  res.json({ok:true, vbucks: updated.vbucks});
});

// refund
app.post('/api/shop/refund', authMiddleware, async (req,res)=>{
  const { cosmetic_id } = req.body;
  if(!cosmetic_id) return res.status(400).json({error:'missing'});
  const owned = await get('SELECT * FROM owned WHERE user_id = ? AND cosmetic_id = ?', [req.userId, cosmetic_id]);
  if(!owned) return res.status(400).json({error:'not_owned'});
  const price = owned.price || 100;
  await run('DELETE FROM owned WHERE id = ?', [owned.id]);
  await run('UPDATE users SET vbucks = vbucks + ? WHERE id = ?', [price, req.userId]);
  await run('INSERT INTO transactions (user_id, cosmetic_id, type, amount) VALUES (?, ?, ?, ?)', [req.userId, cosmetic_id, 'refund', price]);
  const updated = await get('SELECT id, email, vbucks FROM users WHERE id = ?', [req.userId]);
  res.json({ok:true, vbucks: updated.vbucks});
});

// my owned
app.get('/api/me/owned', authMiddleware, async (req,res)=>{
  const rows = await all('SELECT cosmetic_id, bought_at, price FROM owned WHERE user_id = ?', [req.userId]);
  res.json({owned: rows});
});
app.get('/api/me', authMiddleware, async (req,res)=>{
  const user = await get('SELECT id, email, vbucks FROM users WHERE id = ?', [req.userId]);
  res.json({user});
});
app.get('/api/me/history', authMiddleware, async (req,res)=>{
  const tx = await all('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
  res.json({tx});
});

// public users
app.get('/api/users', async (req,res)=>{
  const page = parseInt(req.query.page||'1'); const limit = parseInt(req.query.limit||'20'); const offset=(page-1)*limit;
  const users = await all('SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
  res.json({page, limit, users});
});
app.get('/api/users/:id', async (req,res)=>{
  const uid = req.params.id;
  const user = await get('SELECT id, email, created_at FROM users WHERE id = ?', [uid]);
  if(!user) return res.status(404).json({error:'no_user'});
  const owned = await all('SELECT cosmetic_id, bought_at FROM owned WHERE user_id = ?', [uid]);
  res.json({user, owned});
});

// serve frontend (DEVE SER O ÚLTIMO - após TODAS as rotas da API)
app.get('*', (req,res)=>{
  const index = path.join(__dirname, '../frontend/dist/index.html');
  if(fs.existsSync(index)) return res.sendFile(index);
  return res.status(404).send('Frontend build not found.');
});

app.listen(PORT, ()=> console.log('Server listening on', PORT));

// helpers
function run(sql, params=[]){ return new Promise((res, rej)=> db.run(sql, params, function(err){ if(err) rej(err); else res(this); })); }
function all(sql, params=[]){ return new Promise((res, rej)=> db.all(sql, params, (err, rows)=> err ? rej(err) : res(rows))); }
function get(sql, params=[]){ return new Promise((res, rej)=> db.get(sql, params, (err, row)=> err ? rej(err) : res(row))); }

function authMiddleware(req,res,next){
  const a = req.headers.authorization;
  if(!a) return res.status(401).json({error:'unauth'});
  const token = a.replace('Bearer ','');
  jwt.verify(token, JWT_SECRET, (err, decoded)=>{
    if(err) return res.status(401).json({error:'unauth'});
    req.userId = decoded.id;
    next();
  });
}
