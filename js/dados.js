/* crie.Ciência - dados.js
   Responsável por guardar e ler os dados no navegador (localStorage)
   e por concentrar as regras que ligam professor, alunos, equipes,
   projetos, inscrições, resumos e documentos. */

const CHAVE_ARMAZENAMENTO = 'crieciencia.dados.v1';

const LIMITES = {
  membrosMin: 2,
  membrosMax: 5,
  palavrasMin: 80,
  palavrasMax: 250,
  palavrasChaveMax: 5,
  tamanhoArquivo: 5 * 1024 * 1024 // 5 MB
};

const SERIES = ['6º ano', '7º ano', '8º ano', '9º ano'];

const AREAS = [
  'Ciências Agrárias',
  'Ciências Biológicas',
  'Ciências da Saúde',
  'Ciências Exatas e da Terra',
  'Ciências Humanas',
  'Ciências Sociais Aplicadas',
  'Engenharias',
  'Linguística, Letras e Artes'
];

const TIPOS_DOCUMENTO = [
  { id: 'ficha', nome: 'Ficha de inscrição assinada' },
  { id: 'termo', nome: 'Termo de uso de imagem' },
  { id: 'autorizacao', nome: 'Autorização dos responsáveis' }
];

const TIPOS_ARQUIVO = ['pdf', 'jpg', 'jpeg', 'png'];

// As feiras são cadastradas pela organização do evento.
// Enquanto não existe o perfil de organizador, elas já vêm prontas.
// Nomes e datas são ilustrativos.
const FEIRAS_PADRAO = [
  {
    id: 'feira-municipal',
    nome: 'Feira de Ciências da Rede Municipal 2027',
    local: 'Ginásio Poliesportivo Municipal',
    dias: '18 e 19 de maio de 2027',
    prazoInscricao: '2027-03-31',
    prazoResumo: '2027-04-16',
    prazoDocumentos: '2027-04-30',
    data: '2027-05-18'
  },
  {
    id: 'mostra-regional',
    nome: 'Mostra Regional de Ciência e Tecnologia 2027',
    local: 'Centro de Convenções',
    dias: '23 a 25 de setembro de 2027',
    prazoInscricao: '2027-07-30',
    prazoResumo: '2027-08-13',
    prazoDocumentos: '2027-08-27',
    data: '2027-09-23'
  }
];

/* ---------- Estrutura do banco ---------- */

function bancoVazio() {
  return {
    professor: null,
    alunos: [],
    equipes: [],
    projetos: [],
    feiras: JSON.parse(JSON.stringify(FEIRAS_PADRAO)),
    inscricoes: [],
    resumos: [],
    documentos: [],
    registro: []
  };
}

