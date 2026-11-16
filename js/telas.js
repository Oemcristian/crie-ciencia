/* crie.Ciência - telas.js
   Cada função "tela..." desenha uma página dentro do <main> e liga os eventos dela.
   Recebem: area (o elemento <main>) e param (o que vem depois da barra na URL,
   por exemplo #resumo/pr-solar -> param = 'pr-solar'). */

/* ---------- Trilha de etapas dos cadastros ---------- */

const ETAPAS = [
  { rota: 'alunos', nome: 'Alunos', feita: () => db.alunos.length > 0 },
  { rota: 'equipes', nome: 'Equipe', feita: () => db.equipes.length > 0 },
  { rota: 'projetos', nome: 'Projeto', feita: () => db.projetos.length > 0 },
  { rota: 'inscricao', nome: 'Inscrição na feira', feita: () => db.inscricoes.length > 0 },
  { rota: 'resumo', nome: 'Resumo', feita: () => db.resumos.some(r => r.enviado) }
];

function trilha(atual) {
  const itens = ETAPAS.map((etapa, i) => {
    const eAtual = etapa.rota === atual;
    const feita = etapa.feita();
    const classe = eAtual ? 'atual' : (feita ? 'feita' : '');
    return `
      <li class="${classe}">
        <a href="#${etapa.rota}" ${eAtual ? 'aria-current="step"' : ''}>
          <span class="numero" aria-hidden="true">${feita && !eAtual ? '✓' : i + 1}</span>
          <span>${etapa.nome}</span>
          ${feita && !eAtual ? '<span class="sr">(etapa com cadastro)</span>' : ''}
        </a>
      </li>`;
  }).join('');
  return `<nav class="trilha" aria-label="Etapas do cadastro"><ol>${itens}</ol></nav>`;
}

/* =========================================================
   PAINEL
   ========================================================= */

function telaPainel(area) {
  const pendencias = calcularPendencias();
  const inscritos = projetosInscritos();
  const enviados = inscritos.filter(p => resumoDoProjeto(p.id)?.enviado).length;
  const primeiroNome = db.professor ? db.professor.nome.split(' ')[0] : '';

  area.innerHTML = `
    ${cabecalho(
      primeiroNome ? `Olá, ${esc(primeiroNome)}` : 'Painel',
      'Veja como estão suas equipes e o que ainda falta fazer.',
      '<a class="botao primario" href="#pendencias">Ver pendências</a>'
    )}

    ${db.professor ? '' : `
      <div class="faixa faixa-info">
        <p><strong>Comece pelo seu cadastro.</strong> Ele é feito uma única vez, e o nome da escola já aparece preenchido nos próximos passos.</p>
        <a class="botao secundario" href="#professor">Fazer meu cadastro</a>
      </div>`}

    <section class="indicadores" aria-label="Números gerais">
      ${indicador('Equipes', db.equipes.length, db.equipes.length === 1 ? 'equipe cadastrada' : 'equipes cadastradas')}
      ${indicador('Resumos enviados', `${enviados} de ${inscritos.length}`, 'projetos inscritos em feiras')}
      ${indicador('Pendências abertas', pendencias.length,
        pendencias.length ? 'itens para resolver' : 'tudo em dia',
        pendencias.length ? 'atencao' : 'sucesso')}
    </section>

    <div class="grade-painel">
      <section class="cartao" aria-labelledby="titulo-equipes">
        <div class="cartao-topo">
          <h2 id="titulo-equipes">Minhas equipes</h2>
          <a class="botao-texto" href="#equipes">Nova equipe</a>
        </div>
        ${tabelaEquipes()}
      </section>

      <aside class="cartao" aria-labelledby="titulo-prazos">
        <h2 id="titulo-prazos">Próximos prazos</h2>
        ${listaPrazos()}
      </aside>
    </div>`;
}

function indicador(rotulo, valor, detalhe, tipo = '') {
  return `
    <div class="cartao indicador ${tipo}">
      <span class="rotulo">${rotulo}</span>
      <strong class="valor">${valor}</strong>
      <span class="detalhe">${detalhe}</span>
    </div>`;
}

function chipResumo(projeto) {
  if (!projeto) return chip('Sem projeto', 'neutro');
  if (!db.inscricoes.some(i => i.projetoId === projeto.id)) return chip('Sem inscrição', 'neutro');
  const resumo = resumoDoProjeto(projeto.id);
  if (!resumo) return chip('Não enviado', 'atencao');
  if (!resumo.enviado) return chip('Rascunho', 'atencao');
  return chip('Enviado', 'sucesso');
}

function proximaAcao(equipe) {
  const pendencia = calcularPendencias().find(p => p.equipeId === equipe.id);
  if (pendencia) return { texto: pendencia.acao, rota: pendencia.rota };
  return { texto: 'Ver documentos', rota: '#documentos/' + equipe.id };
}

function tabelaEquipes() {
  if (db.equipes.length === 0) {
    return estadoVazio('Você ainda não tem equipes. Comece cadastrando os alunos.', '#alunos', 'Cadastrar alunos');
  }

  const linhas = db.equipes.map(equipe => {
    const projeto = projetoDaEquipe(equipe.id);
    const qtdDocs = documentosDaEquipe(equipe.id).length;
    const total = TIPOS_DOCUMENTO.length;
    const acao = proximaAcao(equipe);
    return `
      <tr>
        <td data-rotulo="Equipe">
          <strong>${esc(nomeEquipe(equipe))}</strong>
          <span class="detalhe">${equipe.alunoIds.length} integrantes</span>
        </td>
        <td data-rotulo="Projeto">${projeto ? esc(projeto.titulo) : '<span class="vazio-texto">Sem projeto</span>'}</td>
        <td data-rotulo="Resumo">${chipResumo(projeto)}</td>
        <td data-rotulo="Documentos">
          <div class="progresso">
            <span>${qtdDocs} de ${total}</span>
            <div class="barra ${qtdDocs === total ? 'completa' : ''}" role="progressbar"
                 aria-label="Documentos enviados" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${qtdDocs}">
              <i style="width:${(qtdDocs / total) * 100}%"></i>
            </div>
          </div>
        </td>
        <td><a class="botao secundario pequeno" href="${acao.rota}">${acao.texto}</a></td>
      </tr>`;
  }).join('');

  return `
    <table class="tabela">
      <thead>
        <tr>
          <th scope="col">Equipe</th>
          <th scope="col">Projeto</th>
          <th scope="col">Resumo</th>
          <th scope="col">Documentos</th>
          <th scope="col"><span class="sr">Próxima ação</span></th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>`;
}

function listaPrazos() {
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const etapas = [
    ['prazoInscricao', 'Fim das inscrições'],
    ['prazoResumo', 'Envio dos resumos'],
    ['prazoDocumentos', 'Envio dos documentos'],
    ['data', 'Início da feira']
  ];

  const prazos = [];
  for (const feira of db.feiras) {
    for (const [campoData, rotulo] of etapas) {
      if (feira[campoData] && diasAte(feira[campoData]) >= 0) {
        prazos.push({ data: feira[campoData], rotulo, feira: feira.nome });
      }
    }
  }
  prazos.sort((a, b) => a.data.localeCompare(b.data));

  if (prazos.length === 0) return estadoVazio('Nenhum prazo nos próximos meses.');

  return `<ul class="lista">${prazos.slice(0, 5).map(p => {
    const [, mes, dia] = p.data.split('-');
    const situacao = situacaoPrazo(p.data);
    return `
      <li class="prazo">
        <div class="prazo-data" aria-hidden="true"><strong>${dia}</strong><span>${meses[Number(mes) - 1]}</span></div>
        <div class="prazo-texto">
          <strong>${p.rotulo}</strong>
          <span class="detalhe">${esc(p.feira)}</span>
          <span class="sr">${dataBR(p.data)}</span>
          ${situacao.tipo !== 'neutro' ? chip(situacao.texto, situacao.tipo) : ''}
        </div>
      </li>`;
  }).join('')}</ul>`;
}

/* =========================================================
   CADASTRO DO PROFESSOR
   ========================================================= */

