/* crie.Ciência - avaliacao.js
   Telas do perfil de avaliador da feira.
   O avaliador vê só os projetos que a organização distribuiu para ele
   (alocações) e preenche uma ficha com critérios de 1 a 5.
   Enquanto não existe login, o perfil é trocado pelo rodapé do protótipo. */

// Critérios da ficha. Baseados nos itens mais comuns em fichas de feiras
// escolares (problema, método, resultados, criatividade, apresentação, relevância).
const CRITERIOS = [
  { id: 'problema',     nome: 'Problema e objetivo',      ajuda: 'A pergunta da pesquisa é clara e o objetivo combina com ela.' },
  { id: 'metodo',       nome: 'Método',                   ajuda: 'A equipe explica como fez e os passos são adequados ao objetivo.' },
  { id: 'resultados',   nome: 'Resultados e conclusões',  ajuda: 'Os dados foram registrados e as conclusões saem deles.' },
  { id: 'criatividade', nome: 'Criatividade',             ajuda: 'A ideia ou a solução traz algo novo para a escola ou a comunidade.' },
  { id: 'apresentacao', nome: 'Apresentação',             ajuda: 'Os integrantes explicam o trabalho com segurança e respondem às perguntas.' },
  { id: 'relevancia',   nome: 'Relevância social',        ajuda: 'O projeto se relaciona com um problema real das pessoas ou do lugar.' }
];