// Dados fictícios usados nos testes de usabilidade.
// Davi, Elisa e Felipe ficam sem equipe de propósito (tarefa 1 do teste).
function bancoExemplo() {
  const banco = bancoVazio();
  const escola = 'Escola Municipal Professora Iracema Lopes';

  banco.professor = {
    nome: 'Marta Ribeiro',
    email: 'marta.ribeiro@exemplo.com',
    telefone: '(84) 99876-1234',
    escola,
    disciplina: 'Ciências'
  };

  const alunos = [
    ['al-ana', 'Ana Clara Souza', '2012-03-14', '8º ano', 'Maria Souza', '(84) 99811-2201'],
    ['al-bruno', 'Bruno Lima', '2012-07-02', '8º ano', 'José Lima', '(84) 99811-2202'],
    ['al-carla', 'Carla Nunes', '2011-11-20', '9º ano', 'Rita Nunes', '(84) 99811-2203'],
    ['al-gabriel', 'Gabriel Rocha', '2013-01-09', '7º ano', 'Paulo Rocha', '(84) 99811-2204'],
    ['al-helena', 'Helena Dias', '2013-05-30', '7º ano', 'Sandra Dias', '(84) 99811-2205'],
    ['al-igor', 'Igor Santos', '2011-09-12', '9º ano', 'Luciana Santos', '(84) 99811-2206'],
    ['al-julia', 'Júlia Costa', '2012-02-25', '8º ano', 'Fábio Costa', '(84) 99811-2207'],
    ['al-lucas', 'Lucas Araújo', '2011-06-18', '9º ano', 'Cláudia Araújo', '(84) 99811-2208'],
    ['al-davi', 'Davi Pereira', '2013-04-03', '7º ano', 'Renata Pereira', '(84) 99811-2209'],
    ['al-elisa', 'Elisa Moura', '2012-10-11', '8º ano', 'Marcos Moura', '(84) 99811-2210'],
    ['al-felipe', 'Felipe Martins', '2014-08-22', '6º ano', 'Tânia Martins', '(84) 99811-2211']
  ];
  banco.alunos = alunos.map(([id, nome, nascimento, serie, responsavel, contato]) =>
    ({ id, nome, nascimento, serie, escola, responsavel, contato }));

  banco.equipes = [
    { id: 'eq-solar', nome: 'Solar', alunoIds: ['al-ana', 'al-bruno', 'al-carla'] },
    { id: 'eq-mare', nome: 'Maré', alunoIds: ['al-gabriel', 'al-helena'] },
    { id: 'eq-pulso', nome: 'Pulso', alunoIds: ['al-igor', 'al-julia', 'al-lucas'] }
  ];

  banco.projetos = [
    { id: 'pr-solar', equipeId: 'eq-solar', titulo: 'Fogão solar com materiais recicláveis', area: 'Engenharias', palavrasChave: 'energia solar, reciclagem, sustentabilidade' },
    { id: 'pr-mare', equipeId: 'eq-mare', titulo: 'Qualidade da água do açude da comunidade', area: 'Ciências Biológicas', palavrasChave: 'água, saneamento, saúde' },
    { id: 'pr-pulso', equipeId: 'eq-pulso', titulo: 'Monitor de batimentos cardíacos com Arduino', area: 'Engenharias', palavrasChave: 'Arduino, saúde, sensores' }
  ];

  banco.inscricoes = [
    { id: 'in-solar', feiraId: 'feira-municipal', equipeId: 'eq-solar', projetoId: 'pr-solar', data: '2026-10-20T10:12:00' },
    { id: 'in-mare', feiraId: 'feira-municipal', equipeId: 'eq-mare', projetoId: 'pr-mare', data: '2026-10-22T14:30:00' }
  ];

  banco.resumos = [
    {
      projetoId: 'pr-solar',
      texto: 'O projeto investigou a construção de um fogão solar usando caixas de papelão, papel-alumínio, vidro reaproveitado e tinta preta. O objetivo foi verificar se um equipamento de baixo custo consegue aquecer água e cozinhar alimentos simples usando apenas a energia do sol, que é abundante na nossa região. A equipe montou dois modelos, um do tipo caixa e outro do tipo painel, e mediu a temperatura interna a cada quinze minutos, entre nove e quinze horas, durante cinco dias. O modelo caixa chegou a 92 graus e cozinhou arroz em pouco mais de duas horas. Os resultados mostram que materiais recicláveis podem gerar uma alternativa econômica e sustentável para famílias e escolas.',
      palavrasChave: 'energia solar, reciclagem, sustentabilidade',
      enviado: true,
      data: '2026-11-03T19:40:00'
    },
    {
      projetoId: 'pr-mare',
      texto: 'A equipe coletou amostras de água em três pontos do açude da comunidade para observar a turbidez, o pH e a presença de coliformes, usando kits simples cedidos pelo posto de saúde. Ainda estamos organizando as tabelas com os resultados.',
      palavrasChave: 'água, saneamento, saúde',
      enviado: false,
      data: '2026-11-08T21:05:00'
    }
  ];

  banco.documentos = [
    { equipeId: 'eq-solar', tipo: 'ficha', arquivoNome: 'ficha-inscricao-solar.pdf', tamanho: 482133, data: '2026-10-25T09:00:00' },
    { equipeId: 'eq-solar', tipo: 'termo', arquivoNome: 'termo-imagem-solar.pdf', tamanho: 291004, data: '2026-10-25T09:02:00' },
    { equipeId: 'eq-solar', tipo: 'autorizacao', arquivoNome: 'autorizacoes-solar.jpg', tamanho: 1350022, data: '2026-10-25T09:05:00' },
    { equipeId: 'eq-mare', tipo: 'ficha', arquivoNome: 'ficha-mare.pdf', tamanho: 512870, data: '2026-10-28T16:20:00' }
  ];

  return banco;
}