function telaProfessor(area) {
  const primeiraVez = !db.professor;
  const p = db.professor || {};

  area.innerHTML = `
    ${cabecalho('Meu cadastro', 'Seus dados como professor orientador. Você só precisa preencher uma vez.')}
    <section class="cartao estreito">
      <form id="form-professor" novalidate>
        ${campo({ id: 'prof-nome', rotulo: 'Nome completo', valor: p.nome, extra: 'autocomplete="name"' })}
        <div class="linha-campos">
          ${campo({ id: 'prof-email', rotulo: 'E-mail', tipo: 'email', valor: p.email, extra: 'autocomplete="email"' })}
          ${campo({ id: 'prof-telefone', rotulo: 'Telefone', tipo: 'tel', valor: p.telefone, ajuda: 'Com DDD', extra: 'autocomplete="tel" inputmode="numeric"' })}
        </div>
        ${campo({ id: 'prof-escola', rotulo: 'Escola', valor: p.escola, ajuda: 'Será usada como escola padrão ao cadastrar alunos.' })}
        ${campo({ id: 'prof-disciplina', rotulo: 'Disciplina que leciona', valor: p.disciplina, ajuda: 'Ex.: Ciências, Matemática' })}
        <div class="acoes">
          <button class="botao primario" type="submit">${primeiraVez ? 'Salvar cadastro' : 'Salvar alterações'}</button>
          <a class="botao secundario" href="#painel">Voltar ao painel</a>
        </div>
      </form>
    </section>`;

  mascaraTelefone(document.getElementById('prof-telefone'));

  document.getElementById('form-professor').addEventListener('submit', evento => {
    evento.preventDefault();
    const ok = validar({
      'prof-nome': v => v.length >= 3 ? '' : 'Informe seu nome completo.',
      'prof-email': v => emailValido(v) ? '' : 'Informe um e-mail válido. Ex.: nome@escola.com',
      'prof-telefone': v => telefoneValido(v) ? '' : 'Informe um telefone com DDD. Ex.: (84) 99999-0000',
      'prof-escola': v => v ? '' : 'Informe o nome da escola.',
      'prof-disciplina': v => v ? '' : 'Informe a disciplina.'
    });
    if (!ok) return;

    db.professor = {
      nome: valorDe('prof-nome'),
      email: valorDe('prof-email'),
      telefone: valorDe('prof-telefone'),
      escola: valorDe('prof-escola'),
      disciplina: valorDe('prof-disciplina')
    };
    salvar();
    registrar('salvou cadastro do professor');

    if (primeiraVez) {
      avisar('Cadastro salvo. Agora cadastre seus alunos.');
      location.hash = '#alunos';
    } else {
      avisar('Dados atualizados.');
      redesenhar();
    }
  });
}

function valorDe(id) {
  return document.getElementById(id).value.trim();
}

/* =========================================================
   CADASTRO DE ALUNOS
   ========================================================= */

function telaAlunos(area, idEdicao) {
  const editando = idEdicao ? buscar('alunos', idEdicao) : null;
  const a = editando || { escola: db.professor?.escola || '' };
  const semEquipe = alunosSemEquipe().length;

  area.innerHTML = `
    ${trilha('alunos')}
    ${cabecalho('Cadastro de alunos', 'Cadastre cada aluno uma única vez. Depois, é só escolher o aluno na hora de montar a equipe.')}

    <div class="grade-form">
      <section class="cartao" aria-labelledby="titulo-form-aluno">
        <h2 id="titulo-form-aluno">${editando ? 'Editar aluno' : 'Novo aluno'}</h2>
        <form id="form-aluno" novalidate>
          ${campo({ id: 'aluno-nome', rotulo: 'Nome completo do aluno', valor: a.nome })}
          <div class="linha-campos">
            ${campo({ id: 'aluno-nascimento', rotulo: 'Data de nascimento', valor: a.nascimento ? dataBR(a.nascimento) : '', ajuda: 'dd/mm/aaaa', extra: 'inputmode="numeric" placeholder="00/00/0000"' })}
            ${campoSelecao({ id: 'aluno-serie', rotulo: 'Ano/série', opcoes: SERIES, valor: a.serie })}
          </div>
          ${campo({ id: 'aluno-escola', rotulo: 'Escola', valor: a.escola })}
          <div class="linha-campos">
            ${campo({ id: 'aluno-responsavel', rotulo: 'Nome do responsável', valor: a.responsavel })}
            ${campo({ id: 'aluno-contato', rotulo: 'Telefone do responsável', tipo: 'tel', valor: a.contato, ajuda: 'Com DDD', extra: 'inputmode="numeric"' })}
          </div>
          <div class="acoes">
            <button class="botao primario" type="submit">${editando ? 'Salvar alterações' : 'Salvar aluno'}</button>
            ${editando ? '<a class="botao secundario" href="#alunos">Cancelar</a>' : ''}
          </div>
        </form>
      </section>

      <section class="cartao" aria-labelledby="titulo-lista-alunos">
        <div class="cartao-topo">
          <h2 id="titulo-lista-alunos">Alunos cadastrados <span class="contagem">${db.alunos.length}</span></h2>
        </div>
        ${listaAlunos()}
        ${semEquipe >= LIMITES.membrosMin ? `
          <div class="cartao-rodape">
            <a class="botao secundario" href="#equipes">Próxima etapa: montar equipe</a>
          </div>` : ''}
      </section>
    </div>`;

  mascaraData(document.getElementById('aluno-nascimento'));
  mascaraTelefone(document.getElementById('aluno-contato'));

  document.getElementById('form-aluno').addEventListener('submit', evento => {
    evento.preventDefault();
    const ok = validar({
      'aluno-nome': v => {
        if (v.length < 3) return 'Informe o nome completo do aluno.';
        const nascimento = dataISO(valorDe('aluno-nascimento'));
        const repetido = db.alunos.some(x => x.id !== editando?.id &&
          normalizar(x.nome) === normalizar(v) && x.nascimento === nascimento);
        return repetido ? 'Este aluno já está cadastrado.' : '';
      },
      'aluno-nascimento': validarNascimento,
      'aluno-serie': v => v ? '' : 'Escolha o ano/série.',
      'aluno-escola': v => v ? '' : 'Informe a escola.',
      'aluno-responsavel': v => v.length >= 3 ? '' : 'Informe o nome do responsável.',
      'aluno-contato': v => telefoneValido(v) ? '' : 'Informe um telefone com DDD. Ex.: (84) 99999-0000'
    });
    if (!ok) return;

    const dados = {
      nome: valorDe('aluno-nome'),
      nascimento: dataISO(valorDe('aluno-nascimento')),
      serie: valorDe('aluno-serie'),
      escola: valorDe('aluno-escola'),
      responsavel: valorDe('aluno-responsavel'),
      contato: valorDe('aluno-contato')
    };

    if (editando) {
      Object.assign(editando, dados);
      salvar();
      registrar('editou aluno ' + editando.id);
      avisar('Dados do aluno atualizados.');
      location.hash = '#alunos';
    } else {
      const novo = { id: novoId('al'), ...dados };
      db.alunos.push(novo);
      salvar();
      registrar('cadastrou aluno ' + novo.id);
      avisar(`${dados.nome} foi cadastrado(a).`);
      redesenhar();
      document.getElementById('aluno-nome').focus();
    }
  });

  area.querySelectorAll('[data-excluir-aluno]').forEach(botao => {
    botao.addEventListener('click', () => excluirAluno(botao.dataset.excluirAluno));
  });
}

function validarNascimento(valor) {
  if (!valor) return 'Informe a data de nascimento.';
  const iso = dataISO(valor);
  if (!iso) return 'Data inválida. Use o formato dd/mm/aaaa, por exemplo 14/03/2012.';
  const anos = idade(iso);
  if (anos < 8 || anos > 18) return `Confira a data: o aluno teria ${anos} anos.`;
  return '';
}

function listaAlunos() {
  if (db.alunos.length === 0) return estadoVazio('Nenhum aluno cadastrado ainda.');

  const ordenados = [...db.alunos].sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
  return `<ul class="lista">${ordenados.map(aluno => {
    const equipe = equipeDoAluno(aluno.id);
    return `
      <li class="item-lista">
        <div class="item-texto">
          <strong>${esc(aluno.nome)}</strong>
          <span class="detalhe">${esc(aluno.serie)} · ${idade(aluno.nascimento)} anos</span>
        </div>
        ${equipe ? chip(nomeEquipe(equipe), 'info') : chip('Sem equipe', 'neutro')}
        <div class="botoes">
          <a class="botao-texto" href="#alunos/${aluno.id}" aria-label="Editar ${esc(aluno.nome)}">Editar</a>
          <button type="button" class="botao-texto perigo" data-excluir-aluno="${aluno.id}" aria-label="Excluir ${esc(aluno.nome)}">Excluir</button>
        </div>
      </li>`;
  }).join('')}</ul>`;
}

