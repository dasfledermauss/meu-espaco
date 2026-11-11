/* Meu Espaço — sincronização com o Firebase (Auth + Firestore).
   Carrega o SDK só quando há configuração e conexão. Sem isso, o app continua local.

   Como os dados ficam guardados:
     espacos/{uid}                     perfil, coleções, pastas, currículo
     espacos/{uid}/itens/{id}          notas, links, livros, artigos, desejos, gastos
     espacos/{uid}/lembretes/{id}      lembretes

   O login é o mesmo da tela de entrada: o token do Google vai para o Firebase Auth. */
window.Nuvem = (function () {
  'use strict';
  const CDN = 'https://www.gstatic.com/firebasejs/11.0.2/';
  const cfg = () => (window.CONFIG || {}).firebase || null;
  let sdk = null, app = null, auth = null, bd = null, uid = null, ouvindo = null;
  const ouvintes = [];

  const avisar = (evento, dado) => ouvintes.forEach((f) => { try { f(evento, dado); } catch (e) { /* ignora */ } });
  const configurado = () => { const c = cfg(); return !!(c && c.apiKey && c.projectId); };

  async function carregar() {
    if (sdk) return sdk;
    const [núcleo, autent, loja] = await Promise.all([
      import(CDN + 'firebase-app.js'),
      import(CDN + 'firebase-auth.js'),
      import(CDN + 'firebase-firestore.js')
    ]);
    sdk = { núcleo, autent, loja };
    app = núcleo.initializeApp(cfg());
    auth = autent.getAuth(app);
    try {
      bd = loja.initializeFirestore(app, { localCache: loja.persistentLocalCache({ tabManager: loja.persistentMultipleTabManager() }) });
    } catch (e) {
      bd = loja.getFirestore(app); // sem cache local (aba anônima, por exemplo)
    }
    return sdk;
  }

  /* ---------- sessão ---------- */
  async function iniciar(aoMudar) {
    if (!configurado() || !navigator.onLine) return null;
    await carregar();
    return new Promise((ok) => {
      let primeiro = true;
      sdk.autent.onAuthStateChanged(auth, (u) => {
        uid = u ? u.uid : null;
        if (primeiro) { primeiro = false; ok(u ? { uid: u.uid, email: u.email, nome: u.displayName, foto: u.photoURL } : null); }
        else aoMudar && aoMudar(u ? { uid: u.uid, email: u.email } : null);
      });
    });
  }
  async function entrarComGoogle(credencial) {
    await carregar();
    const cred = sdk.autent.GoogleAuthProvider.credential(credencial);
    const r = await sdk.autent.signInWithCredential(auth, cred);
    uid = r.user.uid;
    return { uid, email: r.user.email, nome: r.user.displayName, foto: r.user.photoURL };
  }
  async function sair() {
    pararDeOuvir();
    if (auth) { try { await sdk.autent.signOut(auth); } catch (e) { /* ignora */ } }
    uid = null;
  }

  /* ---------- leitura e escrita ---------- */
  const raiz = () => sdk.loja.doc(bd, 'espacos', uid);
  const colecao = (nome) => sdk.loja.collection(bd, 'espacos', uid, nome);

  async function baixarTudo() {
    if (!uid) return null;
    const { getDoc, getDocs } = sdk.loja;
    const [base, itens, lembretes] = await Promise.all([getDoc(raiz()), getDocs(colecao('itens')), getDocs(colecao('lembretes'))]);
    return {
      base: base.exists() ? base.data() : null,
      itens: itens.docs.map((d) => d.data()),
      lembretes: lembretes.docs.map((d) => d.data())
    };
  }

  /** Envia só o que mudou. mudancas = { base, itens: [], lembretes: [], apagar: { itens: [], lembretes: [] } } */
  async function enviar(mudancas) {
    if (!uid) return;
    const { writeBatch, doc } = sdk.loja;
    const partes = [];
    let lote = writeBatch(bd), n = 0;
    const somar = () => { if (++n >= 400) { partes.push(lote.commit()); lote = writeBatch(bd); n = 0; } };
    if (mudancas.base) { lote.set(raiz(), mudancas.base); somar(); }
    (mudancas.itens || []).forEach((i) => { lote.set(doc(colecao('itens'), i.id), i); somar(); });
    (mudancas.lembretes || []).forEach((l) => { lote.set(doc(colecao('lembretes'), l.id), l); somar(); });
    ((mudancas.apagar || {}).itens || []).forEach((id) => { lote.delete(doc(colecao('itens'), id)); somar(); });
    ((mudancas.apagar || {}).lembretes || []).forEach((id) => { lote.delete(doc(colecao('lembretes'), id)); somar(); });
    partes.push(lote.commit());
    await Promise.all(partes);
  }

  /* ---------- mudanças vindas de outro aparelho ---------- */
  function ouvir(aoReceber) {
    if (!uid || ouvindo) return;
    const { onSnapshot } = sdk.loja;
    const corta = [];
    const vindoDaquiOuCache = (snap) => snap.metadata.hasPendingWrites;
    corta.push(onSnapshot(raiz(), (d) => { if (!vindoDaquiOuCache(d) && d.exists()) aoReceber({ base: d.data() }); }));
    corta.push(onSnapshot(colecao('itens'), (s) => {
      if (vindoDaquiOuCache(s)) return;
      const muda = [], apaga = [];
      s.docChanges().forEach((c) => (c.type === 'removed' ? apaga : muda).push(c.type === 'removed' ? c.doc.id : c.doc.data()));
      if (muda.length || apaga.length) aoReceber({ itens: muda, apagarItens: apaga });
    }));
    corta.push(onSnapshot(colecao('lembretes'), (s) => {
      if (vindoDaquiOuCache(s)) return;
      const muda = [], apaga = [];
      s.docChanges().forEach((c) => (c.type === 'removed' ? apaga : muda).push(c.type === 'removed' ? c.doc.id : c.doc.data()));
      if (muda.length || apaga.length) aoReceber({ lembretes: muda, apagarLembretes: apaga });
    }));
    ouvindo = () => corta.forEach((f) => f());
  }
  function pararDeOuvir() { if (ouvindo) { ouvindo(); ouvindo = null; } }

  return { configurado, iniciar, entrarComGoogle, sair, baixarTudo, enviar, ouvir, pararDeOuvir, avisar,
    aoEvento: (f) => ouvintes.push(f), get uid() { return uid; } };
})();
