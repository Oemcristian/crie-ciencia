# Tecnologias do crie.Ciência: guia completo para o TCC

Este guia explica, uma por uma, as tecnologias usadas no crie.Ciência: o que cada uma é, para que serve no projeto, onde aparece no código e como explicar na banca. Ele complementa o `EXPLICACAO-TECNICA.md`, que descreve a arquitetura e as regras do sistema.

Como usar este texto:

- Cada seção tem a mesma ordem: **o que é**, **como foi usada no projeto**, **onde está no código** e **como dizer na banca** (uma frase curta para você usar na apresentação).
- Os exemplos de código foram tirados do próprio projeto, às vezes encurtados.
- No fim há uma lista de **perguntas que a banca pode fazer** e um **glossário**.

---

## Sumário

1. Visão geral: como as peças se encaixam
2. Como a web funciona (o básico)
3. HTML5
4. CSS3
5. JavaScript
6. DOM e eventos
7. Aplicação de página única (SPA) e rotas por hash
8. localStorage e JSON
9. Modelo de dados relacional (simulado)
10. Outras APIs do navegador usadas
11. SVG
12. Google Fonts
13. Acessibilidade (WCAG e WAI-ARIA)
14. Segurança (XSS) e LGPD
15. Git, GitHub, GitHub Desktop e GitHub Pages
16. Figma
17. Ferramentas de avaliação: heurísticas de Nielsen, SEQ e SUS
18. Inteligência artificial no desenvolvimento
19. Por que não usamos framework nem servidor (ainda)
20. Perguntas prováveis da banca
21. Glossário

---

## 1. Visão geral: como as peças se encaixam

```
 Professor / avaliador
        │  abre o endereço no navegador
        ▼
 ┌────────────────────────────────────────────┐
 │ GitHub Pages (hospedagem gratuita)         │
 │ entrega os arquivos: index.html, CSS, JS   │
 └────────────────────────────────────────────┘
        │  o navegador baixa os arquivos
        ▼
 ┌────────────────────────────────────────────┐
 │ Navegador do usuário                       │
 │  HTML  → estrutura da página               │
 │  CSS   → aparência                         │
 │  JS    → comportamento e regras            │
 │  localStorage → onde os dados ficam salvos │
 └────────────────────────────────────────────┘
```

Toda a lógica roda **no navegador** de quem usa. Não existe servidor processando dados nem banco de dados na internet. O GitHub Pages apenas entrega os arquivos, como uma estante que guarda e empresta livros sem ler o que está escrito neles.

Arquivos do projeto:

| Arquivo | Tecnologia | Papel |
|---|---|---|
| `index.html` | HTML | Esqueleto: cabeçalho, menu, área das telas, rodapé |
| `css/estilo.css` | CSS | Cores, fontes, tamanhos, tema escuro, versão para celular |
| `js/dados.js` | JavaScript | Guarda e lê os dados, dados de exemplo, regras (pendências, prazos, notas) |
| `js/interface.js` | JavaScript | Peças reaproveitadas: campos, chips, validação, máscaras, avisos |
| `js/telas.js` | JavaScript | Uma função para desenhar cada tela |
| `js/app.js` | JavaScript | Decide qual tela mostrar (rotas) e liga o modo de teste |
| `img/logo.svg` | SVG | Ícone que aparece na aba do navegador |

---

## 2. Como a web funciona (o básico)

**O que é.** Quando alguém digita um endereço, o **navegador** (Chrome, Firefox, Zen, Edge) pede arquivos a um **servidor** (um computador sempre ligado na internet). O servidor devolve os arquivos e o navegador os monta na tela.

Há dois tipos de site:

- **Site estático:** o servidor só entrega arquivos prontos. Todo o processamento acontece no navegador. É o caso do crie.Ciência hoje.
- **Site dinâmico:** o servidor também executa um programa (em Node.js, Python, PHP etc.), consulta um banco de dados e monta respostas diferentes para cada usuário. É o que o crie.Ciência vai precisar quando tiver login e dados compartilhados.

**Cliente e servidor.** O navegador é o **cliente** (front-end). O computador remoto é o **servidor** (back-end). Hoje o crie.Ciência só tem front-end.

**Como dizer na banca:** "O protótipo é um site estático: todo o processamento acontece no navegador do usuário, e a hospedagem só entrega os arquivos."

---

## 3. HTML5

**O que é.** HTML (*HyperText Markup Language*, linguagem de marcação de hipertexto) é a linguagem que descreve a **estrutura** e o **significado** do conteúdo de uma página: o que é título, parágrafo, lista, formulário, botão. Não é uma linguagem de programação, porque não toma decisões nem faz cálculos; ela apenas marca o conteúdo com **etiquetas** (*tags*), como `<h1>` para título e `<p>` para parágrafo. HTML5 é a versão atual.

**HTML semântico.** Usar a etiqueta que corresponde ao significado do conteúdo, e não só à aparência. Isso ajuda leitores de tela (usados por pessoas cegas), buscadores e a própria manutenção do código.

**Como foi usado no projeto.** O `index.html` tem só a parte fixa da página. As telas são montadas pelo JavaScript dentro do `<main>`.