function excluirAluno(id) {
  const aluno = buscar('alunos', id);
  const equipe = equipeDoAluno(id);
  if (equipe) {
    avisar(`${aluno.nome} faz parte da ${nomeEquipe(equipe)} e não pode ser excluído(a).`, 'erro');
    return;
  }
  if (!confirm(`Excluir o cadastro de ${aluno.nome}?`)) return;
  db.alunos = db.alunos.filter(x => x.id !== id);
  salvar();
  registrar('excluiu aluno ' + id);
  avisar('Aluno excluído.');
  if (location.hash === '#alunos/' + id) location.hash = '#alunos';
  else redesenhar();
}

/* =========================================================
   CADASTRO DE EQUIPE
   ========================================================= */

function telaEquipes(area) {
  const disponiveis = alunosSemEquipe().sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
  const orientador = db.professor?.nome;

  area.innerHTML = `
    ${trilha('equipes')}
    ${cabecalho('Cadastro de equipe', `Dê um nome à equipe e marque de ${LIMITES.membrosMin} a ${LIMITES.membrosMax} alunos. Só aparecem os alunos que ainda não estão em nenhuma equipe.`)}

    <div class="grade-form">
      <section class="cartao" aria-labelledby="titulo-form-equipe">
        <h2 id="titulo-form-equipe">Nova equipe</h2>
        ${disponiveis.length < LIMITES.membrosMin ? `
          ${estadoVazio(
            disponiveis.length === 0
              ? 'Todos os alunos cadastrados já estão em uma equipe.'
              : 'Só há 1 aluno sem equipe. Uma equipe precisa de pelo menos 2.',
            '#alunos', 'Cadastrar alunos')}
        ` : `
        <form id="form-equipe" novalidate>
          ${campo({ id: 'equipe-nome', rotulo: 'Nome da equipe', ajuda: 'Ex.: Horta. Não pode repetir o nome de outra equipe.' })}

          <fieldset id="equipe-membros" aria-describedby="contador-membros equipe-membros-erro">
            <legend>Integrantes</legend>
            <p class="ajuda" id="contador-membros" aria-live="polite">Nenhum aluno marcado. Marque de ${LIMITES.membrosMin} a ${LIMITES.membrosMax}.</p>
            <div class="marcaveis">
              ${disponiveis.map(aluno => `
                <label class="marcavel">
                  <input type="checkbox" name="membro" value="${aluno.id}">
                  <span>${esc(aluno.nome)}</span>
                  <span class="detalhe">${esc(aluno.serie)}</span>
                </label>`).join('')}
            </div>
            <p class="erro" id="equipe-membros-erro" aria-live="polite"></p>
          </fieldset>

          ${campo({
            id: 'equipe-orientador',
            rotulo: 'Professor orientador',
            valor: orientador || 'Faça seu cadastro de professor',
            ajuda: 'Preenchido com o seu cadastro.',
            extra: 'readonly'
          })}

          <div class="acoes">
            <button class="botao primario" type="submit">Salvar equipe</button>
          </div>
        </form>`}
      </section>

      <section class="cartao" aria-labelledby="titulo-lista-equipes">
        <div class="cartao-topo">
          <h2 id="titulo-lista-equipes">Equipes cadastradas <span class="contagem">${db.equipes.length}</span></h2>
        </div>
        ${listaEquipes()}
      </section>
    </div>`;

  area.querySelectorAll('[data-excluir-equipe]').forEach(botao => {
    botao.addEventListener('click', () => excluirEquipe(botao.dataset.excluirEquipe));
  });

  const form = document.getElementById('form-equipe');
  if (!form) return;

  const marcados = () => [...form.querySelectorAll('input[name="membro"]:checked')].map(c => c.value);

  form.addEventListener('change', () => {
    const n = marcados().length;
    const contador = document.getElementById('contador-membros');
    if (n === 0) contador.textContent = `Nenhum aluno marcado. Marque de ${LIMITES.membrosMin} a ${LIMITES.membrosMax}.`;
    else if (n > LIMITES.membrosMax) contador.textContent = `${n} alunos marcados. O máximo é ${LIMITES.membrosMax}.`;
    else contador.textContent = `${n} ${n === 1 ? 'aluno marcado' : 'alunos marcados'} (de ${LIMITES.membrosMin} a ${LIMITES.membrosMax}).`;
  });

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    const ok = validar({
      'equipe-nome': v => {
        if (!v) return 'Informe o nome da equipe.';
        const novoNome = normalizar(nomeEquipe({ nome: v }));
        const repetido = db.equipes.some(e => normalizar(nomeEquipe(e)) === novoNome);
        return repetido ? 'Já existe uma equipe com esse nome. Escolha outro.' : '';
      },
      'equipe-membros': () => {
        const n = marcados().length;
        if (n < LIMITES.membrosMin) return `Marque pelo menos ${LIMITES.membrosMin} alunos.`;
        if (n > LIMITES.membrosMax) return `Marque no máximo ${LIMITES.membrosMax} alunos.`;
        return '';
      }
    });
    if (!ok) return;

    const equipe = { id: novoId('eq'), nome: valorDe('equipe-nome'), alunoIds: marcados() };
    db.equipes.push(equipe);
    salvar();
    registrar('cadastrou equipe ' + equipe.id);
    avisar(`${nomeEquipe(equipe)} cadastrada. Agora cadastre o projeto da equipe.`);
    location.hash = '#projetos/' + equipe.id;
  });
}

function listaEquipes() {
  if (db.equipes.length === 0) return estadoVazio('Nenhuma equipe cadastrada ainda.');

  return `<ul class="lista">${db.equipes.map(equipe => {
    const nomes = equipe.alunoIds.map(id => buscar('alunos', id)?.nome).filter(Boolean);
    const projeto = projetoDaEquipe(equipe.id);
    return `
      <li class="item-lista">
        <div class="item-texto">
          <strong>${esc(nomeEquipe(equipe))}</strong>
          <span class="detalhe">${esc(nomes.join(', '))}</span>
        </div>
        ${projeto ? chip('Com projeto', 'sucesso') : chip('Sem projeto', 'atencao')}
        <div class="botoes">
          ${projeto ? '' : `<a class="botao-texto" href="#projetos/${equipe.id}">Cadastrar projeto</a>`}
          <button type="button" class="botao-texto perigo" data-excluir-equipe="${equipe.id}" aria-label="Excluir ${esc(nomeEquipe(equipe))}">Excluir</button>
        </div>
      </li>`;
  }).join('')}</ul>`;
}

function excluirEquipe(id) {
  const equipe = buscar('equipes', id);
  if (projetoDaEquipe(id)) {
    avisar(`A ${nomeEquipe(equipe)} já tem projeto. Exclua o projeto antes.`, 'erro');
    return;
  }
  if (!confirm(`Excluir a ${nomeEquipe(equipe)}? Os alunos voltam a ficar sem equipe.`)) return;
  db.equipes = db.equipes.filter(e => e.id !== id);
  db.documentos = db.documentos.filter(d => d.equipeId !== id);
  salvar();
  registrar('excluiu equipe ' + id);
  avisar('Equipe excluída.');
  redesenhar();
}

/* =========================================================
   CADASTRO DE PROJETO
   ========================================================= */