const NIVEIS = ['Insuficiente', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

/* ---------- Consultas ---------- */

function avaliacaoDaInscricao(inscricaoId) {
  return db.avaliacoes.find(a => a.inscricaoId === inscricaoId);
}

// Projetos que a organização distribuiu para o avaliador
function inscricoesAlocadas() {
  return db.alocacoes
    .map(a => buscar('inscricoes', a.inscricaoId))
    .filter(Boolean);
}

// Nota de 0 a 10 a partir dos critérios marcados (cada um vale de 1 a 5)
function notaFinal(notas) {
  const valores = CRITERIOS.map(c => notas?.[c.id]).filter(Boolean);
  if (valores.length < CRITERIOS.length) return null;
  const soma = valores.reduce((total, v) => total + v, 0);
  return (soma / (CRITERIOS.length * 5)) * 10;
}

function notaLegivel(nota) {
  return nota === null ? '–' : nota.toFixed(1).replace('.', ',');
}

function chipAvaliacao(avaliacao) {
  if (!avaliacao) return chip('Não iniciada', 'atencao');
  if (!avaliacao.enviada) return chip('Rascunho', 'atencao');
  return chip('Enviada', 'sucesso');
}

/* =========================================================
   PROJETOS PARA AVALIAR
   ========================================================= */

function telaAvaliacoes(area) {
  const avaliador = db.avaliador;
  const inscricoes = inscricoesAlocadas();
  const enviadas = inscricoes.filter(i => avaliacaoDaInscricao(i.id)?.enviada).length;
  const faltam = inscricoes.length - enviadas;
  const primeiroNome = avaliador ? avaliador.nome.split(' ')[0] : '';

  if (inscricoes.length === 0) {
    area.innerHTML = `
      ${cabecalho('Projetos para avaliar', 'Aqui aparecem os projetos que a organização da feira distribuiu para você.')}
      <section class="cartao estreito">${estadoVazio('Nenhum projeto foi distribuído para você ainda.')}</section>`;
    return;
  }

  const feiras = [...new Set(inscricoes.map(i => i.feiraId))].map(id => buscar('feiras', id)).filter(Boolean);

  const linhas = inscricoes.map(inscricao => {
    const projeto = buscar('projetos', inscricao.projetoId);
    const equipe = buscar('equipes', inscricao.equipeId);
    const avaliacao = avaliacaoDaInscricao(inscricao.id);
    const nota = avaliacao?.enviada ? notaFinal(avaliacao.notas) : null;
    let acao = 'Avaliar';
    if (avaliacao && !avaliacao.enviada) acao = 'Continuar';
    if (avaliacao?.enviada) acao = 'Ver avaliação';
    return `
      <tr>
        <td data-rotulo="Projeto">
          <strong>${esc(projeto?.titulo || 'Projeto removido')}</strong>
          <span class="detalhe">${esc(projeto?.area || '')}</span>
        </td>
        <td data-rotulo="Equipe">${esc(nomeEquipe(equipe))}</td>
        <td data-rotulo="Situação">${chipAvaliacao(avaliacao)}</td>
        <td data-rotulo="Nota">${nota === null ? '<span class="vazio-texto">–</span>' : `<strong>${notaLegivel(nota)}</strong>`}</td>
        <td><a class="botao ${acao === 'Ver avaliação' ? 'secundario' : 'primario'} pequeno" href="#ficha/${encodeURIComponent(inscricao.id)}">${acao}</a></td>
      </tr>`;
  }).join('');

  const proxima = inscricoes.find(i => !avaliacaoDaInscricao(i.id)?.enviada);

  area.innerHTML = `
    ${cabecalho(
      primeiroNome ? `Olá, ${esc(primeiroNome)}` : 'Projetos para avaliar',
      'Estes são os projetos que a organização da feira distribuiu para você.',
      proxima ? `<a class="botao primario" href="#ficha/${encodeURIComponent(proxima.id)}">Avaliar próximo projeto</a>` : ''
    )}

    <section class="indicadores" aria-label="Números das avaliações">
      ${indicador('Projetos', inscricoes.length, inscricoes.length === 1 ? 'projeto para avaliar' : 'projetos para avaliar')}
      ${indicador('Avaliações enviadas', `${enviadas} de ${inscricoes.length}`, 'fichas concluídas')}
      ${indicador('Faltam', faltam, faltam ? 'fichas para enviar' : 'tudo avaliado', faltam ? 'atencao' : 'sucesso')}
    </section>

    <div class="grade-painel">
      <section class="cartao" aria-labelledby="titulo-avaliar">
        <h2 id="titulo-avaliar">Meus projetos</h2>
        <table class="tabela">
          <thead>
            <tr>
              <th scope="col">Projeto</th>
              <th scope="col">Equipe</th>
              <th scope="col">Situação</th>
              <th scope="col">Nota</th>
              <th scope="col"><span class="sr">Ação</span></th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </section>

      <aside class="cartao" aria-labelledby="titulo-feira-av">
        <h2 id="titulo-feira-av">Como funciona</h2>
        <ul class="lista passos-avaliacao">
          <li><strong>1.</strong> Assista à apresentação da equipe no estande.</li>
          <li><strong>2.</strong> Marque de 1 a 5 em cada critério da ficha.</li>
          <li><strong>3.</strong> Escreva um comentário para a equipe, se quiser.</li>
          <li><strong>4.</strong> Envie. Dá para corrigir até o fim da feira.</li>
        </ul>
        ${feiras.map(f => `
          <div class="info-feira">
            <strong>${esc(f.nome)}</strong>
            <span class="detalhe">${esc(f.local)} · ${esc(f.dias)}</span>
          </div>`).join('')}
      </aside>
    </div>`;
}

/* =========================================================
   FICHA DE AVALIAÇÃO
   ========================================================= */

function telaFicha(area, inscricaoId) {
  const alocadas = inscricoesAlocadas();
  const inscricao = alocadas.find(i => i.id === inscricaoId) ||
                    alocadas.find(i => !avaliacaoDaInscricao(i.id)?.enviada) ||
                    alocadas[0];

  if (!inscricao) {
    area.innerHTML = `
      <a class="voltar" href="#avaliacoes">Voltar para meus projetos</a>
      ${cabecalho('Ficha de avaliação', '')}
      <section class="cartao estreito">${estadoVazio('Nenhum projeto foi distribuído para você ainda.')}</section>`;
    return;
  }

  const projeto = buscar('projetos', inscricao.projetoId);
  const equipe = buscar('equipes', inscricao.equipeId);
  const feira = buscar('feiras', inscricao.feiraId);
  const resumo = resumoDoProjeto(inscricao.projetoId);
  const avaliacao = avaliacaoDaInscricao(inscricao.id);
  const notas = avaliacao?.notas || {};
  // Depois do último dia da feira a ficha fica só para leitura
  const fim = feira ? fimDaFeira(feira) : null;
  const encerrada = fim && diasAte(fim) < 0;

  const criterios = CRITERIOS.map((c, n) => `
    <fieldset class="criterio" id="crit-${c.id}" aria-describedby="crit-${c.id}-ajuda crit-${c.id}-erro">
      <legend><span class="numero-criterio">${n + 1}</span>${c.nome}</legend>
      <p class="ajuda" id="crit-${c.id}-ajuda">${c.ajuda}</p>
      <div class="escala">
        ${NIVEIS.map((nivel, i) => `
          <label class="nivel">
            <input type="radio" name="${c.id}" value="${i + 1}" ${notas[c.id] === i + 1 ? 'checked' : ''} ${encerrada ? 'disabled' : ''}>
            <span class="nivel-valor">${i + 1}</span>
            <span class="nivel-texto">${nivel}</span>
          </label>`).join('')}
      </div>
      <p class="erro" id="crit-${c.id}-erro" aria-live="polite"></p>
    </fieldset>`).join('');

  area.innerHTML = `
    <a class="voltar" href="#avaliacoes">Voltar para meus projetos</a>
    ${cabecalho('Ficha de avaliação', 'Marque de 1 a 5 em cada critério. A nota final, de 0 a 10, é calculada sozinha.')}

    <div class="grade-ficha">
      <section class="cartao">
        ${encerrada ? `<div class="faixa faixa-atencao"><p>A feira terminou em ${dataBR(fim)}. Esta ficha não pode mais ser alterada.</p></div>` : ''}
        ${avaliacao?.enviada && !encerrada ? `<div class="faixa faixa-sucesso"><p>Avaliação enviada em ${dataBR(avaliacao.data)}. Se precisar corrigir, altere e envie de novo até ${dataBR(fim)}.</p></div>` : ''}

        <div class="info-resumo">
          <dl><dt>Projeto</dt><dd>${esc(projeto?.titulo || '')}</dd></dl>
          <dl><dt>Equipe</dt><dd>${esc(nomeEquipe(equipe))}</dd></dl>
          <dl><dt>Área</dt><dd>${esc(projeto?.area || '')}</dd></dl>
          <dl><dt>Situação</dt><dd>${chipAvaliacao(avaliacao)}</dd></dl>
        </div>

        <form id="form-ficha" novalidate>
          ${criterios}

          <div class="campo">
            <label for="ficha-comentario">Comentário para a equipe <span class="opcional">(opcional)</span></label>
            <p class="ajuda" id="ficha-comentario-ajuda">Um elogio ou uma sugestão ajuda os estudantes a melhorar o trabalho.</p>
            <textarea id="ficha-comentario" class="curto" aria-describedby="ficha-comentario-ajuda" ${encerrada ? 'readonly' : ''}>${esc(avaliacao?.comentario || '')}</textarea>
          </div>

          ${encerrada ? '' : `
          <div class="acoes">
            <button class="botao primario" type="submit">${avaliacao?.enviada ? 'Reenviar avaliação' : 'Enviar avaliação'}</button>
            ${avaliacao?.enviada ? '' : '<button class="botao secundario" type="button" id="ficha-rascunho">Salvar rascunho</button>'}
          </div>`}
        </form>
      </section>

      <aside class="cartao lateral-ficha" aria-labelledby="titulo-nota">
        <h2 id="titulo-nota">Nota final</h2>
        <p class="nota-final" id="nota-final" aria-live="polite"></p>
        <p class="detalhe" id="nota-falta"></p>

        <details class="resumo-projeto">
          <summary>Ler o resumo do projeto</summary>
          ${resumo?.enviado
            ? `<p>${esc(resumo.texto)}</p><p class="detalhe">Palavras-chave: ${esc(resumo.palavrasChave)}</p>`
            : '<p class="vazio-texto">A equipe ainda não enviou o resumo.</p>'}
        </details>
      </aside>
    </div>`;

  const form = document.getElementById('form-ficha');

  const lerNotas = () => {
    const lidas = {};
    for (const c of CRITERIOS) {
      const marcada = form.querySelector(`input[name="${c.id}"]:checked`);
      if (marcada) lidas[c.id] = Number(marcada.value);
    }
    return lidas;
  };

  const atualizarNota = () => {
    const lidas = lerNotas();
    const marcados = Object.keys(lidas).length;
    document.getElementById('nota-final').textContent = notaLegivel(notaFinal(lidas));
    document.getElementById('nota-falta').textContent = marcados === CRITERIOS.length
      ? 'Todos os critérios marcados.'
      : `${marcados} de ${CRITERIOS.length} critérios marcados.`;
    // Ao marcar, some o erro daquele critério
    for (const c of CRITERIOS) if (lidas[c.id]) mostrarErro('crit-' + c.id, '');
  };
  form.addEventListener('change', atualizarNota);
  atualizarNota();

  if (encerrada) return;

  const guardar = enviar => {
    const existente = avaliacaoDaInscricao(inscricao.id);
    const dados = {
      inscricaoId: inscricao.id,
      notas: lerNotas(),
      comentario: valorDe('ficha-comentario'),
      enviada: enviar || Boolean(existente?.enviada),
      data: new Date().toISOString()
    };
    if (existente) Object.assign(existente, dados);
    else db.avaliacoes.push(dados);
    salvar();
  };

  document.getElementById('ficha-rascunho')?.addEventListener('click', () => {
    guardar(false);
    registrar('salvou rascunho da ficha ' + inscricao.id);
    avisar('Rascunho salvo. A avaliação ainda não foi enviada.');
    redesenhar();
  });

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    const lidas = lerNotas();
    let primeiro = null;
    for (const c of CRITERIOS) {
      const falta = !lidas[c.id];
      mostrarErro('crit-' + c.id, falta ? `Marque uma nota de 1 a 5 em "${c.nome}".` : '');
      if (falta && !primeiro) primeiro = c.id;
    }
    if (primeiro) {
      document.querySelector(`input[name="${primeiro}"]`).focus();
      avisar('Faltam critérios sem nota.', 'erro');
      return;
    }
    const reenvio = Boolean(avaliacaoDaInscricao(inscricao.id)?.enviada);
    guardar(true);
    registrar((reenvio ? 'reenviou' : 'enviou') + ' ficha ' + inscricao.id);
    avisar(reenvio ? 'Avaliação reenviada.' : 'Avaliação enviada.');
    location.hash = '#avaliacoes';
  });
}

// Último dia da feira. Os dados guardam só o primeiro dia (campo data);
// o campo opcional "fim" permite feiras de mais de um dia.
function fimDaFeira(feira) {
  return feira.fim || feira.data;
}