```html
<html lang="pt-BR">                 <!-- idioma: o leitor de tela pronuncia em português -->
<header class="topo">               <!-- cabeçalho com logo, menu e avatar -->
  <nav class="principal" aria-label="Menu principal">
    <ul class="menu">
      <li><a href="#painel">Painel</a></li>
      ...
    </ul>
  </nav>
</header>
<main id="conteudo"></main>         <!-- aqui o JavaScript desenha cada tela -->
<footer class="rodape">...</footer> <!-- rodapé com o Modo de teste -->
```

Etiquetas usadas e por quê:

| Etiqueta | Uso no crie.Ciência |
|---|---|
| `<header>`, `<nav>`, `<main>`, `<footer>` | Regiões da página. O leitor de tela permite pular direto para cada uma |
| `<h1>`, `<h2>`, `<h3>` | Títulos em níveis. Cada tela tem um único `<h1>` |
| `<form>`, `<label>`, `<input>`, `<select>`, `<textarea>` | Formulários de cadastro. Todo campo tem um `<label>` ligado a ele pelo atributo `for` |
| `<fieldset>` e `<legend>` | Agrupam opções relacionadas: integrantes da equipe, escolha da feira, cada critério da ficha de avaliação |
| `<input type="radio">` | Escolha única: a feira na inscrição e a nota de 1 a 5 na avaliação |
| `<input type="checkbox">` | Escolha múltipla: os alunos da equipe |
| `<input type="file">` | Escolha de arquivo nos documentos |
| `<table>`, `<th scope="col">` | Tabela "Minhas equipes" no painel |
| `<ul>`, `<ol>`, `<li>` | Listas de alunos, equipes, pendências. A classificação usa `<ol>` (lista numerada) porque a ordem importa |
| `<dl>`, `<dt>`, `<dd>` | Pares "rótulo: valor", como "Projeto: Fogão solar" |
| `<details>` e `<summary>` | Conteúdo que abre e fecha sem JavaScript: o Modo de teste e o "Ler o resumo do projeto" na ficha |

**Onde está no código.** `index.html` e todas as funções de `js/telas.js`, que devolvem trechos de HTML.

**Como dizer na banca:** "Usei HTML5 semântico, com regiões, títulos hierárquicos e rótulos em todos os campos, o que melhora a acessibilidade e facilita a manutenção."

---

## 4. CSS3

**O que é.** CSS (*Cascading Style Sheets*, folhas de estilo em cascata) define a **aparência**: cores, fontes, espaçamentos, bordas, posição dos elementos e adaptação ao tamanho da tela. "Cascata" quer dizer que várias regras podem valer para o mesmo elemento, e o navegador decide qual vence pela ordem e pela especificidade.

Uma regra CSS tem um **seletor** (a quem se aplica) e **declarações** (o que muda):

```css
.botao.primario {                  /* seletor: elementos com as classes botao e primario */
  background: var(--primaria);     /* declaração: cor de fundo */
  color: var(--sobre-primaria);
}
```

Recursos de CSS usados no projeto:

### 4.1 Variáveis CSS (tokens de design)

As cores do Figma viraram **variáveis** no início do arquivo. Mudando a variável, muda o sistema inteiro.

```css
:root {
  --primaria: #0F5C6E;   /* azul-petróleo */
  --destaque: #F2A93B;   /* âmbar */
  --sucesso:  #1F7A4D;
  --raio-cartao: 18px;
}
```

No design, isso se chama **tokens de design**: nomes para decisões visuais (cor primária, raio do cartão) que ligam o Figma ao código.

### 4.2 Tema escuro automático

```css
@media (prefers-color-scheme: dark) {
  :root { --fundo: #0D191D; --texto: #E4EEF0; ... }
}
```

Se o sistema operacional do usuário está no modo escuro, o navegador avisa o CSS, e as variáveis recebem outros valores. Como todo o resto usa as variáveis, a troca é automática.

### 4.3 Flexbox e Grid (layout)

- **Flexbox** organiza elementos em **uma direção** (linha ou coluna). Usado no cabeçalho, nos botões lado a lado, nos itens de lista.
- **Grid** organiza em **linhas e colunas ao mesmo tempo**. Usado nos três indicadores do painel, nas duas colunas das telas de cadastro e nos cinco botões de nota da ficha de avaliação.

```css
.escala {                                         /* botões de nota 1 a 5 */
  display: grid;
  grid-template-columns: repeat(5, minmax(44px, 1fr));  /* 5 colunas iguais, no mínimo 44px */
  gap: 8px;
}
```

### 4.4 Design responsivo (media queries)

O mesmo site se adapta a computador, tablet e celular. As **media queries** aplicam regras só abaixo de certa largura:

```css
@media (max-width: 720px) {
  .indicadores { grid-template-columns: 1fr; }   /* indicadores um embaixo do outro */
  .tabela thead { display: none; }               /* tabela vira lista de cartões */
}
```

Pontos de quebra usados: 1100px, 960px e 720px. Foi testado em 375px de largura (tamanho de um celular comum) sem rolagem horizontal.

### 4.5 Outros recursos

| Recurso | Para que serve no projeto |
|---|---|
| `:focus-visible` | Contorno âmbar bem visível em quem navega por teclado |
| `:has()` | Destacar o cartão da feira ou o aluno marcado: `.opcao:has(input:checked)` |
| `prefers-reduced-motion` | Desliga a animação do aviso para quem configurou o sistema para reduzir movimento |
| `accent-color` | Pinta caixas de seleção e botões de rádio com a cor primária |
| Classe `.sr` | Esconde um texto da tela, mas deixa para o leitor de tela (ex.: "1º lugar") |