function telaProjetos(area, equipeEscolhida) {
  const livres = equipesSemProjeto();
  const opcoesEquipe = livres.map(e => ({ valor: e.id, texto: nomeEquipe(e) }));

  area.innerHTML = `
    ${trilha('projetos')}
    ${cabecalho('Cadastro de projeto', 'Cada equipe tem um projeto. Só aparecem as equipes que ainda não têm projeto.')}

    <div class="grade-form">
      <section class="cartao" aria-labelledby="titulo-form-projeto">
        <h2 id="titulo-form-projeto">Novo projeto</h2>
        ${livres.length === 0 ? estadoVazio(
          db.equipes.length ? 'Todas as equipes já têm projeto.' : 'Cadastre uma equipe antes do projeto.',
          '#equipes', 'Cadastrar equipe') : `
        <form id="form-projeto" novalidate>
          ${campoSelecao({ id: 'projeto-equipe', rotulo: 'Equipe', opcoes: opcoesEquipe, valor: livres.some(e => e.id === equipeEscolhida) ? equipeEscolhida : (livres.length === 1 ? livres[0].id : ''), vazio: 'Escolha a equipe' })}
          ${campo({ id: 'projeto-titulo', rotulo: 'Título do projeto', ajuda: 'Ex.: Horta vertical na escola' })}
          ${campoSelecao({ id: 'projeto-area', rotulo: 'Área do conhecimento', opcoes: AREAS, vazio: 'Escolha a área' })}
          ${campo({ id: 'projeto-palavras', rotulo: 'Palavras-chave', ajuda: `Separe por vírgula, até ${LIMITES.palavrasChaveMax}. Ex.: horta, reciclagem, alimentação` })}
          <div class="acoes">
            <button class="botao primario" type="submit">Salvar projeto</button>
          </div>
        </form>`}
      </section>

      <section class="cartao" aria-labelledby="titulo-lista-projetos">
        <div class="cartao-topo">
          <h2 id="titulo-lista-projetos">Projetos cadastrados <span class="contagem">${db.projetos.length}</span></h2>
        </div>
        ${listaProjetos()}
      </section>
    </div>`;

  area.querySelectorAll('[data-excluir-projeto]').forEach(botao => {
    botao.addEventListener('click', () => excluirProjeto(botao.dataset.excluirProjeto));
  });

  const form = document.getElementById('form-projeto');
  if (!form) return;

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    const ok = validar({
      'projeto-equipe': v => v ? '' : 'Escolha a equipe do projeto.',
      'projeto-titulo': v => v.length >= 5 ? '' : 'Informe o título do projeto.',
      'projeto-area': v => v ? '' : 'Escolha a área do conhecimento.',
      'projeto-palavras': v => {
        const n = separarPalavrasChave(v).length;
        if (n === 0) return 'Informe pelo menos uma palavra-chave.';
        if (n > LIMITES.palavrasChaveMax) return `Use no máximo ${LIMITES.palavrasChaveMax} palavras-chave.`;
        return '';
      }
    });
    if (!ok) return;

    const projeto = {
      id: novoId('pr'),
      equipeId: valorDe('projeto-equipe'),
      titulo: valorDe('projeto-titulo'),
      area: valorDe('projeto-area'),
      palavrasChave: separarPalavrasChave(valorDe('projeto-palavras')).join(', ')
    };
    db.projetos.push(projeto);
    salvar();
    registrar('cadastrou projeto ' + projeto.id);
    avisar('Projeto cadastrado. Agora inscreva a equipe em uma feira.');
    location.hash = '#inscricao/' + projeto.equipeId;
  });
}

function listaProjetos() {
  if (db.projetos.length === 0) return estadoVazio('Nenhum projeto cadastrado ainda.');

  return `<ul class="lista">${db.projetos.map(projeto => {
    const equipe = buscar('equipes', projeto.equipeId);
    const inscrito = db.inscricoes.some(i => i.projetoId === projeto.id);
    return `
      <li class="item-lista">
        <div class="item-texto">
          <strong>${esc(projeto.titulo)}</strong>
          <span class="detalhe">${esc(nomeEquipe(equipe))} · ${esc(projeto.area)}</span>
        </div>
        ${inscrito ? chip('Inscrito', 'sucesso') : chip('Sem inscrição', 'atencao')}
        <div class="botoes">
          ${inscrito ? '' : `<a class="botao-texto" href="#inscricao/${projeto.equipeId}">Inscrever</a>`}
          <button type="button" class="botao-texto perigo" data-excluir-projeto="${projeto.id}" aria-label="Excluir ${esc(projeto.titulo)}">Excluir</button>
        </div>
      </li>`;
  }).join('')}</ul>`;
}

function excluirProjeto(id) {
  const projeto = buscar('projetos', id);
  if (db.inscricoes.some(i => i.projetoId === id)) {
    avisar('Este projeto está inscrito em uma feira. Cancele a inscrição antes.', 'erro');
    return;
  }
  if (!confirm(`Excluir o projeto "${projeto.titulo}"?`)) return;
  db.projetos = db.projetos.filter(p => p.id !== id);
  db.resumos = db.resumos.filter(r => r.projetoId !== id);
  salvar();
  registrar('excluiu projeto ' + id);
  avisar('Projeto excluído.');
  redesenhar();
}

/* =========================================================
   INSCRIÇÃO NA FEIRA
   ========================================================= */

function telaInscricao(area, equipeEscolhida) {
  const comProjeto = equipesComProjeto();
  const opcoesEquipe = comProjeto.map(e => ({ valor: e.id, texto: `${nomeEquipe(e)} - ${projetoDaEquipe(e.id).titulo}` }));

  area.innerHTML = `
    ${trilha('inscricao')}
    ${cabecalho('Inscrição na feira', 'Escolha a feira e a equipe. Os dados do projeto e dos alunos são aproveitados do cadastro.')}

    <div class="grade-form">
      <section class="cartao" aria-labelledby="titulo-form-inscricao">
        <h2 id="titulo-form-inscricao">Nova inscrição</h2>
        ${comProjeto.length === 0 ? estadoVazio('Para se inscrever, a equipe precisa ter um projeto cadastrado.', '#projetos', 'Cadastrar projeto') : `
        <form id="form-inscricao" novalidate>
          <fieldset id="insc-feira" aria-describedby="insc-feira-erro">
            <legend>1. Escolha a feira</legend>
            <div class="opcoes">
              ${db.feiras.map(feira => {
                const aberta = diasAte(feira.prazoInscricao) >= 0;
                return `
                  <label class="opcao ${aberta ? '' : 'desativada'}">
                    <input type="radio" name="feira" value="${feira.id}" ${aberta ? '' : 'disabled'}>
                    <span class="opcao-corpo">
                      <strong>${esc(feira.nome)}</strong>
                      <span class="detalhe">${esc(feira.local)} · ${esc(feira.dias)}</span>
                      <span class="detalhe">${aberta ? 'Inscrições até ' + dataBR(feira.prazoInscricao) : 'Inscrições encerradas'}</span>
                    </span>
                  </label>`;
              }).join('')}
            </div>
            <p class="erro" id="insc-feira-erro" aria-live="polite"></p>
          </fieldset>

          ${campoSelecao({
            id: 'insc-equipe',
            rotulo: '2. Escolha a equipe',
            opcoes: opcoesEquipe,
            valor: comProjeto.some(e => e.id === equipeEscolhida) ? equipeEscolhida : '',
            ajuda: 'Só aparecem equipes que já têm projeto.',
            vazio: 'Escolha a equipe'
          })}

          <div class="acoes">
            <button class="botao primario" type="submit">Confirmar inscrição</button>
          </div>
        </form>`}
      </section>

      <section class="cartao" aria-labelledby="titulo-lista-inscricoes">
        <div class="cartao-topo">
          <h2 id="titulo-lista-inscricoes">Inscrições feitas <span class="contagem">${db.inscricoes.length}</span></h2>
        </div>
        ${listaInscricoes()}
      </section>
    </div>`;

  area.querySelectorAll('[data-cancelar-inscricao]').forEach(botao => {
    botao.addEventListener('click', () => cancelarInscricao(botao.dataset.cancelarInscricao));
  });

  const form = document.getElementById('form-inscricao');
  if (!form) return;

  const feiraMarcada = () => form.querySelector('input[name="feira"]:checked')?.value || '';

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    const ok = validar({
      'insc-feira': () => feiraMarcada() ? '' : 'Escolha uma feira.',
      'insc-equipe': v => {
        if (!v) return 'Escolha a equipe.';
        const repetida = db.inscricoes.some(i => i.equipeId === v && i.feiraId === feiraMarcada());
        return repetida ? 'Esta equipe já está inscrita nesta feira.' : '';
      }
    });
    if (!ok) return;

    const equipeId = valorDe('insc-equipe');
    const projeto = projetoDaEquipe(equipeId);
    const inscricao = {
      id: novoId('in'),
      feiraId: feiraMarcada(),
      equipeId,
      projetoId: projeto.id,
      data: new Date().toISOString()
    };
    db.inscricoes.push(inscricao);
    salvar();
    registrar('fez inscrição ' + inscricao.id);

    const resumo = resumoDoProjeto(projeto.id);
    if (resumo?.enviado) {
      avisar('Inscrição feita. O resumo deste projeto já foi enviado.');
      location.hash = '#painel';
    } else {
      avisar('Inscrição feita. O próximo passo é enviar o resumo.');
      location.hash = '#resumo/' + projeto.id;
    }
  });
}

