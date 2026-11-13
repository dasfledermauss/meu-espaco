/* Meu Espaço — biblioteca de frases do pet.

   O pet escolhe uma frase conforme o que está acontecendo: o que você guardou, lembretes e tarefas,
   o tempo, o dia da semana, a hora do dia ou o tempo que você ficou fora.
   Marcadores: {t} título do item ou lembrete, {n} um número, {nome} o seu primeiro nome (sai sozinho se
   não houver nome; escreva sempre no fim da frase: "Bom dia, {nome}!").
   Para acrescentar frases, basta incluir mais linhas nas listas abaixo. */
window.PET_FRASES = {
  oi: {
    amanhecer: ['Bom dia, {nome}! O sol mal nasceu.', 'Acordou cedo hoje, hein, {nome}?', 'Que céu bonito de amanhecer!'],
    manha: ['Bom dia, {nome}! Pronto para hoje?', 'Manhã boa para fazer coisas.', 'Bom dia! Já tomou água?'],
    tarde: ['Boa tarde, {nome}!', 'A tarde está passando, vamos ver o que falta?', 'Boa tarde! Dá tempo de fazer mais uma coisinha.'],
    entardecer: ['Que luz bonita de fim de tarde.', 'Já está entardecendo, {nome}.', 'O dia foi bom até aqui?'],
    noite: ['Boa noite, {nome}!', 'Já é noite. Não esqueça de descansar.', 'Hora de ir devagar e aproveitar a calma.']
  },
  saudade: ['Senti sua falta, {nome}!', 'Você voltou! Estava com saudade.', 'Que bom te ver de novo!', 'Fiquei aqui esperando você, {nome}.'],
  sumiu: ['Você sumiu! Já ia mandar procurar.', 'Quanto tempo, {nome}! Estava com muita saudade.', 'Nossa, faz tempo! Senti muito a sua falta.'],
  elogio: ['Você está indo muito bem, {nome}.', 'Que espaço bonito você montou!', 'Você tem muito bom gosto.', 'Tudo aqui tem a sua cara, {nome}.', 'Que orgulho de você!', 'Você é organizado, hein?', 'Seu espaço está ficando lindo.'],
  carinho: ['Gosto muito de você, {nome}.', 'Você é o meu humano favorito.', 'Gosto de ficar aqui com você.', 'Estou feliz de estar aqui.', 'Obrigado por cuidar de mim, {nome}.', 'Sabia que você é demais?', 'Adoro quando você aparece por aqui.'],
  fim: {
    seg: ['Segunda-feira! Calma, o fim de semana vem aí.', 'Começou a semana. Eu torço por você, {nome}!'],
    meio: ['Já estou ansioso pelo fim de semana! Faltam {n} dias.', 'Faltam {n} dias para o fim de semana. Tô contando!', 'Quase lá! Fim de semana chegando, {nome}.'],
    sex: ['Sextou! Tô ansioso pro fim de semana!', 'Amanhã é sábado! Mal posso esperar, {nome}.', 'Falta pouco! Vamos brincar muito neste fim de semana?'],
    fds: ['Fim de semana! Bora brincar de bolinha?', 'Que bom que é fim de semana, {nome}. Vamos descansar.', 'Hoje é dia de passear. Quem sabe uma voltinha?']
  },
  post: {
    nota: ['Li a sua nota “{t}”. Gostei!', 'Boa ideia essa nota: “{t}”.', 'Gostei da nota “{t}”, {nome}.'],
    imagem: ['Que imagem legal, {nome}!', 'Gostei da imagem que você guardou.', 'Que foto bonita você guardou hoje.'],
    link: ['Esse link “{t}” parece interessante.', 'Vai ler “{t}” depois? Quero saber o que achou.', 'Guardou “{t}”. Boa escolha!'],
    livro: ['Você guardou “{t}”. Que legal, {nome}!', 'Quero saber o que você acha de “{t}” quando terminar.', '“{t}” parece um bom livro.'],
    filme: ['Você guardou “{t}”. Quero assistir junto!', 'Ótimo filme, “{t}”. Pipoca, {nome}?', 'Vai assistir “{t}”? Me conta depois.'],
    tarefa: ['Criou a tarefa “{t}”. Eu acredito em você!', 'Vi a tarefa “{t}”. Dá conta fácil, {nome}.'],
    feita: ['Terminou “{t}”! Parabéns, {nome}!', '“{t}” está pronta. Que orgulho!', 'Mais uma tarefa feita: “{t}”. Mandou bem!'],
    desejo: ['Gostei de “{t}” na vitrine. Vai comprar, {nome}?', '“{t}” é uma boa escolha. Quem sabe um dia?', 'Está namorando “{t}”, né? Eu entendo.'],
    musica: ['Que música boa: “{t}”!', 'Gosto de “{t}”. Aumenta o som?', 'Boa trilha, {nome}. “{t}” combina com o dia.'],
    artigo: ['Estudando “{t}”? Que orgulho!', 'Guardou “{t}” para estudar. Bom demais.', 'Quanto conhecimento guardado, {nome}.'],
    gasto: ['Anotou um gasto. Controle é tudo, {nome}!', 'Bom ter tudo anotado, hein?'],
    generico: ['Vi que você guardou “{t}”. Que legal!', 'Gostei do que você guardou hoje, {nome}.']
  },
  alerta: {
    lembreteHoje: ['Tem lembrete para hoje: “{t}”. Dá uma olhada!', 'Não esquece: “{t}” é hoje, {nome}.', 'Olha os lembretes! “{t}” está esperando.'],
    lembreteAtrasado: ['O lembrete “{t}” já passou da hora. Vamos ver?', 'Tem lembrete atrasado: “{t}”. Dá uma olhada, {nome}.'],
    tarefaAtrasada: ['A tarefa “{t}” está atrasada. Vamos resolver?', 'Passou do prazo de “{t}”, mas ainda dá tempo, {nome}.'],
    tarefaHoje: ['“{t}” vence hoje. Eu ajudo torcendo!', 'Hoje é o prazo de “{t}”, {nome}.'],
    tarefasAbertas: ['Você tem {n} tarefas abertas. Uma de cada vez!', 'Tem {n} tarefas esperando. Dá uma olhada nos alertas.'],
    feitasHoje: ['Já fez {n} tarefa(s) hoje! Que orgulho!', '{n} tarefa(s) feita(s) hoje. Você é demais, {nome}.']
  },
  tempo: {
    chuva: ['Vai chover hoje ({n}%). Leva guarda-chuva, {nome}!', 'Chuva a caminho! Eu fico aqui na casinha.', 'Dia de chuva. Bom para ficar quietinho.'],
    calor: ['Está quente lá fora: {n}°! Bebe água, {nome}.', '{n}° hoje! Eu quero um banho.', 'Calorão de {n}°. Hidrate-se!'],
    frio: ['Está frio: {n}°. Se agasalha, {nome}!', 'Frio de {n}°... Quero um cobertor.', '{n}° lá fora. Hoje é dia de aconchego.'],
    sol: ['Dia lindo lá fora! Bora dar uma volta?', 'O tempo está ótimo hoje, {nome}.', 'Céu limpo e {n}°. Perfeito para passear!'],
    nublado: ['Dia nublado, mas bom para ficar por aqui.', 'Céu fechado hoje. Eu fico com você, {nome}.']
  }
};