**Onde está no código.** `css/estilo.css`, organizado em blocos comentados (Base, Cabeçalho, Cartões, Botões, Formulários, Chips, Tabela, Pendências, Documentos, Avaliação, Telas menores).

**Como dizer na banca:** "As cores do Figma viraram variáveis CSS. Com Flexbox, Grid e media queries, a mesma interface funciona no computador da escola e no celular, com tema escuro automático."

---

## 5. JavaScript

**O que é.** JavaScript é a **linguagem de programação** que roda dentro do navegador. Com ela a página toma decisões, faz contas, reage a cliques e guarda dados. O nome oficial do padrão é **ECMAScript**. O projeto usa recursos da versão **ES6 (2015)** em diante, suportados por todos os navegadores atuais.

No crie.Ciência, o JavaScript faz tudo o que não é estrutura nem aparência: troca de telas, validação dos formulários, cálculo das pendências, soma das notas e classificação, gravação dos dados.

### 5.1 Recursos da linguagem usados

| Recurso | Exemplo no projeto | Explicação simples |
|---|---|---|
| `const` e `let` | `const LIMITES = {...}`, `let db = carregar()` | `const` não pode ser trocada; `let` pode |
| Funções e *arrow functions* | `alunos.filter(a => !equipeDoAluno(a.id))` | `=>` é um jeito curto de escrever uma função |
| *Template literals* | `` `Olá, ${nome}` `` | Texto com crases que aceita valores dentro de `${ }`. É assim que as telas montam o HTML |
| Objetos e listas (arrays) | `{ id, nome, alunoIds: [] }` | Estruturas que guardam os dados |
| Métodos de lista | `map`, `filter`, `find`, `some`, `reduce`, `sort` | Transformar, filtrar, procurar, testar, somar e ordenar listas |
| Desestruturação | `const { nome, param } = lerRota()` | Tira campos de um objeto direto para variáveis |
| Espalhamento (*spread*) | `{ id: novoId('av'), ...dados }` | Copia todos os campos de um objeto para outro |
| Encadeamento opcional `?.` | `db.professor?.nome` | Se `professor` não existir, devolve vazio em vez de dar erro |
| `Object.assign` | `Object.assign(bancoVazio(), salvo)` | Junta objetos; usado para aceitar dados antigos sem campos novos |
| `Object.fromEntries` | notas da ficha de avaliação | Monta um objeto a partir de uma lista de pares |

Exemplo real, a soma de uma ficha de avaliação (`js/dados.js`):

```js
function pontuacao(avaliacao) {
  return CRITERIOS_AVALIACAO.reduce(
    (soma, c) => soma + (Number(avaliacao.notas[c.id]) || 0), 0);
}
```

Em português: "comece em 0 e, para cada critério, some a nota que o avaliador deu".

### 5.2 Scripts clássicos, carregados em ordem

No fim do `index.html`:

```html
<script src="js/dados.js"></script>
<script src="js/interface.js"></script>
<script src="js/telas.js"></script>
<script src="js/app.js"></script>
```

A ordem importa: `telas.js` usa funções de `dados.js` e `interface.js`, e o `app.js` dá a partida no fim. Foram usados scripts clássicos (e não **módulos ES**, com `import` e `export`) porque assim o sistema abre até com dois cliques no arquivo, sem servidor.

### 5.3 Organização em funções com nomes em português

Cada função faz uma coisa e tem nome que diz o quê: `calcularPendencias()`, `alunosSemEquipe()`, `mediaDaInscricao()`, `telaAvaliacao()`. Isso aplica o princípio de **separação de responsabilidades**: dados e regras (`dados.js`), peças de interface (`interface.js`), telas (`telas.js`) e controle geral (`app.js`).

**Como dizer na banca:** "O JavaScript está dividido por responsabilidade. As regras ficam em `dados.js`, separadas das telas. Na próxima etapa, só esse arquivo precisa passar a conversar com um servidor."

---

## 6. DOM e eventos

**O que é o DOM.** DOM (*Document Object Model*) é a representação da página que o navegador cria na memória, como uma árvore de objetos. O JavaScript lê e altera essa árvore, e a tela muda na hora.

```js
const area = document.getElementById('conteudo');   // pega o <main>
area.innerHTML = `<h1>Painel</h1> ...`;             // troca o conteúdo
```

**O que são eventos.** Avisos que o navegador dá quando algo acontece: um clique, uma tecla, o envio de um formulário. O código "escuta" o evento com `addEventListener` e executa uma função.

Eventos usados no projeto:

| Evento | Quando acontece | Uso |
|---|---|---|
| `submit` | O formulário é enviado (botão ou Enter) | Validar e salvar cadastros, resumo e ficha de avaliação |
| `input` | Cada letra digitada | Máscaras de data e telefone, contador de palavras do resumo |
| `change` | Uma opção é marcada ou escolhida | Contador de integrantes, soma das notas, troca de equipe ou feira |
| `click` | Um botão é clicado | Excluir, remover documento, botões do Modo de teste |
| `hashchange` | A parte depois do `#` no endereço muda | Trocar de tela |
| `dragover`, `drop` | Um arquivo é arrastado e solto | Envio de documentos por arrastar e soltar |