function listaInscricoes() {
  if (db.inscricoes.length === 0) return estadoVazio('Nenhuma inscrição feita ainda.');

  return `<ul class="lista">${db.inscricoes.map(inscricao => {
    const equipe = buscar('equipes', inscricao.equipeId);
    const feira = buscar('feiras', inscricao.feiraId);
    return `
      <li class="item-lista">
        <div class="item-texto">
          <strong>${esc(nomeEquipe(equipe))}</strong>
          <span class="detalhe">${esc(feira?.nome)}</span>
          <span class="detalhe">Inscrita em ${dataBR(inscricao.data)}</span>
        </div>
        <div class="botoes">
          <button type="button" class="botao-texto perigo" data-cancelar-inscricao="${inscricao.id}">Cancelar inscrição</button>
        </div>
      </li>`;
  }).join('')}</ul>`;
}

function cancelarInscricao(id) {
  const inscricao = buscar('inscricoes', id);
  const equipe = buscar('equipes', inscricao.equipeId);
  const feira = buscar('feiras', inscricao.feiraId);
  if (avaliacoesDaInscricao(id).length) {
    avisar(`A ${nomeEquipe(equipe)} já foi avaliada na ${feira.nome}. A inscrição não pode mais ser cancelada.`, 'erro');
    return;
  }
  if (!confirm(`Cancelar a inscrição da ${nomeEquipe(equipe)} na ${feira.nome}?`)) return;
  db.inscricoes = db.inscricoes.filter(i => i.id !== id);
  salvar();
  registrar('cancelou inscrição ' + id);
  avisar('Inscrição cancelada.');
  redesenhar();
}

/* =========================================================
   ENVIO DE RESUMO
   ========================================================= */

function telaResumo(area, projetoEscolhido) {
  const inscritos = projetosInscritos();

  if (inscritos.length === 0) {
    area.innerHTML = `
      ${trilha('resumo')}
      ${cabecalho('Envio de resumo', 'O resumo é enviado depois que o projeto está inscrito em uma feira.')}
      <section class="cartao estreito">${estadoVazio('Nenhum projeto inscrito ainda.', '#inscricao', 'Fazer inscrição')}</section>`;
    return;
  }

  // Sem projeto na URL: abre o primeiro que ainda não enviou o resumo
  let projeto = inscritos.find(p => p.id === projetoEscolhido);
  if (!projeto) projeto = inscritos.find(p => !resumoDoProjeto(p.id)?.enviado) || inscritos[0];

  const equipe = buscar('equipes', projeto.equipeId);
  const inscricoes = db.inscricoes.filter(i => i.projetoId === projeto.id);
  const feiras = inscricoes.map(i => buscar('feiras', i.feiraId)?.nome).filter(Boolean);
  const prazo = prazoMaisProximo(inscricoes, 'prazoResumo');
  const encerrado = prazo && diasAte(prazo) < 0;
  const resumo = resumoDoProjeto(projeto.id);
  const enviado = resumo?.enviado;

  let situacao;
  if (enviado) situacao = chip('Enviado em ' + dataBR(resumo.data), 'sucesso');
  else if (resumo) situacao = chip('Rascunho salvo', 'atencao');
  else situacao = chip('Não enviado', 'atencao');

  const prazoInfo = situacaoPrazo(prazo);

  area.innerHTML = `
    ${trilha('resumo')}
    ${cabecalho('Envio de resumo', `O resumo deve ter de ${LIMITES.palavrasMin} a ${LIMITES.palavrasMax} palavras. Você pode salvar um rascunho e enviar depois.`)}

    <section class="cartao estreito">
      ${encerrado ? `<div class="faixa faixa-atencao"><p>O prazo para envio terminou em ${dataBR(prazo)}. Não é mais possível alterar este resumo.</p></div>` : ''}
      ${enviado && !encerrado ? `<div class="faixa faixa-sucesso"><p>Resumo enviado. Se precisar corrigir algo, você pode reenviar até ${dataBR(prazo)}.</p></div>` : ''}

      <form id="form-resumo" novalidate>
        ${inscritos.length > 1 ? campoSelecao({
          id: 'resumo-projeto',
          rotulo: 'Projeto',
          opcoes: inscritos.map(p => ({ valor: p.id, texto: `${p.titulo} (${nomeEquipe(buscar('equipes', p.equipeId))})` })),
          valor: projeto.id,
          vazio: 'Escolha o projeto'
        }) : ''}

        <div class="info-resumo">
          <dl><dt>Projeto</dt><dd>${esc(projeto.titulo)}</dd></dl>
          <dl><dt>Equipe</dt><dd>${esc(nomeEquipe(equipe))}</dd></dl>
          <dl><dt>Feira</dt><dd>${esc(feiras.join('; '))}</dd></dl>
          <dl><dt>Situação</dt><dd>${situacao}</dd></dl>
          <dl><dt>Prazo de envio</dt><dd>${dataBR(prazo)}${prazoInfo && prazoInfo.tipo !== 'neutro' ? '<br>' + chip(prazoInfo.texto, prazoInfo.tipo) : ''}</dd></dl>
        </div>

        <div class="campo">
          <label for="resumo-texto">Texto do resumo</label>
          <p class="ajuda" id="resumo-texto-ajuda">Conte o objetivo, como a equipe fez e o que descobriu.</p>
          <textarea id="resumo-texto" aria-describedby="resumo-texto-ajuda resumo-contador resumo-texto-erro" ${encerrado ? 'readonly' : ''}>${esc(resumo?.texto || '')}</textarea>
          <p class="contador" id="resumo-contador" aria-live="polite"></p>
          <p class="erro" id="resumo-texto-erro" aria-live="polite"></p>
        </div>

        ${campo({
          id: 'resumo-palavras',
          rotulo: 'Palavras-chave',
          valor: resumo?.palavrasChave || projeto.palavrasChave,
          ajuda: 'Vieram do cadastro do projeto. Altere se precisar.',
          extra: encerrado ? 'readonly' : ''
        })}

        ${encerrado ? '' : `
        <div class="acoes">
          <button class="botao primario" type="submit">${enviado ? 'Reenviar resumo' : 'Enviar resumo'}</button>
          ${enviado ? '' : '<button class="botao secundario" type="button" id="resumo-rascunho">Salvar rascunho</button>'}
        </div>`}
      </form>
    </section>`;

  const seletor = document.getElementById('resumo-projeto');
  if (seletor) {
    seletor.addEventListener('change', () => {
      if (seletor.value) location.hash = '#resumo/' + seletor.value;
    });
  }

  const texto = document.getElementById('resumo-texto');
  const contador = document.getElementById('resumo-contador');
  const atualizarContador = () => {
    const n = contarPalavras(texto.value);
    let complemento;
    if (n < LIMITES.palavrasMin) complemento = `faltam ${LIMITES.palavrasMin - n} para o mínimo`;
    else if (n > LIMITES.palavrasMax) complemento = `passou ${n - LIMITES.palavrasMax} do máximo`;
    else complemento = 'dentro do limite';
    contador.textContent = `${n} ${n === 1 ? 'palavra' : 'palavras'} · ${complemento} (${LIMITES.palavrasMin} a ${LIMITES.palavrasMax})`;
    contador.className = 'contador ' + (n >= LIMITES.palavrasMin && n <= LIMITES.palavrasMax ? 'ok' : (n > 0 ? 'fora' : ''));
  };
  texto.addEventListener('input', atualizarContador);
  atualizarContador();

  if (encerrado) return;

  const guardar = enviar => {
    const existente = resumoDoProjeto(projeto.id);
    const dados = {
      projetoId: projeto.id,
      texto: texto.value.trim(),
      palavrasChave: separarPalavrasChave(valorDe('resumo-palavras')).join(', '),
      enviado: enviar || Boolean(existente?.enviado),
      data: new Date().toISOString()
    };
    if (existente) Object.assign(existente, dados);
    else db.resumos.push(dados);
    salvar();
  };

  document.getElementById('resumo-rascunho')?.addEventListener('click', () => {
    const ok = validar({ 'resumo-texto': v => v ? '' : 'Escreva algo antes de salvar o rascunho.' });
    mostrarErro('resumo-palavras', '');
    if (!ok) return;
    guardar(false);
    registrar('salvou rascunho do resumo ' + projeto.id);
    avisar('Rascunho salvo. Ele ainda não foi enviado.');
    redesenhar();
  });

  document.getElementById('form-resumo').addEventListener('submit', evento => {
    evento.preventDefault();
    const ok = validar({
      'resumo-texto': v => {
        const n = contarPalavras(v);
        if (n < LIMITES.palavrasMin) return `O resumo tem ${n} palavras. O mínimo é ${LIMITES.palavrasMin}.`;
        if (n > LIMITES.palavrasMax) return `O resumo tem ${n} palavras. O máximo é ${LIMITES.palavrasMax}.`;
        return '';
      },
      'resumo-palavras': v => separarPalavrasChave(v).length ? '' : 'Informe pelo menos uma palavra-chave.'
    });
    if (!ok) return;
    const reenvio = Boolean(resumoDoProjeto(projeto.id)?.enviado);
    guardar(true);
    registrar((reenvio ? 'reenviou' : 'enviou') + ' resumo ' + projeto.id);
    avisar(reenvio ? 'Resumo reenviado.' : 'Resumo enviado.');
    redesenhar();
  });
}