/* ---------- Leitura e gravação no navegador ---------- */

let db = carregar();

function carregar() {
  try {
    const texto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (texto) {
      // Object.assign garante que campos novos existam mesmo em dados antigos
      return Object.assign(bancoVazio(), JSON.parse(texto));
    }
  } catch (erro) {
    console.warn('Não foi possível ler os dados salvos.', erro);
  }
  // Primeiro acesso: começa com os dados de exemplo
  const inicial = bancoExemplo();
  gravar(inicial);
  return inicial;
}

function gravar(banco) {
  try {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(banco));
    return true;
  } catch (erro) {
    console.warn('Não foi possível salvar.', erro);
    return false;
  }
}

function salvar() {
  const ok = gravar(db);
  if (!ok && typeof avisar === 'function') {
    avisar('Não foi possível salvar neste navegador. Verifique se ele está em modo anônimo.', 'erro');
  }
  return ok;
}

function substituirBanco(novo) {
  db = novo;
  salvar();
}

// Guarda o que o participante fez e quando (usado na análise do teste)
function registrar(evento) {
  db.registro.push({ quando: new Date().toISOString(), evento });
  if (db.registro.length > 3000) db.registro.splice(0, db.registro.length - 3000);
  salvar();
}

function novoId(prefixo) {
  return prefixo + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ---------- Consultas ---------- */

function buscar(colecao, id) {
  return db[colecao].find(item => item.id === id);
}

function nomeEquipe(equipe) {
  if (!equipe) return '';
  return /^equipe\s/i.test(equipe.nome) ? equipe.nome : 'Equipe ' + equipe.nome;
}

function equipeDoAluno(alunoId) {
  return db.equipes.find(e => e.alunoIds.includes(alunoId));
}

function alunosSemEquipe() {
  return db.alunos.filter(a => !equipeDoAluno(a.id));
}

function projetoDaEquipe(equipeId) {
  return db.projetos.find(p => p.equipeId === equipeId);
}

function equipesSemProjeto() {
  return db.equipes.filter(e => !projetoDaEquipe(e.id));
}

function equipesComProjeto() {
  return db.equipes.filter(e => projetoDaEquipe(e.id));
}

function inscricoesDaEquipe(equipeId) {
  return db.inscricoes.filter(i => i.equipeId === equipeId);
}

function projetosInscritos() {
  return db.projetos.filter(p => db.inscricoes.some(i => i.projetoId === p.id));
}

function resumoDoProjeto(projetoId) {
  return db.resumos.find(r => r.projetoId === projetoId);
}

function documentosDaEquipe(equipeId) {
  return db.documentos.filter(d => d.equipeId === equipeId);
}

// Entre as feiras em que a equipe está inscrita, pega o prazo que vence primeiro
function prazoMaisProximo(inscricoes, campo) {
  const datas = inscricoes
    .map(i => buscar('feiras', i.feiraId))
    .filter(Boolean)
    .map(f => f[campo])
    .sort();
  return datas[0] || null;
}

function proximoPrazoInscricao() {
  const abertas = db.feiras
    .map(f => f.prazoInscricao)
    .filter(d => diasAte(d) >= 0)
    .sort();
  return abertas[0] || null;
}

/* ---------- Pendências ----------
   Não são digitadas pelo professor: são calculadas a partir dos cadastros.
   Ordem das verificações segue o fluxo: projeto -> inscrição -> resumo -> documentos. */

function calcularPendencias() {
  const lista = [];

  for (const equipe of db.equipes) {
    const projeto = projetoDaEquipe(equipe.id);
    const inscricoes = inscricoesDaEquipe(equipe.id);

    if (!projeto) {
      lista.push({
        equipeId: equipe.id,
        grupo: 'cadastro',
        titulo: 'Cadastrar o projeto da equipe',
        acao: 'Cadastrar projeto',
        rota: '#projetos/' + equipe.id
      });
    } else if (inscricoes.length === 0) {
      lista.push({
        equipeId: equipe.id,
        grupo: 'cadastro',
        titulo: 'Inscrever o projeto em uma feira',
        acao: 'Fazer inscrição',
        rota: '#inscricao/' + equipe.id,
        prazo: proximoPrazoInscricao()
      });
    } else {
      const resumo = resumoDoProjeto(projeto.id);
      if (!resumo || !resumo.enviado) {
        lista.push({
          equipeId: equipe.id,
          grupo: 'resumo',
          titulo: resumo ? 'Resumo salvo como rascunho, falta enviar' : 'Enviar o resumo do projeto',
          acao: 'Enviar resumo',
          rota: '#resumo/' + projeto.id,
          prazo: prazoMaisProximo(inscricoes, 'prazoResumo')
        });
      }
    }

    const enviados = documentosDaEquipe(equipe.id);
    const prazoDocs = inscricoes.length ? prazoMaisProximo(inscricoes, 'prazoDocumentos') : null;
    for (const tipo of TIPOS_DOCUMENTO) {
      if (!enviados.some(d => d.tipo === tipo.id)) {
        lista.push({
          equipeId: equipe.id,
          grupo: 'documento',
          titulo: tipo.nome,
          acao: 'Enviar documento',
          rota: '#documentos/' + equipe.id,
          prazo: prazoDocs
        });
      }
    }
  }

  return lista;
}

/* ---------- Datas ---------- */

function doisDigitos(n) {
  return String(n).padStart(2, '0');
}

function hojeISO() {
  const h = new Date();
  return `${h.getFullYear()}-${doisDigitos(h.getMonth() + 1)}-${doisDigitos(h.getDate())}`;
}

// "2027-04-16" -> "16/04/2027"
function dataBR(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

// "16/04/2027" -> "2027-04-16" (ou null se a data não existir)
function dataISO(br) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br || '');
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const existe = data.getFullYear() === Number(ano) &&
                 data.getMonth() === Number(mes) - 1 &&
                 data.getDate() === Number(dia);
  return existe ? `${ano}-${mes}-${dia}` : null;
}

function diasAte(iso) {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number);
  const alvo = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / 86400000);
}

function idade(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const hoje = new Date();
  let anos = hoje.getFullYear() - ano;
  if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) anos--;
  return anos;
}

// Texto e cor do chip de prazo
function situacaoPrazo(iso) {
  if (!iso) return null;
  const dias = diasAte(iso);
  if (dias < 0) return { texto: 'Prazo encerrado em ' + dataBR(iso), tipo: 'atraso' };
  if (dias === 0) return { texto: 'Vence hoje', tipo: 'atraso' };
  if (dias === 1) return { texto: 'Vence amanhã', tipo: 'atencao' };
  if (dias <= 7) return { texto: `Vence em ${dias} dias`, tipo: 'atencao' };
  return { texto: 'Prazo: ' + dataBR(iso), tipo: 'neutro' };
}

/* ---------- Outras utilidades ---------- */

function contarPalavras(texto) {
  return (texto.trim().match(/\S+/g) || []).length;
}

function separarPalavrasChave(texto) {
  return texto.split(/[,;]/).map(p => p.trim()).filter(Boolean);
}

function tamanhoLegivel(bytes) {
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
}

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}