`evento.preventDefault()` impede o comportamento padrão do navegador. No `submit`, por exemplo, evita que a página recarregue e perca o que foi digitado.

**Como dizer na banca:** "Cada tela monta seu HTML e liga os eventos. Ao enviar um formulário, o código valida, salva e redesenha a tela, sem recarregar a página."

---

## 7. Aplicação de página única (SPA) e rotas por hash

**O que é.** Uma **SPA** (*Single Page Application*) tem um único arquivo HTML. Em vez de abrir outra página a cada clique, o JavaScript troca só o conteúdo da área principal. A sensação é de um aplicativo: rápido e sem piscar.

**Rotas por hash.** A tela atual é indicada pelo que vem depois do `#` no endereço:

```
index.html#painel
index.html#alunos/al-ana            (edição da aluna Ana)
index.html#avaliacao/feira-municipal
index.html#avaliar/in-solar/av-1    (editar a ficha av-1 do projeto inscrito in-solar)
```

Como funciona (`js/app.js`):

1. O usuário clica em um link como `<a href="#pendencias">`.
2. O endereço muda e o navegador dispara o evento `hashchange`.
3. A função `lerRota()` separa o nome da tela e os parâmetros.
4. A tabela `ROTAS` diz qual função desenha aquela tela.
5. A função da tela monta o HTML dentro do `<main>`.

```js
const ROTAS = {
  painel:    { titulo: 'Painel',             desenhar: telaPainel,    menu: 'painel' },
  avaliacao: { titulo: 'Avaliação na feira', desenhar: telaAvaliacao, menu: 'avaliacao' },
  ...
};
```

Por que hash e não endereços "limpos" (`/painel`): funciona sem configurar servidor, funciona abrindo o arquivo direto, os botões Voltar e Avançar do navegador funcionam e cada tela pode ser aberta por link.

Ao trocar de tela, o foco do teclado vai para o título `<h1>`, para quem usa leitor de tela perceber que o conteúdo mudou.

**Como dizer na banca:** "É uma aplicação de página única com roteamento por hash. Cada tela tem endereço próprio, o que permite levar o professor direto ao ponto, como o botão de cada pendência que abre a tela certa já com a equipe escolhida."

---

## 8. localStorage e JSON

### 8.1 localStorage

**O que é.** Um pequeno espaço de armazenamento que todo navegador oferece para cada site. Guarda texto no formato **chave → valor**, e os dados continuam lá mesmo depois de fechar o navegador.

```js
localStorage.setItem('crieciencia.dados.v1', texto);   // gravar
localStorage.getItem('crieciencia.dados.v1');          // ler
```

O `.v1` no nome da chave indica a versão do formato dos dados. Se um dia o formato mudar muito, uma chave `v2` evita confusão com dados antigos.

**Limitações (importante citar no TCC):**

- os dados ficam **só naquele navegador, naquele computador**. Outro aparelho não vê;
- limpar os dados de navegação ou usar janela anônima apaga tudo;
- o espaço é de alguns megabytes, suficiente para o protótipo, mas não para guardar arquivos;
- não há senha: quem usar o mesmo computador vê os dados.

Por isso o protótipo usa só dados fictícios, e os documentos guardam apenas o nome e o tamanho do arquivo.

### 8.2 JSON

**O que é.** JSON (*JavaScript Object Notation*) é um formato de texto para representar dados estruturados. É o formato mais usado na web para trocar dados entre sistemas.

```json
{
  "id": "eq-solar",
  "nome": "Solar",
  "alunoIds": ["al-ana", "al-bruno", "al-carla"]
}
```

Como o localStorage só guarda texto, o objeto com todos os dados é convertido:

- `JSON.stringify(db)` transforma o objeto em texto para gravar;
- `JSON.parse(texto)` transforma o texto de volta em objeto ao abrir o sistema.

O mesmo JSON é o que o **Modo de teste** exporta ao final de cada sessão de usabilidade.

### 8.3 Compatibilidade com dados antigos

```js
return Object.assign(bancoVazio(), JSON.parse(texto));
```

`bancoVazio()` traz todos os campos atuais (inclusive os novos, como `avaliacoes`). Os dados salvos são copiados por cima. Assim, quem já usava o protótipo antes da tela de avaliação não perde nada e o sistema não quebra.

**Como dizer na banca:** "Nesta fase os dados ficam no localStorage, em JSON. É uma limitação consciente: o objetivo era validar a usabilidade. A estrutura dos dados já foi pensada para virar tabelas de um banco relacional."

---

## 9. Modelo de dados relacional (simulado)

**O que é um banco relacional.** Um banco de dados que guarda informações em **tabelas** ligadas entre si por **identificadores**. Exemplos: PostgreSQL, MySQL, SQLite.

- **Chave primária**: o identificador único de cada registro (ex.: `id: 'eq-solar'`).
- **Chave estrangeira**: um campo que aponta para o registro de outra tabela (ex.: o projeto guarda `equipeId`).

O crie.Ciência ainda não tem banco, mas os dados foram organizados **como se tivesse**, seguindo o pedido da orientadora de cadastrar na ordem das relações, para cada dado ser digitado uma vez só:

```
Professor → Aluno → Equipe → Projeto → Inscrição → Resumo
                                          ├─────→ Documentos (da equipe)
                                          └─────→ Avaliações (fichas do dia da feira)
```