/* =========================================================
   PENDÊNCIAS
   ========================================================= */

function telaPendencias(area, aba) {
  const abas = [
    { id: 'todas', nome: 'Todas', filtro: () => true },
    { id: 'resumos', nome: 'Resumos', filtro: p => p.grupo === 'resumo' },
    { id: 'documentos', nome: 'Documentos', filtro: p => p.grupo === 'documento' }
  ];
  const atual = abas.find(a => a.id === aba) || abas[0];
  const todas = calcularPendencias();
  const filtradas = todas.filter(atual.filtro);

  area.innerHTML = `
    ${cabecalho('Pendências', 'O que ainda falta para cada equipe. A lista se atualiza sozinha conforme você cadastra e envia.')}

    <nav class="abas" aria-label="Filtrar pendências">
      ${abas.map(a => `
        <a href="#pendencias/${a.id}" ${a.id === atual.id ? 'aria-current="page"' : ''}>
          ${a.nome} <span class="contagem">${todas.filter(a.filtro).length}</span>
        </a>`).join('')}
    </nav>

    ${db.equipes.length === 0
      ? `<section class="cartao">${estadoVazio('Nenhuma equipe cadastrada. As pendências aparecem aqui depois do primeiro cadastro.', '#alunos', 'Começar cadastro')}</section>`
      : db.equipes.map(equipe => grupoPendencias(equipe, filtradas.filter(p => p.equipeId === equipe.id))).join('')}`;
}

function grupoPendencias(equipe, itens) {
  const projeto = projetoDaEquipe(equipe.id);
  return `
    <section class="cartao grupo-equipe" aria-labelledby="pend-${equipe.id}">
      <div class="cartao-topo">
        <div>
          <h2 id="pend-${equipe.id}">${esc(nomeEquipe(equipe))}</h2>
          <span class="detalhe">${projeto ? esc(projeto.titulo) : 'Sem projeto'}</span>
        </div>
        ${itens.length ? chip(`${itens.length} ${itens.length === 1 ? 'pendência' : 'pendências'}`, 'atencao') : chip('Em dia', 'sucesso')}
      </div>
      ${itens.length ? `<ul class="lista">${itens.map(item => {
        const prazo = situacaoPrazo(item.prazo);
        return `
          <li class="pendencia">
            <div class="item-texto">
              <strong>${item.grupo === 'documento' ? 'Documento: ' : ''}${esc(item.titulo)}</strong>
              ${prazo ? chip(prazo.texto, prazo.tipo) : ''}
            </div>
            <a class="botao secundario pequeno" href="${item.rota}">${item.acao}</a>
          </li>`;
      }).join('')}</ul>` : ''}
    </section>`;
}

/* =========================================================
   ENVIO DE DOCUMENTOS
   ========================================================= */

function telaDocumentos(area, equipeEscolhida) {
  if (db.equipes.length === 0) {
    area.innerHTML = `
      ${cabecalho('Envio de documentos', '')}
      <section class="cartao estreito">${estadoVazio('Cadastre uma equipe antes de enviar documentos.', '#equipes', 'Cadastrar equipe')}</section>`;
    return;
  }

  const equipe = buscar('equipes', equipeEscolhida) ||
    db.equipes.find(e => documentosDaEquipe(e.id).length < TIPOS_DOCUMENTO.length) ||
    db.equipes[0];
  const enviados = documentosDaEquipe(equipe.id);
  const formatos = TIPOS_ARQUIVO.filter(t => t !== 'jpeg').map(t => t.toUpperCase()).join(', ').replace(/, (?=[^,]*$)/, ' ou ');

  area.innerHTML = `
    <a class="voltar" href="#pendencias"><span aria-hidden="true">←</span> Voltar para pendências</a>
    ${cabecalho('Envio de documentos', `Envie os documentos de cada equipe. Aceitamos arquivos ${formatos} de até 5 MB.`)}

    <section class="cartao estreito">
      ${campoSelecao({
        id: 'doc-equipe',
        rotulo: 'Equipe',
        opcoes: db.equipes.map(e => ({ valor: e.id, texto: `${nomeEquipe(e)} (${documentosDaEquipe(e.id).length} de ${TIPOS_DOCUMENTO.length})` })),
        valor: equipe.id,
        vazio: 'Escolha a equipe'
      })}

      <ul class="lista">
        ${TIPOS_DOCUMENTO.map(tipo => {
          const doc = enviados.find(d => d.tipo === tipo.id);
          return `
            <li class="documento">
              <div class="documento-info">
                <h3 id="doc-titulo-${tipo.id}">${tipo.nome}</h3>
                ${doc
                  ? `${chip('Enviado', 'sucesso')}<span class="detalhe">${esc(doc.arquivoNome)} · ${tamanhoLegivel(doc.tamanho)}</span>`
                  : chip('Pendente', 'atencao')}
              </div>
              ${doc ? `
                <div class="botoes">
                  <label class="botao secundario pequeno botao-arquivo">
                    Substituir arquivo
                    <input type="file" class="sr" accept=".pdf,.jpg,.jpeg,.png" data-tipo="${tipo.id}" aria-describedby="doc-erro-${tipo.id}">
                  </label>
                  <button type="button" class="botao-texto perigo" data-remover="${tipo.id}">Remover</button>
                </div>` : `
                <label class="zona" data-zona="${tipo.id}">
                  <input type="file" class="sr" accept=".pdf,.jpg,.jpeg,.png" data-tipo="${tipo.id}" aria-describedby="doc-titulo-${tipo.id} doc-erro-${tipo.id}">
                  <span><strong>Arraste o arquivo aqui</strong> ou <u>escolha no computador</u></span>
                  <span class="detalhe">${formatos}, até 5 MB</span>
                </label>`}
              <p class="erro" id="doc-erro-${tipo.id}" aria-live="polite"></p>
            </li>`;
        }).join('')}
      </ul>
    </section>`;

  document.getElementById('doc-equipe').addEventListener('change', evento => {
    if (evento.target.value) location.hash = '#documentos/' + evento.target.value;
  });

  area.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.files[0]) receberArquivo(equipe, input.dataset.tipo, input.files[0]);
    });
  });

  // Arrastar e soltar
  area.querySelectorAll('[data-zona]').forEach(zona => {
    zona.addEventListener('dragover', evento => {
      evento.preventDefault();
      zona.classList.add('arrastando');
    });
    zona.addEventListener('dragleave', () => zona.classList.remove('arrastando'));
    zona.addEventListener('drop', evento => {
      evento.preventDefault();
      zona.classList.remove('arrastando');
      const arquivo = evento.dataTransfer.files[0];
      if (arquivo) receberArquivo(equipe, zona.dataset.zona, arquivo);
    });
  });

  area.querySelectorAll('[data-remover]').forEach(botao => {
    botao.addEventListener('click', () => {
      const tipo = TIPOS_DOCUMENTO.find(t => t.id === botao.dataset.remover);
      if (!confirm(`Remover o arquivo de "${tipo.nome}"?`)) return;
      db.documentos = db.documentos.filter(d => !(d.equipeId === equipe.id && d.tipo === tipo.id));
      salvar();
      registrar(`removeu documento ${tipo.id} da equipe ${equipe.id}`);
      avisar('Arquivo removido.');
      redesenhar();
    });
  });
}

