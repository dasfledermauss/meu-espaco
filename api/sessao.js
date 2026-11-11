/* Sessão com conta Google (Vercel Serverless Function).
   POST  { credential }  -> verifica o token do Google e cria o cookie de sessão
   GET                   -> diz quem está logado
   DELETE                -> encerra a sessão

   A CHAVE SECRETA do cliente OAuth não é usada aqui nem no site: o login pelo
   navegador usa só o ID do cliente, que é público. Guarde a chave secreta fora do projeto.

   Variáveis de ambiente (Vercel → Settings → Environment Variables):
     GOOGLE_CLIENT_ID    ID do cliente (o mesmo de assets/js/config.js)
     EMAILS_PERMITIDOS   e-mails separados por vírgula; vazio = qualquer conta Google entra
     SESSAO_SEGREDO      texto aleatório longo; sem ele a sessão cai a cada publicação
*/
import crypto from 'node:crypto';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const PERMITIDOS = (process.env.EMAILS_PERMITIDOS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
const SEGREDO = process.env.SESSAO_SEGREDO || crypto.randomBytes(32).toString('hex');
const DIAS = 30;

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64url');
const deB64 = (s) => Buffer.from(s, 'base64url').toString('utf8');
const assinar = (dados) => crypto.createHmac('sha256', SEGREDO).update(dados).digest('base64url');

function criarCookie(usuario) {
  const corpo = b64(JSON.stringify({ ...usuario, ate: Date.now() + DIAS * 864e5 }));
  return corpo + '.' + assinar(corpo);
}
function lerCookie(cabecalho) {
  const bruto = (cabecalho || '').split(';').map((c) => c.trim()).find((c) => c.startsWith('sessao='));
  if (!bruto) return null;
  const [corpo, assinatura] = decodeURIComponent(bruto.slice(7)).split('.');
  if (!corpo || !assinatura) return null;
  const esperada = assinar(corpo);
  if (assinatura.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(assinatura), Buffer.from(esperada))) return null;
  try {
    const d = JSON.parse(deB64(corpo));
    return d.ate > Date.now() ? d : null;
  } catch (e) { return null; }
}
const permitido = (email) => !PERMITIDOS.length || PERMITIDOS.includes(String(email).toLowerCase());

async function verificarToken(credential) {
  const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential));
  if (!r.ok) throw new Error('token recusado pelo Google');
  const d = await r.json();
  if (CLIENT_ID && d.aud !== CLIENT_ID) throw new Error('token de outro aplicativo');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(d.iss)) throw new Error('origem inesperada');
  if (Number(d.exp) * 1000 < Date.now()) throw new Error('token vencido');
  if (d.email_verified !== 'true' && d.email_verified !== true) throw new Error('e-mail não verificado no Google');
  return { email: d.email, nome: d.name || d.email, foto: d.picture || '' };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const seguro = (req.headers['x-forwarded-proto'] || '').includes('https');
  const base = `Path=/; HttpOnly; SameSite=Lax; ${seguro ? 'Secure; ' : ''}`;

  if (req.method === 'GET') {
    const s = lerCookie(req.headers.cookie);
    return res.status(200).json({ configurado: true, restrito: PERMITIDOS.length > 0, logado: !!s, usuario: s ? { email: s.email, nome: s.nome, foto: s.foto } : null });
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `sessao=; ${base}Max-Age=0`);
    return res.status(200).json({ logado: false });
  }
  if (req.method !== 'POST') return res.status(405).json({ erro: 'método não suportado' });

  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { corpo = {}; } }
  if (!corpo || !corpo.credential) return res.status(400).json({ erro: 'faltou o token do Google' });
  try {
    const usuario = await verificarToken(corpo.credential);
    if (!permitido(usuario.email)) return res.status(403).json({ erro: 'esta conta não tem acesso a este espaço' });
    res.setHeader('Set-Cookie', `sessao=${criarCookie(usuario)}; ${base}Max-Age=${DIAS * 86400}`);
    return res.status(200).json({ logado: true, usuario });
  } catch (e) {
    return res.status(401).json({ erro: String(e.message || e) });
  }
}