```
professor   { nome, email, telefone, escola, disciplina }
aluno       { id, nome, nascimento, serie, escola, responsavel, contato }
equipe      { id, nome, alunoIds[] }
projeto     { id, titulo, area, palavrasChave, equipeId }
feira       { id, nome, local, dias, prazoInscricao, prazoResumo, prazoDocumentos, data }
inscricao   { id, feiraId, equipeId, projetoId, data }
resumo      { projetoId, texto, palavrasChave, enviado, data }
documento   { equipeId, tipo, arquivoNome, tamanho, data }
avaliacao   { id, inscricaoId, avaliador, notas{criterio: 1..5}, comentario, data }
```

Por que a avaliação liga à **inscrição** e não ao projeto: o mesmo projeto pode participar de duas feiras e receber notas diferentes em cada uma.

Exemplo de como isso viraria SQL na próxima etapa:

```sql
CREATE TABLE equipe (
  id    SERIAL PRIMARY KEY,
  nome  VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE projeto (
  id        SERIAL PRIMARY KEY,
  titulo    VARCHAR(200) NOT NULL,
  equipe_id INTEGER NOT NULL UNIQUE REFERENCES equipe(id)  -- 1 projeto por equipe
);

CREATE TABLE avaliacao (
  id           SERIAL PRIMARY KEY,
  inscricao_id INTEGER NOT NULL REFERENCES inscricao(id),
  avaliador    VARCHAR(120) NOT NULL,
  criatividade SMALLINT CHECK (criatividade BETWEEN 1 AND 5),
  ...
  UNIQUE (inscricao_id, avaliador)   -- 1 ficha por avaliador em cada projeto
);
```

Note como as regras que hoje estão no JavaScript (nome de equipe único, um projeto por equipe, uma ficha por avaliador) viram **restrições** do banco (`UNIQUE`, `REFERENCES`, `CHECK`).

**Como dizer na banca:** "O modelo foi pensado como relacional desde o protótipo. As ligações são por identificadores, e as regras de integridade já estão implementadas, o que facilita a migração para PostgreSQL ou SQLite."

---

## 10. Outras APIs do navegador usadas

API (*Application Programming Interface*) é um conjunto de funções prontas que o navegador oferece ao JavaScript.

| API | O que faz | Onde é usada |
|---|---|---|
| **File API** | Dá acesso ao nome, tamanho e tipo do arquivo que o usuário escolheu | Validar PDF/JPG/PNG de até 5 MB nos documentos |
| **Drag and Drop** | Permite arrastar e soltar | Zona "Arraste o arquivo aqui" |
| **Blob** e `URL.createObjectURL` | Cria um arquivo na memória e um link temporário para baixá-lo | "Baixar dados (JSON)" no Modo de teste |
| **Clipboard API** (`navigator.clipboard`) | Copia texto para a área de transferência | "Copiar dados (JSON)", com plano B para navegadores que bloqueiam |
| **Date** | Datas e horas | Prazos, idade dos alunos, data das fichas, registro de navegação |
| `String.normalize('NFD')` | Separa letras de acentos | Comparar nomes sem diferenciar acento e maiúscula ("Maré" = "mare") |
| `localeCompare(..., 'pt-BR')` | Ordenação alfabética correta em português | Listas de alunos e projetos |
| `confirm()` | Caixa de confirmação nativa | Antes de excluir qualquer coisa |

---

## 11. SVG

**O que é.** SVG (*Scalable Vector Graphics*) é um formato de imagem **vetorial** escrito em texto. Em vez de pixels, descreve formas (círculo, elipse, retângulo). Por isso fica nítido em qualquer tamanho e ocupa poucos bytes.

O logo do crie.Ciência é um SVG: um quadrado arredondado azul-petróleo, um anel branco e uma elipse âmbar inclinada, lembrando um átomo.

```html
<svg viewBox="0 0 40 40">
  <rect width="40" height="40" rx="11" fill="#0F5C6E"/>
  <circle cx="20" cy="20" r="9" fill="none" stroke="#FFFFFF" stroke-width="3.5"/>
  <ellipse cx="20" cy="20" rx="15" ry="5.5" fill="none" stroke="#F2A93B"
           stroke-width="2.5" transform="rotate(-28 20 20)"/>
</svg>
```

Ele aparece embutido no `index.html` (cabeçalho) e como arquivo em `img/logo.svg` (ícone da aba, chamado *favicon*).

---

## 12. Google Fonts