function receberArquivo(equipe, tipoId, arquivo) {
  const extensao = arquivo.name.split('.').pop().toLowerCase();
  const erroId = 'doc-erro-' + tipoId;

  if (!TIPOS_ARQUIVO.includes(extensao)) {
    document.getElementById(erroId).textContent = `O arquivo "${arquivo.name}" não é PDF, JPG ou PNG. Escolha outro arquivo.`;
    return;
  }
  if (arquivo.size > LIMITES.tamanhoArquivo) {
    document.getElementById(erroId).textContent = `O arquivo tem ${tamanhoLegivel(arquivo.size)}. O limite é 5 MB.`;
    return;
  }

  // No protótipo guardamos só o nome e o tamanho do arquivo, não o conteúdo.
  // O envio real para um servidor faz parte da próxima etapa do projeto.
  db.documentos = db.documentos.filter(d => !(d.equipeId === equipe.id && d.tipo === tipoId));
  db.documentos.push({
    equipeId: equipe.id,
    tipo: tipoId,
    arquivoNome: arquivo.name,
    tamanho: arquivo.size,
    data: new Date().toISOString()
  });
  salvar();
  registrar(`enviou documento ${tipoId} da equipe ${equipe.id}`);

  const completos = documentosDaEquipe(equipe.id).length === TIPOS_DOCUMENTO.length;
  avisar(completos
    ? `Todos os documentos da ${nomeEquipe(equipe)} foram enviados.`
    : 'Documento enviado.');
  redesenhar();
}

/* =========================================================
   AVALIAÇÃO NA FEIRA
   Usada no dia do evento. Cada avaliador preenche uma ficha por projeto,
   com nota de 1 a 5 em cada critério. A classificação é a média das fichas.
   ========================================================= */

function telaAvaliacao(area, feiraEscolhida) {
  // Sem feira na URL: abre a primeira que tem projetos inscritos
  const feira = buscar('feiras', feiraEscolhida) ||
    db.feiras.find(f => inscricoesDaFeira(f.id).length) ||
    db.feiras[0];
  const inscricoes = inscricoesDaFeira(feira.id);
  const ranking = classificacao(feira.id);
  const totalFichas = inscricoes.reduce((soma, i) => soma + avaliacoesDaInscricao(i.id).length, 0);
  const todosAvaliados = inscricoes.length > 0 && ranking.length === inscricoes.length;
  const dias = diasAte(feira.data);

  let faixa = '';
  if (dias > 0) {
    faixa = `<div class="faixa faixa-info"><p>A feira acontece em ${esc(feira.dias)}. A ficha já pode ser aberta para você conhecer como funciona.</p></div>`;
  } else if (dias === 0) {
    faixa = '<div class="faixa faixa-sucesso"><p>Hoje é o primeiro dia da feira. Bom trabalho na avaliação!</p></div>';
  }

  area.innerHTML = `
    ${cabecalho('Avaliação na feira', 'No dia da feira, cada avaliador preenche uma ficha por projeto. A classificação é calculada sozinha, com a média das fichas.')}

    ${db.feiras.length > 1 ? `
      <div class="seletor-feira">
        ${campoSelecao({
          id: 'aval-feira',
          rotulo: 'Feira',
          opcoes: db.feiras.map(f => ({ valor: f.id, texto: f.nome })),
          valor: feira.id,
          vazio: 'Escolha a feira'
        })}
      </div>` : ''}

    ${faixa}

    <section class="indicadores" aria-label="Andamento da avaliação">
      ${indicador('Projetos inscritos', inscricoes.length, 'nesta feira')}
      ${indicador('Projetos avaliados', `${ranking.length} de ${inscricoes.length}`,
        todosAvaliados ? 'todos já têm ficha' : 'com pelo menos uma ficha',
        todosAvaliados ? 'sucesso' : '')}
      ${indicador('Fichas preenchidas', totalFichas, totalFichas === 1 ? 'ficha no total' : 'fichas no total')}
    </section>

    <div class="grade-form">
      <section class="cartao" aria-labelledby="titulo-aval-projetos">
        <div class="cartao-topo">
          <h2 id="titulo-aval-projetos">Projetos para avaliar <span class="contagem">${inscricoes.length}</span></h2>
        </div>
        ${inscricoes.length === 0
          ? estadoVazio('Nenhum projeto inscrito nesta feira ainda.', '#inscricao', 'Fazer inscrição')
          : listaParaAvaliar(inscricoes)}
      </section>

      <section class="cartao" aria-labelledby="titulo-classificacao">
        <div class="cartao-topo">
          <h2 id="titulo-classificacao">Classificação parcial</h2>
        </div>
        ${listaClassificacao(ranking)}
      </section>
    </div>`;

  document.getElementById('aval-feira')?.addEventListener('change', evento => {
    if (evento.target.value) location.hash = '#avaliacao/' + evento.target.value;
  });
}

function listaParaAvaliar(inscricoes) {
  const itens = inscricoes
    .map(inscricao => ({ inscricao, projeto: buscar('projetos', inscricao.projetoId) }))
    .filter(item => item.projeto)
    .sort((a, b) => a.projeto.titulo.localeCompare(b.projeto.titulo, 'pt-BR'));

  return `<ul class="lista">${itens.map(({ inscricao, projeto }) => {
    const equipe = buscar('equipes', inscricao.equipeId);
    const fichas = avaliacoesDaInscricao(inscricao.id).length;
    const media = mediaDaInscricao(inscricao.id);
    return `
      <li class="item-lista">
        <div class="item-texto">
          <strong>${esc(projeto.titulo)}</strong>
          <span class="detalhe">${esc(nomeEquipe(equipe))} · ${esc(projeto.area)}</span>
          <span class="detalhe">${fichas
            ? `${fichas} ${fichas === 1 ? 'ficha' : 'fichas'} · média ${numeroBR(media)} de ${PONTUACAO_MAXIMA}`
            : 'Nenhuma ficha ainda'}</span>
        </div>
        ${fichas ? chip('Avaliado', 'sucesso') : chip('Não avaliado', 'atencao')}
        <a class="botao secundario pequeno" href="#avaliar/${inscricao.id}" aria-label="Avaliar ${esc(projeto.titulo)}">Avaliar</a>
      </li>`;
  }).join('')}</ul>`;
}

function listaClassificacao(ranking) {
  if (ranking.length === 0) {
    return estadoVazio('A classificação aparece depois que a primeira ficha for salva.');
  }
  return `
    <ol class="lista classificacao">${ranking.map((item, i) => {
      const projeto = buscar('projetos', item.inscricao.projetoId);
      const equipe = buscar('equipes', item.inscricao.equipeId);
      return `
        <li class="item-classificacao">
          <span class="posicao" aria-hidden="true">${i + 1}º</span>
          <div class="item-texto">
            <span class="sr">${i + 1}º lugar:</span>
            <strong>${esc(projeto?.titulo)}</strong>
            <span class="detalhe">${esc(nomeEquipe(equipe))} · ${item.fichas} ${item.fichas === 1 ? 'ficha' : 'fichas'}</span>
          </div>
          <span class="media"><strong>${numeroBR(item.media)}</strong> de ${PONTUACAO_MAXIMA}</span>
        </li>`;
    }).join('')}</ol>
    <p class="ajuda nota-rodape">Média da soma das notas de cada ficha. Em caso de empate, fica na frente o projeto com mais fichas.</p>`;
}

/* ---------- Ficha de avaliação de um projeto ---------- */

