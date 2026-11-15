/* crie.Ciência - interface.js
   Pequenas funções usadas por todas as telas: montar campos de formulário,
   chips de situação, mensagens, validação e máscaras de digitação. */

// Evita que um texto digitado pelo usuário seja interpretado como HTML
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function cabecalho(titulo, subtitulo, acao = '') {
  return `
    <div class="cabecalho-pagina">
      <div>
        <h1 tabindex="-1">${titulo}</h1>
        ${subtitulo ? `<p class="subtitulo">${subtitulo}</p>` : ''}
      </div>
      ${acao}
    </div>`;
}

function chip(texto, tipo = 'neutro') {
  return `<span class="chip chip-${tipo}"><span class="ponto" aria-hidden="true"></span>${esc(texto)}</span>`;
}

function descricaoCampo(id, ajuda) {
  return [ajuda ? `${id}-ajuda` : '', `${id}-erro`].filter(Boolean).join(' ');
}

function campo({ id, rotulo, tipo = 'text', valor = '', ajuda = '', extra = '' }) {
  return `
    <div class="campo">
      <label for="${id}">${rotulo}</label>
      ${ajuda ? `<p class="ajuda" id="${id}-ajuda">${ajuda}</p>` : ''}
      <input id="${id}" name="${id}" type="${tipo}" value="${esc(valor)}"
             aria-describedby="${descricaoCampo(id, ajuda)}" ${extra}>
      <p class="erro" id="${id}-erro" aria-live="polite"></p>
    </div>`;
}

// opcoes: lista de textos ou de objetos { valor, texto }
function campoSelecao({ id, rotulo, opcoes, valor = '', ajuda = '', vazio = 'Selecione' }) {
  const itens = opcoes.map(o => typeof o === 'string' ? { valor: o, texto: o } : o);
  return `
    <div class="campo">
      <label for="${id}">${rotulo}</label>
      ${ajuda ? `<p class="ajuda" id="${id}-ajuda">${ajuda}</p>` : ''}
      <select id="${id}" name="${id}" aria-describedby="${descricaoCampo(id, ajuda)}">
        <option value="">${vazio}</option>
        ${itens.map(o => `<option value="${esc(o.valor)}" ${o.valor === valor ? 'selected' : ''}>${esc(o.texto)}</option>`).join('')}
      </select>
      <p class="erro" id="${id}-erro" aria-live="polite"></p>
    </div>`;
}

function estadoVazio(texto, link = '', rotuloLink = '') {
  return `
    <div class="estado-vazio">
      <p>${texto}</p>
      ${link ? `<a class="botao secundario" href="${link}">${rotuloLink}</a>` : ''}
    </div>`;
}

/* ---------- Validação ----------
   regras: { idDoCampo: função que recebe o valor e devolve a mensagem de erro (ou '') }
   Mostra as mensagens embaixo de cada campo e leva o foco para o primeiro erro. */

function validar(regras) {
  let primeiroErro = null;
  for (const [id, regra] of Object.entries(regras)) {
    const elemento = document.getElementById(id);
    const valor = (elemento.value || '').trim();
    const mensagem = regra(valor, elemento);
    mostrarErro(id, mensagem);
    if (mensagem && !primeiroErro) primeiroErro = elemento;
  }
  if (primeiroErro) {
    const alvo = primeiroErro.tagName === 'FIELDSET' ? primeiroErro.querySelector('input') : primeiroErro;
    if (alvo) alvo.focus();
  }
  return !primeiroErro;
}

function mostrarErro(id, mensagem) {
  const elemento = document.getElementById(id);
  const caixa = document.getElementById(id + '-erro');
  if (caixa) caixa.textContent = mensagem || '';
  if (!elemento) return;
  if (mensagem) elemento.setAttribute('aria-invalid', 'true');
  else elemento.removeAttribute('aria-invalid');
}

function telefoneValido(texto) {
  const numeros = texto.replace(/\D/g, '');
  return numeros.length === 10 || numeros.length === 11;
}

function emailValido(texto) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);
}

/* ---------- Máscaras ---------- */

function mascaraData(input) {
  input.addEventListener('input', () => {
    const d = input.value.replace(/\D/g, '').slice(0, 8);
    if (d.length > 4) input.value = `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
    else if (d.length > 2) input.value = `${d.slice(0, 2)}/${d.slice(2)}`;
    else input.value = d;
  });
}

function mascaraTelefone(input) {
  input.addEventListener('input', () => {
    const d = input.value.replace(/\D/g, '').slice(0, 11);
    if (d.length === 0) input.value = '';
    else if (d.length <= 2) input.value = `(${d}`;
    else if (d.length <= 6) input.value = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    else if (d.length <= 10) input.value = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    else input.value = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  });
}

/* ---------- Aviso flutuante ---------- */

let temporizadorAviso;

function avisar(texto, tipo = 'sucesso') {
  const caixa = document.getElementById('aviso');
  caixa.textContent = texto;
  caixa.className = `aviso aviso-${tipo} visivel`;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => caixa.classList.remove('visivel'), 5000);
}