**O que é.** Serviço gratuito do Google que hospeda fontes para sites. O projeto usa a **Plus Jakarta Sans** (pesos 400 a 800), escolhida no design por ser legível e moderna.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
```

- `preconnect` adianta a conexão com o servidor da fonte, para carregar mais rápido.
- `display=swap` mostra o texto com a fonte do sistema enquanto a Plus Jakarta Sans carrega, para a página nunca ficar em branco.
- Se não houver internet, o CSS define fontes de reserva: `system-ui, 'Segoe UI', Roboto, sans-serif`.

É a **única dependência externa** do projeto.

---

## 13. Acessibilidade (WCAG e WAI-ARIA)

**WCAG** (*Web Content Accessibility Guidelines*) são as diretrizes internacionais de acessibilidade na web, do W3C. O nível **AA** é o mais usado como meta. No Brasil, a Lei Brasileira de Inclusão (Lei 13.146/2015) exige acessibilidade em sites, e o eMAG, modelo de acessibilidade do governo federal, se baseia na WCAG.

**WAI-ARIA** é um conjunto de atributos HTML (`aria-*`) que dá informações extras aos leitores de tela.

O que foi aplicado:

| Prática | Como está no código |
|---|---|
| Contraste mínimo AA | Cores escolhidas e conferidas para texto sobre fundo |
| Foco visível | Contorno âmbar de 3px em `:focus-visible` |
| Alvos de toque de 44px ou mais | Botões, campos, itens de menu e botões de nota |
| Rótulo em todo campo | `<label for="...">` |
| Ajuda e erro ligados ao campo | `aria-describedby="campo-ajuda campo-erro"` |
| Campo com erro anunciado | `aria-invalid="true"` |
| Mensagens lidas automaticamente | `aria-live="polite"` nos erros, contadores, total da ficha e avisos |
| Página atual no menu e etapa atual | `aria-current="page"` e `aria-current="step"` |
| Informação que não depende só de cor | Chips sempre com texto e ponto (cheio = concluído, vazado = pendente) |
| Pular para o conteúdo | Link escondido que aparece ao apertar Tab |
| Notas da avaliação pelo teclado | Os botões de 1 a 5 são `radio` de verdade, escondidos visualmente: as setas do teclado trocam a nota |

**Como dizer na banca:** "Segui a WCAG nível AA como referência: contraste, foco visível, alvos de 44px, rótulos, mensagens com `aria-live` e informação que não depende só de cor. Ainda falta uma revisão com usuários de leitor de tela."

---

## 14. Segurança (XSS) e LGPD

### 14.1 XSS

**O que é.** XSS (*Cross-Site Scripting*) é um ataque em que alguém digita código num campo (por exemplo, `<script>...</script>` no nome do aluno) e esse código é executado quando a página mostra o texto.

**Como foi evitado.** Todo texto digitado passa pela função `esc()` antes de ir para a tela:

```js
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
```

Ela troca `<` por `&lt;` e assim por diante. O navegador mostra o símbolo, mas não o executa.

### 14.2 LGPD

A **Lei Geral de Proteção de Dados** (Lei 13.709/2018) regula o uso de dados pessoais. O art. 14 trata de dados de **crianças e adolescentes**, que exigem cuidado especial e, para crianças, consentimento de um dos pais ou responsável.

Como os alunos são menores, o protótipo usa **somente dados fictícios**. Antes de usar dados reais será preciso: servidor com login, política de privacidade, termo de consentimento, tempo de guarda dos dados e definição de quem acessa o quê.

---

## 15. Git, GitHub, GitHub Desktop e GitHub Pages

### 15.1 Git

**O que é.** Um **sistema de controle de versão**: guarda o histórico de todas as mudanças do código. Cada "foto" do projeto se chama **commit** e tem uma mensagem dizendo o que mudou. Dá para ver quem mudou o quê, quando e voltar a uma versão anterior.

Termos:

- **Repositório:** a pasta do projeto com todo o histórico.
- **Commit:** um registro de mudanças com mensagem (ex.: "Adiciona tela de avaliação na feira").
- **Branch (ramo):** uma linha de desenvolvimento. O projeto usa a `main`.
- **Push:** enviar os commits do computador para o GitHub.

### 15.2 GitHub

Site que hospeda repositórios Git na internet. O do projeto é público: `github.com/Oemcristian/crie-ciencia`. Serve como cópia de segurança, histórico e vitrine do código para a banca.

### 15.3 GitHub Desktop

Programa com interface gráfica para usar o Git sem digitar comandos. O fluxo usado no projeto:

1. Alterar os arquivos na pasta do repositório.
2. No GitHub Desktop, conferir as mudanças, escrever o resumo (*Summary*) e clicar em **Commit to main**.
3. Clicar em **Push origin** para enviar ao GitHub.

### 15.4 GitHub Pages

Serviço gratuito do GitHub que publica um repositório com arquivos HTML, CSS e JavaScript como site. A cada *push*, o site é atualizado sozinho em 1 a 3 minutos. Endereço: `https://oemcristian.github.io/crie-ciencia/`. Isso se chama **implantação contínua** (*continuous deployment*), de forma simplificada.

**Como dizer na banca:** "O código é versionado com Git e hospedado no GitHub. Cada mudança vira um commit com mensagem clara, e o GitHub Pages publica o site automaticamente, sem custo."

---

## 16. Figma

**O que é.** Ferramenta on-line de design de interfaces. Nela foi feito o **protótipo de alta fidelidade** (com cores, fontes e componentes finais), antes de programar.

Como foi usado:

- página **Componentes**: botões, campos, chips, cartões;
- página **Telas**: o desenho de cada tela;
- coleção de **variáveis "Cores"**: as mesmas cores que viraram variáveis CSS (seção 4.1).

Essa ligação entre as variáveis do Figma e as do CSS garante que o sistema programado fique fiel ao desenho.

---

## 17. Ferramentas de avaliação: heurísticas de Nielsen, SEQ e SUS

Não são tecnologias de programação, mas a banca costuma perguntar.

### 17.1 Heurísticas de Nielsen

