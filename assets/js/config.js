/* Configuração pública do Meu Espaço.
   Estes valores são públicos por natureza: o ID do cliente OAuth aparece no endereço do
   login do Google, e a apiKey do Firebase identifica o projeto, não autoriza nada sozinha.
   Quem protege os dados são as regras do Firestore (firestore.rules) e a lista de
   e-mails liberados no servidor. A CHAVE SECRETA do cliente OAuth não entra aqui. */
window.CONFIG = {
  googleClientId: '796153463308-gl5uikl4gedb49vgpl9h7ffcvq2tmm6o.apps.googleusercontent.com',
  firebase: {
    apiKey: 'AIzaSyAxBjr8e419CNR264XP_Dk5dJbzQC7gcKQ',
    authDomain: 'meu-espaco-fde5d.firebaseapp.com',
    projectId: 'meu-espaco-fde5d',
    storageBucket: 'meu-espaco-fde5d.firebasestorage.app',
    messagingSenderId: '871044974698',
    appId: '1:871044974698:web:c59f305addb41b3c87e213'
  }
};