function telaAvaliar(area, inscricaoId, avaliacaoId) {
  const inscricao = buscar('inscricoes', inscricaoId);
  const projeto = inscricao && buscar('projetos', inscricao.projetoId);

  if (!inscricao || !projeto) {
    area.innerHTML = `
      ${cabecalho('Ficha de avaliação', '')}
      <section class="cartao estreito">${estadoVazio('Este projeto não foi encontrado. Escolha um projeto na lista da feira.', '#avaliacao', 'Ver projetos da feira')}</section>`;
    return;
  }

  const equipe = buscar('equipes', inscricao.equipeId);
  const feira = buscar('feiras', inscricao.feiraId);
  const fichas = avaliacoesDaInscricao(inscricao.id);
  const editando = fichas.find(a => a.id === avaliacaoId) || null;
  const integrantes = equipe.alunoIds.map(id => buscar('alunos', id)?.nome).filter(Boolean);
  const resumo = resumoDoProjeto(projeto.id);

  // O nome do último avaliador fica guardado para não ser digitado em toda ficha
  const nomeAvaliador = editando ? editando.avaliador : (db.ultimoAvaliador || '');
  const minhaFicha = !editando && nomeAvaliador &&
    fichas.find(a => normalizar(a.avaliador) === normalizar(nomeAvaliador));
  const notas = editando ? editando.notas : {};

  area.innerHTML = `
    <a class="voltar" href="#avaliacao/${feira.id}"><span aria-hidden="true">←</span> Voltar para os projetos da feira</a>
    ${cabecalho(editando ? 'Editar avaliação' : 'Ficha de avaliação', 'Marque uma nota de 1 a 5 em cada critério. A pontuação é somada automaticamente.')}

    <div class="grade-form">
      <section class="cartao" aria-label="Ficha de avaliação">
        ${minhaFicha ? `
          <div class="faixa faixa-info">
            <p>${esc(minhaFicha.avaliador)} já avaliou este projeto.</p>
            <a class="botao secundario pequeno" href="#avaliar/${inscricao.id}/${minhaFicha.id}">Abrir minha ficha</a>
          </div>` : ''}

        <div class="info-resumo">
          <dl><dt>Projeto</dt><dd>${esc(projeto.titulo)}</dd></dl>
          <dl><dt>Equipe</dt><dd>${esc(nomeEquipe(equipe))}</dd></dl>
          <dl><dt>Integrantes</dt><dd>${esc(integrantes.join(', '))}</dd></dl>
          <dl><dt>Área</dt><dd>${esc(projeto.area)}</dd></dl>
        </div>

        ${resumo?.enviado ? `
          <details class="ler-resumo">
            <summary>Ler o resumo do projeto</summary>
            <p>${esc(resumo.texto)}</p>
          </details>` : ''}

        <form id="form-avaliacao" novalidate>
          ${campo({
            id: 'aval-nome',
            rotulo: 'Nome do avaliador',
            valor: nomeAvaliador,
            ajuda: 'Fica guardado neste aparelho para as próximas fichas.',
            extra: 'autocomplete="name"'
          })}

          <p class="escala-legenda">
            ${ESCALA_AVALIACAO.map((rotulo, i) => `<span><strong>${i + 1}</strong> ${rotulo}</span>`).join('')}
          </p>

          ${CRITERIOS_AVALIACAO.map((criterio, n) => `
            <fieldset id="crit-${criterio.id}" class="criterio"
                      aria-describedby="crit-${criterio.id}-ajuda crit-${criterio.id}-erro">
              <legend>${n + 1}. ${criterio.nome}</legend>
              <p class="ajuda" id="crit-${criterio.id}-ajuda">${criterio.pergunta}</p>
              <div class="escala">
                ${ESCALA_AVALIACAO.map((rotulo, i) => `
                  <label class="nota">
                    <input type="radio" name="${criterio.id}" value="${i + 1}" ${notas[criterio.id] === i + 1 ? 'checked' : ''}>
                    <span class="nota-numero">${i + 1}</span>
                    <span class="sr">${rotulo}</span>
                  </label>`).join('')}
              </div>
              <p class="nota-texto" id="crit-${criterio.id}-texto"></p>
              <p class="erro" id="crit-${criterio.id}-erro" aria-live="polite"></p>
            </fieldset>`).join('')}

          <div class="campo">
            <label for="aval-comentario">Comentário para a equipe <span class="opcional">(opcional)</span></label>
            <p class="ajuda" id="aval-comentario-ajuda">Um elogio ou uma sugestão de melhoria.</p>
            <textarea id="aval-comentario" class="curto" aria-describedby="aval-comentario-ajuda">${esc(editando?.comentario || '')}</textarea>
          </div>

          <p class="total-ficha" id="total-ficha" aria-live="polite"></p>

          <div class="acoes">
            <button class="botao primario" type="submit">${editando ? 'Salvar alterações' : 'Salvar avaliação'}</button>
            <a class="botao secundario" href="#avaliacao/${feira.id}">Cancelar</a>
          </div>
        </form>
      </section>

      <section class="cartao" aria-labelledby="titulo-fichas">
        <div class="cartao-topo">
          <h2 id="titulo-fichas">Fichas deste projeto <span class="contagem">${fichas.length}</span></h2>
        </div>
        ${listaFichas(inscricao, fichas, editando)}
      </section>
    </div>`;

  const form = document.getElementById('form-avaliacao');
  const notaMarcada = id => Number(form.querySelector(`input[name="${id}"]:checked`)?.value || 0);

  // Mostra o nome da nota escolhida e soma a pontuação enquanto o avaliador marca
  const atualizarTotal = () => {
    let soma = 0;
    let faltam = 0;
    for (const criterio of CRITERIOS_AVALIACAO) {
      const nota = notaMarcada(criterio.id);
      document.getElementById(`crit-${criterio.id}-texto`).textContent =
        nota ? `${nota} · ${ESCALA_AVALIACAO[nota - 1]}` : '';
      if (nota) soma += nota;
      else faltam++;
    }
    document.getElementById('total-ficha').innerHTML =
      `Pontuação: <strong>${soma} de ${PONTUACAO_MAXIMA}</strong>` +
      (faltam ? ` <span class="falta">· ${faltam === 1 ? 'falta 1 critério' : `faltam ${faltam} critérios`}</span>` : '');
  };
  form.addEventListener('change', atualizarTotal);
  atualizarTotal();

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    const regras = {
      'aval-nome': v => {
        if (v.length < 3) return 'Informe o nome completo do avaliador.';
        const repetida = fichas.some(a => a.id !== editando?.id && normalizar(a.avaliador) === normalizar(v));
        return repetida ? 'Este avaliador já tem uma ficha para este projeto. Use "Editar" na lista de fichas.' : '';
      }
    };
    for (const criterio of CRITERIOS_AVALIACAO) {
      regras['crit-' + criterio.id] = () => notaMarcada(criterio.id) ? '' : 'Escolha uma nota de 1 a 5.';
    }
    if (!validar(regras)) return;

    const dados = {
      avaliador: valorDe('aval-nome'),
      notas: Object.fromEntries(CRITERIOS_AVALIACAO.map(c => [c.id, notaMarcada(c.id)])),
      comentario: valorDe('aval-comentario'),
      data: new Date().toISOString()
    };

    if (editando) {
      Object.assign(editando, dados);
      registrar('editou avaliação ' + editando.id);
    } else {
      const nova = { id: novoId('av'), inscricaoId: inscricao.id, ...dados };
      db.avaliacoes.push(nova);
      registrar('avaliou projeto ' + projeto.id + ' na feira ' + feira.id);
    }
    db.ultimoAvaliador = dados.avaliador;
    salvar();

    avisar(`Avaliação salva: ${pontuacao(dados)} de ${PONTUACAO_MAXIMA} pontos.`);
    location.hash = '#avaliacao/' + feira.id;
  });

  area.querySelectorAll('[data-excluir-ficha]').forEach(botao => {
    botao.addEventListener('click', () => excluirFicha(botao.dataset.excluirFicha, inscricao.id));
  });
}

function listaFichas(inscricao, fichas, editando) {
  if (fichas.length === 0) return estadoVazio('Nenhuma ficha preenchida para este projeto.');

  const media = mediaDaInscricao(inscricao.id);
  return `
    <ul class="lista">${fichas.map(ficha => {
      const emEdicao = editando?.id === ficha.id;
      return `
      <li class="item-lista">
        <div class="item-texto">
          <strong>${esc(ficha.avaliador)}</strong>
          <span class="detalhe">${pontuacao(ficha)} de ${PONTUACAO_MAXIMA} pontos · ${dataBR(ficha.data)}</span>
          ${ficha.comentario ? `<span class="comentario">“${esc(ficha.comentario)}”</span>` : ''}
        </div>
        ${emEdicao ? chip('Em edição', 'info') : ''}
        <div class="botoes">
          ${emEdicao ? '' : `<a class="botao-texto" href="#avaliar/${inscricao.id}/${ficha.id}" aria-label="Editar a ficha de ${esc(ficha.avaliador)}">Editar</a>`}
          <button type="button" class="botao-texto perigo" data-excluir-ficha="${ficha.id}" aria-label="Excluir a ficha de ${esc(ficha.avaliador)}">Excluir</button>
        </div>
      </li>`;
    }).join('')}
    </ul>
    <div class="cartao-rodape">
      <p><strong>Média do projeto:</strong> ${numeroBR(media)} de ${PONTUACAO_MAXIMA} pontos</p>
    </div>`;
}

function excluirFicha(id, inscricaoId) {
  const ficha = db.avaliacoes.find(a => a.id === id);
  if (!ficha || !confirm(`Excluir a ficha de ${ficha.avaliador}? As notas dela deixam de contar na média.`)) return;
  db.avaliacoes = db.avaliacoes.filter(a => a.id !== id);
  salvar();
  registrar('excluiu avaliação ' + id);
  avisar('Ficha excluída.');
  // Se a ficha excluída estava aberta para edição, volta para uma ficha nova
  if (location.hash === `#avaliar/${inscricaoId}/${id}`) location.hash = '#avaliar/' + inscricaoId;
  else redesenhar();
}