Dez princípios gerais de usabilidade propostos por Jakob Nielsen (1994). Exemplos aplicados no crie.Ciência:

| Heurística | Exemplo no sistema |
|---|---|
| Visibilidade do estado do sistema | Trilha de etapas, chips de situação, contador de palavras, total da ficha ao vivo |
| Correspondência com o mundo real | Linguagem do professor: "equipe", "resumo", "ficha de avaliação" |
| Controle e liberdade do usuário | Cancelar, editar, reenviar resumo, editar ficha |
| Consistência e padrões | Mesmos botões, cores e chips em todas as telas |
| Prevenção de erros | Listas filtradas, máscaras, bloqueio de inscrição e ficha repetidas |
| Reconhecimento em vez de memorização | Escolher alunos e equipes em listas; nome do avaliador já preenchido |
| Ajuda a reconhecer e corrigir erros | Mensagem junto do campo dizendo o que fazer |

A gravidade dos problemas encontrados nos testes é classificada de 0 (não é problema) a 4 (catástrofe), também segundo Nielsen.

### 17.2 SEQ (*Single Ease Question*)

Uma pergunta feita logo após cada tarefa: "No geral, quão fácil ou difícil foi esta tarefa?", com resposta de 1 (muito difícil) a 7 (muito fácil). É rápida e permite comparar as tarefas entre si.

### 17.3 SUS (*System Usability Scale*)

Questionário de 10 afirmações (Brooke, 1996), respondido ao final, cada uma de 1 (discordo totalmente) a 5 (concordo totalmente). Como calcular:

1. Itens **ímpares** (1, 3, 5, 7, 9): nota menos 1.
2. Itens **pares** (2, 4, 6, 8, 10): 5 menos a nota.
3. Some os 10 resultados e multiplique por **2,5**. O resultado vai de 0 a 100.

A média de referência é **68**. Acima disso, a usabilidade é considerada acima da média.

### 17.4 Registro de navegação

O próprio protótipo registra, com data e hora, cada tela aberta e cada ação (`db.registro`). Exportado em JSON ao fim da sessão, ele ajuda a medir o tempo por tarefa e a ver caminhos errados.

---

## 18. Inteligência artificial no desenvolvimento

O desenvolvimento contou com o apoio de uma ferramenta de IA generativa (**Claude**, da Anthropic), usada como assistente de programação e documentação. As normas acadêmicas pedem que isso seja **declarado**. Há uma sugestão de texto na seção 13 do `EXPLICACAO-TECNICA.md`.

O ponto importante para a banca: as decisões de requisitos, fluxo, regras e avaliação foram suas e da orientadora, e você precisa entender e saber explicar o código. Este guia existe para isso.

---

## 19. Por que não usamos framework nem servidor (ainda)

**Framework** é uma estrutura pronta que organiza o código de um jeito próprio (ex.: React, Angular, Vue). **Back-end** é a parte que roda no servidor.

Motivos para não usar agora:

1. **Fase da pesquisa.** O objetivo era validar a usabilidade com professores. Para isso, um protótipo navegável basta.
2. **Zero instalação.** Abre com dois cliques ou por um link, inclusive em computador de escola com restrições.
3. **Custo zero.** GitHub Pages é gratuito e não exige manutenção de servidor.
4. **Código explicável.** Sem camadas escondidas: cada linha pode ser lida e explicada.
5. **Preparado para crescer.** As regras estão separadas das telas (`dados.js`), e o modelo de dados já é relacional.

O que vem depois, conforme o cronograma (a escolha exata ainda será decidida com a orientadora): uma **API** no servidor (Node.js ou Python), um **banco relacional** (PostgreSQL ou SQLite), **login** do professor, **upload real** de documentos, avisos por e-mail, relatórios em PDF e perfis de organizador e avaliador.

---

## 20. Perguntas prováveis da banca

**1. Por que não usou React ou outro framework?**
Porque o objetivo desta fase era testar a usabilidade. HTML, CSS e JavaScript puros dispensam instalação e compilação, o site abre em qualquer computador e o código é mais simples de explicar. A organização em arquivos separados por responsabilidade permite migrar depois, se for necessário.

**2. Onde ficam os dados? Eles são seguros?**
No localStorage do navegador de quem usa. Não vão para a internet. Por isso o protótipo usa só dados fictícios. Para dados reais será necessário servidor com login e as medidas da LGPD.

**3. Dois professores veem os mesmos dados?**
Não. Cada navegador tem os próprios dados. Compartilhar dados exige servidor e banco, previstos para a próxima etapa.

**4. Como as pendências são calculadas?**
Não são digitadas. A função `calcularPendencias()` percorre as equipes e verifica, nesta ordem: tem projeto? está inscrito? enviou o resumo? enviou cada um dos três documentos? Cada item que falta vira uma pendência com prazo e link para a tela que resolve.

**5. Como funciona a avaliação no dia da feira?**
Cada avaliador abre a ficha do projeto, dá uma nota de 1 a 5 em cinco critérios (criatividade, método científico, domínio do conteúdo, apresentação e relevância) e pode deixar um comentário. A pontuação da ficha é a soma, de 5 a 25. A classificação usa a média das fichas de cada projeto, e no empate fica na frente quem recebeu mais fichas. O sistema impede que o mesmo avaliador preencha duas fichas para o mesmo projeto.

