/* Diz ao site que a captura está disponível (Vercel Serverless Function). */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, onde: 'vercel' });
}
