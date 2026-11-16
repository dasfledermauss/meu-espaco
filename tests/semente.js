/* Estado de exemplo para as capturas de histórico. */
module.exports = function semente() {
  const hoje = new Date();
  const dia = (n) => { const d = new Date(hoje); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const t = (n) => { const d = new Date(hoje); d.setHours(d.getHours() - n); return d.toISOString(); };
  const it = [
    { id: 'i1', tipo: 'nota', texto: 'Ideia para a home do portfólio: abrir com um case só, grande, e o resto em lista.', cor: 'amarelo', fixado: true, colecoes: [{ id: 'col-pessoal' }], criadoEm: t(2), atualizadoEm: t(2), comentarios: [] },
    { id: 'i2', tipo: 'nota', texto: 'Perguntar ao time sobre os tokens de espaçamento do design system.', cor: 'verde', colecoes: [{ id: 'col-trabalho' }], criadoEm: t(26), atualizadoEm: t(26), comentarios: [] },
    { id: 'i3', tipo: 'link', url: 'https://iconoir.com/', titulo: 'Iconoir — biblioteca de ícones open source', descricao: 'Mais de 1.500 ícones em SVG, sem licença de uso.', site: 'iconoir.com', favorito: true, lerDepois: true, colecoes: [{ id: 'col-trabalho' }], criadoEm: t(5), atualizadoEm: t(5), comentarios: [] },
    { id: 'i4', tipo: 'link', url: 'https://lawsofux.com/', titulo: 'Laws of UX', descricao: 'Princípios de psicologia aplicados a interface.', site: 'lawsofux.com', colecoes: [{ id: 'col-trabalho' }], criadoEm: t(30), atualizadoEm: t(30), comentarios: [] },
    { id: 'i5', tipo: 'midia', formato: 'livro', titulo: 'O Design do Dia a Dia', autor: 'Don Norman', status: 'andamento', paginaAtual: 148, paginas: 320, estrelas: 5, colecoes: [{ id: 'col-pessoal' }], criadoEm: t(50), atualizadoEm: t(4), anotacoes: [{ id: 'a1', texto: 'Affordance não é a propriedade do objeto, é a relação.', criadoEm: t(4) }], comentarios: [] },
    { id: 'i6', tipo: 'midia', formato: 'filme', titulo: '将軍 — Shogun', status: 'concluido', estrelas: 4, colecoes: [{ id: 'col-pessoal' }], criadoEm: t(100), atualizadoEm: t(100), comentarios: [] },
    { id: 'i7', tipo: 'desejo', titulo: 'Teclado mecânico sem fio', url: 'https://exemplo.com/teclado', preco: 349.9, moeda: 'BRL', estrelas: 4.6, avaliacoes: 1284, loja: 'exemplo.com', capturaStatus: 'ok', capturaEm: t(10), historicoPreco: [], colecoes: [{ id: 'col-organizar' }], criadoEm: t(10), atualizadoEm: t(10), comentarios: [] },
    { id: 'i8', tipo: 'gasto', descricao: 'Assinatura de fontes', valor: 49.9, categoria: 'Trabalho', dataGasto: dia(-1), criadoEm: t(20), atualizadoEm: t(20), comentarios: [] }
  ];
  return {
    versao: 3,
    perfil: { nome: 'Seu Nome', foto: '', semFoto: true, fotoConferida: true, humores: {}, tema: 'azul', modo: 'claro' },
    colecoes: [{ id: 'col-pessoal', nome: 'Pessoal' }, { id: 'col-trabalho', nome: 'Trabalho' }, { id: 'col-organizar', nome: 'Estudo' }],
    pastas: [],
    itens: it,
    lembretes: [
      { id: 'l1', texto: 'Mandar a proposta do cliente', data: dia(0), hora: '18:00', concluido: false, criadoEm: t(8) },
      { id: 'l2', texto: 'Renovar o domínio', data: dia(4), hora: '', concluido: false, criadoEm: t(40) }
    ],
    curriculo: { perfil: {}, extras: {} },
    destinoPadrao: '',
    baseEm: t(1)
  };
};