**6. Por que a nota é de 1 a 5 e não de 0 a 10?**
Escalas curtas com descrição em palavras (Insuficiente a Excelente) são mais rápidas de usar em pé, no celular, e geram menos divergência entre avaliadores. Cinco botões grandes também são mais fáceis de tocar do que digitar um número.

**7. O que é SPA e por que hash (#)?**
Aplicação de página única: um só HTML, e o JavaScript troca o conteúdo. O hash permite navegar sem servidor, mantém o botão Voltar funcionando e dá a cada tela um endereço próprio.

**8. Como você evitou que o mesmo dado fosse digitado duas vezes?**
Cadastro na ordem das relações (aluno, equipe, projeto, inscrição): cada etapa escolhe dados já cadastrados em listas. A escola do professor aparece preenchida no aluno, as palavras-chave do projeto vêm para o resumo e o nome do avaliador fica guardado para as próximas fichas.

**9. Como o sistema evita erros do usuário?**
Listas filtradas (só alunos sem equipe, só equipes sem projeto), máscaras de data e telefone, validação com mensagem junto ao campo, confirmação antes de excluir e bloqueio de exclusões que quebrariam relações (ex.: não cancela inscrição já avaliada).

**10. Como funciona no celular?**
Com CSS responsivo: abaixo de 720px o menu ocupa a largura toda, os indicadores ficam um embaixo do outro e a tabela vira uma lista de cartões. Foi testado em 375px.

**11. Como você garantiu acessibilidade?**
WCAG AA como referência: contraste, foco visível, alvos de 44px, rótulos, `aria-live` nas mensagens, chips com texto além da cor e navegação por teclado.

**12. Como foi a hospedagem?**
GitHub Pages, gratuito. Cada *push* no GitHub atualiza o site automaticamente.

**13. Quais são as limitações?**
Dados só no navegador, sem login, documentos sem envio real, feiras fixas, sem relatórios e sem perfis de organizador e avaliador separados. Todas estão previstas no cronograma.

**14. Você usou IA?**
Sim, como assistente de programação e documentação, e isso está declarado no trabalho. As decisões de projeto foram minhas e da orientadora, e revisei e testei o código.

---

## 21. Glossário

| Termo | Significado |
|---|---|
| API | Conjunto de funções prontas que um sistema oferece a outro |
| Back-end | Parte do sistema que roda no servidor |
| Banco relacional | Banco de dados organizado em tabelas ligadas por identificadores |
| Branch | Linha de desenvolvimento no Git |
| Chave estrangeira | Campo que aponta para um registro de outra tabela |
| Chave primária | Identificador único de um registro |
| Commit | Registro de um conjunto de mudanças no Git, com mensagem |
| CSS | Linguagem que define a aparência da página |
| Deploy (implantação) | Publicar uma nova versão do sistema |
| DOM | Representação da página na memória, que o JavaScript altera |
| Evento | Aviso do navegador de que algo aconteceu (clique, digitação) |
| Framework | Estrutura pronta que organiza o código de um jeito próprio |
| Front-end | Parte do sistema que roda no navegador |
| Hash | Parte do endereço depois do `#` |
| HTML | Linguagem que estrutura o conteúdo da página |
| JavaScript | Linguagem de programação que roda no navegador |
| JSON | Formato de texto para representar dados |
| localStorage | Armazenamento de dados do navegador, por site |
| Media query | Regra CSS que vale só para certos tamanhos de tela |
| Protótipo de alta fidelidade | Desenho com aparência final, antes da programação |
| Push | Enviar commits do computador para o GitHub |
| Repositório | Pasta do projeto com todo o histórico de versões |
| Responsivo | Que se adapta a diferentes tamanhos de tela |
| Site estático | Site cujo servidor só entrega arquivos prontos |
| SPA | Aplicação de página única |
| SVG | Imagem vetorial descrita em texto |
| Token de design | Nome dado a uma decisão visual (cor, raio) compartilhada entre design e código |
| WAI-ARIA | Atributos que dão informações extras a leitores de tela |
| WCAG | Diretrizes internacionais de acessibilidade na web |
| XSS | Ataque que injeta código pela digitação de texto |

---

## Referências para citar

- BROOKE, J. SUS: a "quick and dirty" usability scale. In: JORDAN, P. W. et al. (ed.). *Usability evaluation in industry*. London: Taylor & Francis, 1996. p. 189-194.
- BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD).
- BRASIL. Lei nº 13.146, de 6 de julho de 2015. Lei Brasileira de Inclusão da Pessoa com Deficiência.
- MDN WEB DOCS. *Documentação de HTML, CSS e JavaScript*. Mozilla. Disponível em: https://developer.mozilla.org/pt-BR/.
- NIELSEN, J. Heuristic evaluation. In: NIELSEN, J.; MACK, R. L. (ed.). *Usability inspection methods*. New York: John Wiley & Sons, 1994. (heurísticas e escala de gravidade)
- SAURO, J.; DUMAS, J. S. Comparison of three one-question, post-task usability questionnaires. In: *CHI 2009*. New York: ACM, 2009. p. 1599-1608. (origem do SEQ)
- W3C. *Web Content Accessibility Guidelines (WCAG) 2.2*. 2023. Disponível em: https://www.w3.org/TR/WCAG22/.

Confira cada referência no formato exigido pela UFERSA (ABNT) antes de usar.
