/* crie.Ciência - app.js
   Ponto de partida da aplicação: lê o endereço (#rota) e mostra a tela certa.
   Também cuida do cabeçalho e dos botões do "Modo de teste" no rodapé. */

// menu: qual item do menu principal fica destacado em cada tela
const ROTAS = {
  painel:     { titulo: 'Painel',               desenhar: telaPainel,     menu: 'painel' },
  professor:  { titulo: 'Meu cadastro',         desenhar: telaProfessor,  menu: '' },
  alunos:     { titulo: 'Cadastro de alunos',   desenhar: telaAlunos,     menu: 'cadastros' },
  equipes:    { titulo: 'Cadastro de equipe',   desenhar: telaEquipes,    menu: 'cadastros' },
  projetos:   { titulo: 'Cadastro de projeto',  desenhar: telaProjetos,   menu: 'cadastros' },
  inscricao:  { titulo: 'Inscrição na feira',   desenhar: telaInscricao,  menu: 'cadastros' },
  resumo:     { titulo: 'Envio de resumo',      desenhar: telaResumo,     menu: 'cadastros' },
  pendencias: { titulo: 'Pendências',           desenhar: telaPendencias, menu: 'pendencias' },
  documentos: { titulo: 'Envio de documentos',  desenhar: telaDocumentos, menu: 'pendencias' },
  avaliacao:  { titulo: 'Avaliação na feira',   desenhar: telaAvaliacao,  menu: 'avaliacao' },
  avaliar:    { titulo: 'Ficha de avaliação',   desenhar: telaAvaliar,    menu: 'avaliacao' }
};

// "#resumo/pr-solar"        -> { nome: 'resumo', param: 'pr-solar', param2: '' }
// "#avaliar/in-solar/av-1"  -> { nome: 'avaliar', param: 'in-solar', param2: 'av-1' }
function lerRota() {
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  const nome = ROTAS[partes[0]] ? partes[0] : 'painel';
  return {
    nome,
    param: decodeURIComponent(partes[1] || ''),
    param2: decodeURIComponent(partes[2] || '')
  };
}

function mostrarTela(mudouDePagina) {
  const { nome, param, param2 } = lerRota();
  const rota = ROTAS[nome];
  const area = document.getElementById('conteudo');

  rota.desenhar(area, param, param2);
  document.title = `${rota.titulo} · crie.Ciência`;
  atualizarCabecalho(rota.menu, nome);

  if (mudouDePagina) {
    registrar('abriu tela ' + nome + (param ? '/' + param : '') + (param2 ? '/' + param2 : ''));
    window.scrollTo(0, 0);
    // Leva o foco ao título para quem usa teclado ou leitor de tela
    area.querySelector('h1')?.focus({ preventScroll: true });
  }
}

// Desenha a tela atual de novo, sem contar como navegação (usado após salvar)
function redesenhar() {
  const rolagem = window.scrollY;
  mostrarTela(false);
  window.scrollTo(0, rolagem);
}

function atualizarCabecalho(menuAtivo, nomeRota) {
  document.querySelectorAll('[data-menu]').forEach(link => {
    const ativo = link.dataset.menu === menuAtivo;
    link.classList.toggle('ativo', ativo);
    if (ativo) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const avatar = document.getElementById('avatar');
  const nome = db.professor?.nome || '';
  const iniciais = nome.split(/\s+/).filter(Boolean);
  avatar.textContent = iniciais.length
    ? (iniciais[0][0] + (iniciais.length > 1 ? iniciais[iniciais.length - 1][0] : '')).toUpperCase()
    : '?';
  avatar.setAttribute('aria-label', nome ? `Meu cadastro (${nome})` : 'Fazer meu cadastro');
  avatar.classList.toggle('ativo', nomeRota === 'professor');
}

/* ---------- Modo de teste ---------- */

function textoExportado() {
  return JSON.stringify({ exportadoEm: new Date().toISOString(), ...db }, null, 2);
}

function reiniciar(banco, mensagem) {
  substituirBanco(banco);
  registrar('reiniciou dados: ' + mensagem);
  avisar(mensagem);
  if (location.hash === '#painel') mostrarTela(true);
  else location.hash = '#painel';
}

async function copiarDados() {
  const texto = textoExportado();
  try {
    await navigator.clipboard.writeText(texto);
    avisar('Dados copiados. Cole em um arquivo de texto para guardar.');
  } catch (erro) {
    // Plano B para navegadores que bloqueiam a área de transferência
    const caixa = document.createElement('textarea');
    caixa.value = texto;
    document.body.appendChild(caixa);
    caixa.select();
    const ok = document.execCommand('copy');
    caixa.remove();
    avisar(ok ? 'Dados copiados.' : 'Não foi possível copiar. Use "Baixar dados".', ok ? 'sucesso' : 'erro');
  }
}

function baixarDados() {
  const arquivo = new Blob([textoExportado()], { type: 'application/json' });
  const link = document.createElement('a');
  const agora = new Date();
  link.href = URL.createObjectURL(arquivo);
  link.download = `crieciencia-sessao-${hojeISO()}-${doisDigitos(agora.getHours())}h${doisDigitos(agora.getMinutes())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function ligarModoTeste() {
  document.getElementById('teste-exemplo').addEventListener('click', () => {
    if (confirm('Apagar os dados deste navegador e carregar os dados de exemplo?')) {
      reiniciar(bancoExemplo(), 'Dados de exemplo carregados.');
    }
  });
  document.getElementById('teste-vazio').addEventListener('click', () => {
    if (confirm('Apagar todos os dados deste navegador e começar do zero?')) {
      reiniciar(bancoVazio(), 'Tudo limpo. Comece pelo seu cadastro.');
    }
  });
  document.getElementById('teste-copiar').addEventListener('click', copiarDados);
  document.getElementById('teste-baixar').addEventListener('click', baixarDados);
}

/* ---------- Início ---------- */

// O link "Pular para o conteúdo" não pode mudar o #, senão troca de tela
document.getElementById('pular').addEventListener('click', evento => {
  evento.preventDefault();
  document.getElementById('conteudo').focus();
});

window.addEventListener('hashchange', () => mostrarTela(true));
ligarModoTeste();
mostrarTela(false);
registrar('abriu o sistema na tela ' + lerRota().nome);
