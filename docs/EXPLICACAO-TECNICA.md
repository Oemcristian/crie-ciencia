# crie.Ciência: explicação técnica do protótipo

Este texto descreve como o protótipo foi construído. Ele pode ser adaptado para a seção de desenvolvimento ou metodologia do TCC.

---

## 1. Tecnologias escolhidas

O protótipo foi desenvolvido apenas com as três tecnologias básicas da web:

- **HTML5**, que define a estrutura da página;
- **CSS3**, que define a aparência (cores, fontes, espaçamentos e adaptação a telas pequenas);
- **JavaScript** (padrão ES6 ou mais recente), que controla o comportamento: troca de telas, validação de formulários, cálculo de pendências e gravação dos dados.

Não foram usados frameworks (React, Angular, Vue), bibliotecas externas nem ferramentas de compilação. A única dependência externa é a fonte Plus Jakarta Sans, carregada do Google Fonts. Se ela não carregar, o navegador usa a fonte padrão do sistema.

Motivos da escolha:

1. **Nenhuma instalação.** O sistema abre com dois cliques no `index.html` ou por um endereço na internet. Isso facilita os testes com professores em computadores de escola.
2. **Hospedagem gratuita e simples.** Por ser um site estático (só arquivos, sem servidor), pode ser publicado no GitHub Pages sem custo.
3. **Código explicável.** Cada parte do sistema pode ser lida e entendida sem conhecer um framework específico.
4. **Adequação à fase da pesquisa.** O objetivo atual é validar a usabilidade. Servidor, banco de dados e login ficam para as próximas etapas do cronograma.

## 2. Organização dos arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura fixa: cabeçalho com logo e menu, área principal (`<main>`) onde as telas são desenhadas, rodapé com o modo de teste |
| `css/estilo.css` | Variáveis de cor (tokens do design), componentes visuais (botões, campos, chips, cartões, tabela), tema escuro e adaptação para celular |
| `js/dados.js` | Leitura e gravação no navegador, dados de exemplo, consultas entre entidades, cálculo de pendências e funções de data |
| `js/interface.js` | Funções reaproveitadas pelas telas: montar campos, chips, validação, máscaras de data e telefone, aviso flutuante |
| `js/telas.js` | Uma função para cada tela (`telaPainel`, `telaAlunos`, `telaEquipes` etc.) |
| `js/app.js` | Roteamento (qual tela mostrar), destaque do menu, modo de teste e inicialização |

A divisão segue a ideia de **separação de responsabilidades**: dados e regras de negócio ficam separados da forma como são exibidos. Isso facilita a próxima etapa, em que `dados.js` será trocado por chamadas a um servidor sem precisar reescrever as telas.

Os arquivos JavaScript são carregados em ordem no final do `index.html`: primeiro os dados, depois as funções de interface, as telas e, por último, o `app.js`, que dá a partida.

## 3. Funcionamento geral (aplicação de página única)

O sistema é uma **aplicação de página única** (SPA, *single page application*): existe apenas um arquivo HTML, e o conteúdo da área principal é trocado pelo JavaScript conforme o usuário navega.

A tela atual é indicada pela parte do endereço depois do `#`, por exemplo:

```
index.html#painel
index.html#alunos
index.html#resumo/pr-solar     (tela de resumo já com o projeto escolhido)
```

Quando o endereço muda, o navegador dispara o evento `hashchange`. O `app.js` escuta esse evento, lê o nome da rota e chama a função da tela correspondente:

```
Usuário clica em "Pendências"
   -> endereço muda para #pendencias
   -> evento hashchange
   -> app.js consulta a tabela ROTAS
   -> chama telaPendencias()
   -> a tela lê os dados, monta o HTML e liga os botões
```

Esse modo de navegação foi escolhido porque funciona mesmo abrindo o arquivo direto do computador, permite usar os botões Voltar e Avançar do navegador e cada tela tem um endereço próprio, que pode ser aberto diretamente.

Ao trocar de tela, o foco do teclado é levado ao título da página. Isso ajuda quem navega por teclado ou usa leitor de tela a perceber que o conteúdo mudou.

## 4. Armazenamento dos dados

Nesta fase os dados são guardados no **localStorage**, um espaço de armazenamento que todo navegador oferece para cada site. Todos os dados ficam em um único objeto JavaScript, convertido para texto no formato JSON e salvo com a chave `crieciencia.dados.v1`.

- `carregar()` lê esse texto ao abrir o sistema. Se não existir nada salvo (primeiro acesso), carrega os dados de exemplo.
- `salvar()` grava o objeto inteiro sempre que algo é cadastrado, alterado ou excluído.

Limitações conhecidas, que devem constar no trabalho:

- os dados ficam **somente no navegador e no computador** em que foram digitados; outro computador ou outro navegador não os enxerga;
- limpar os dados de navegação ou usar janela anônima apaga as informações;
- o limite é de alguns megabytes, suficiente para o protótipo;
- nos documentos, o protótipo guarda apenas o **nome e o tamanho** do arquivo, não o conteúdo. O envio real faz parte da etapa de automatização de documentos.

## 5. Modelo de dados

Os cadastros seguem a ordem das relações pedida pela orientação, para que cada informação seja digitada uma única vez:

**Professor → Aluno → Equipe → Projeto → Inscrição → Resumo**, além de Documentos.

```
professor   { nome, email, telefone, escola, disciplina }
aluno       { id, nome, nascimento, serie, escola, responsavel, contato }
equipe      { id, nome, alunoIds[] }
projeto     { id, titulo, area, palavrasChave, equipeId }
feira       { id, nome, local, dias, prazoInscricao, prazoResumo, prazoDocumentos, data }
inscricao   { id, feiraId, equipeId, projetoId, data }
resumo      { projetoId, texto, palavrasChave, enviado, data }
documento   { equipeId, tipo, arquivoNome, tamanho, data }
```

As ligações são feitas por identificadores, como em um banco relacional. Por exemplo, o projeto guarda `equipeId`, e a equipe guarda a lista `alunoIds`. Essa estrutura pode ser convertida quase diretamente em tabelas de um banco como PostgreSQL ou SQLite na próxima etapa.

Regras de integridade aplicadas pelo sistema:

| Regra | Onde é garantida |
|---|---|
| Um aluno participa de no máximo uma equipe | Na tela de equipe só aparecem alunos sem equipe |
| A equipe tem de 2 a 5 integrantes | Validação ao salvar a equipe |
| O nome da equipe não se repete (sem diferenciar maiúsculas e acentos) | Validação ao salvar a equipe |
| Cada equipe tem um único projeto | Na tela de projeto só aparecem equipes sem projeto |
| Só se inscreve equipe que já tem projeto | Na inscrição só aparecem equipes com projeto |
| Uma equipe não se inscreve duas vezes na mesma feira | Validação ao confirmar a inscrição |
| Inscrição só dentro do prazo da feira | Feiras com prazo vencido aparecem desativadas |
| Resumo com 80 a 250 palavras | Contador ao vivo e validação ao enviar |
| Resumo pode ser reenviado até o prazo | Depois do prazo o texto fica somente para leitura |
| Documentos em PDF, JPG ou PNG de até 5 MB | Validação ao escolher ou soltar o arquivo |
| Não se exclui aluno que está em equipe, equipe que tem projeto, nem projeto inscrito | Mensagem explicando o que fazer antes |

O aluno também não pode ser cadastrado duas vezes (mesmo nome e mesma data de nascimento), e o nome da escola do professor já vem preenchido no cadastro do aluno, evitando redigitação.

## 6. Cálculo das pendências

As pendências **não são digitadas** pelo professor. A função `calcularPendencias()`, em `dados.js`, percorre as equipes e verifica, nesta ordem:

1. a equipe tem projeto? Se não, gera "Cadastrar o projeto da equipe";
2. o projeto está inscrito em alguma feira? Se não, gera "Inscrever o projeto em uma feira";
3. o resumo foi enviado? Se não, gera "Enviar o resumo" (ou avisa que há só um rascunho);
4. para cada um dos três documentos (ficha de inscrição, termo de uso de imagem e autorização dos responsáveis), se não foi enviado, gera uma pendência.

Cada pendência guarda o prazo da feira correspondente e o endereço da tela onde o professor resolve aquele item. Assim, o botão de cada pendência leva direto ao lugar certo, já com a equipe ou o projeto selecionado.

Como a lista é recalculada a cada vez que uma tela é aberta, ela está sempre de acordo com os cadastros. A mesma função alimenta o indicador do painel, a coluna de ação da tabela "Minhas equipes" e a tela de pendências, com as abas Todas, Resumos e Documentos.

A situação de cada prazo é mostrada com chips: "Prazo encerrado" ou "Vence hoje" (vermelho), "Vence em X dias" quando faltam até 7 dias (âmbar) e a data quando ainda há folga (neutro).

## 7. Interface e decisões de usabilidade

A interface reproduz o design de alta fidelidade feito no Figma. As cores ficam em **variáveis CSS** no início de `estilo.css` (azul-petróleo `#0F5C6E` como cor principal, âmbar `#F2A93B` como destaque, além de verde, âmbar escuro e vermelho para situações). Alterar uma variável altera o sistema inteiro.

Princípios aplicados, com base nas heurísticas de Nielsen:

- **Uma ação principal por tela**, destacada como botão preenchido. Ações secundárias usam botão com borda.
- **Etapas numeradas** (trilha Alunos → Equipe → Projeto → Inscrição → Resumo) com marcação das etapas já feitas, para o professor saber onde está e o que vem depois (visibilidade do estado do sistema).
- **Reconhecimento em vez de memorização**: o professor escolhe alunos, equipes e feiras em listas, em vez de digitar nomes.
- **Encaminhamento automático**: após salvar a equipe, o sistema abre o cadastro do projeto com a equipe já escolhida; após o projeto, abre a inscrição; após a inscrição, abre o resumo.
- **Prevenção de erros**: listas filtradas (só alunos sem equipe, só equipes sem projeto), máscaras de data e telefone, confirmação antes de excluir.
- **Mensagens de erro claras**, junto ao campo, dizendo o que corrigir (por exemplo, "O resumo tem 62 palavras. O mínimo é 80.").
- **Rótulos sempre visíveis** acima dos campos, com exemplos de preenchimento.
- **Chips de situação com texto e ponto**: ponto cheio para concluído e ponto vazado para pendente. A informação nunca depende só da cor, o que ajuda pessoas com daltonismo.

## 8. Acessibilidade

- Contraste das cores conforme o padrão WCAG AA.
- Foco do teclado sempre visível (contorno âmbar).
- Botões e campos com no mínimo 44 pixels de altura.
- Todos os campos com `<label>` ligado ao campo; mensagens de erro e de ajuda ligadas por `aria-describedby`.
- Mensagens de erro, contador de palavras e avisos em regiões `aria-live`, lidas automaticamente por leitores de tela.
- Link "Pular para o conteúdo" no início da página.
- Tema escuro automático quando o sistema operacional está em modo escuro.
- Animações desativadas para quem configurou o sistema para reduzir movimento.
- Layout adaptável: no celular, o menu ocupa a largura toda e a tabela do painel vira uma lista de cartões.

Pontos ainda em aberto: revisão completa da navegação por teclado com usuários reais, opção de aumentar o tamanho da fonte e textos alternativos para futuras imagens.

## 9. Segurança

Todo texto digitado pelo usuário passa pela função `esc()` antes de ser exibido. Ela troca caracteres como `<` e `>` por códigos seguros, impedindo que alguém insira código na página (ataque conhecido como XSS).

Como os alunos são menores de idade, o protótipo usa apenas **dados fictícios**. Antes do uso com dados reais será necessário definir política de privacidade, consentimento e tempo de guarda, conforme a LGPD, além de servidor com acesso protegido por senha.

## 10. Modo de teste e coleta de dados da avaliação

O rodapé tem um "Modo de teste", pensado para as sessões de usabilidade:

- **Carregar dados de exemplo**: restaura as equipes Solar, Maré e Pulso; Davi, Elisa e Felipe ficam sem equipe para a primeira tarefa;
- **Começar vazio**: apaga tudo, para observar o primeiro uso;
- **Copiar dados (JSON)** e **Baixar dados (JSON)**: exportam todos os dados junto com o **registro de navegação**.

O registro guarda, com data e hora, cada tela aberta e cada ação realizada (cadastrou aluno, enviou resumo etc.). Com ele, é possível calcular o tempo gasto em cada tarefa e identificar caminhos errados, complementando as observações, o questionário SEQ após cada tarefa e o SUS ao final.

Procedimento sugerido por participante: antes da sessão, "Carregar dados de exemplo"; ao final, "Baixar dados (JSON)" e guardar o arquivo identificado pelo código do participante.

## 11. Hospedagem

O protótipo é publicado no **GitHub Pages**, serviço gratuito do GitHub que transforma um repositório com arquivos HTML, CSS e JavaScript em um site acessível por endereço público (`https://usuario.github.io/crie-ciencia/`). Como não há servidor nem banco de dados, não há custo nem manutenção de infraestrutura.

Cada pessoa que abre o endereço tem os próprios dados, guardados no próprio navegador. Ninguém vê os dados de outro participante.

## 12. Limitações e próximos passos

| Limitação atual | Etapa prevista no cronograma |
|---|---|
| Dados só no navegador | Backend com API e banco relacional (PostgreSQL ou SQLite) |
| Sem login | Autenticação do professor por e-mail e senha |
| Documentos sem envio real | Upload com validação de tipo e tamanho no servidor (jan a fev/2027) |
| Prazos fixos de duas feiras | Cadastro de feiras pelo organizador e avisos por e-mail (mar a abr/2027) |
| Sem relatórios | Lista de equipes por feira e ficha de consolidação em PDF (abr a mai/2027) |
| Só o perfil de professor | Perfis de organizador e avaliador (a confirmar) |

## 13. Declaração de uso de inteligência artificial

As normas acadêmicas pedem transparência sobre ferramentas de IA. Sugestão de texto, a ajustar conforme as orientações da UFERSA e da orientadora:

> O desenvolvimento do protótipo contou com o apoio de ferramenta de inteligência artificial generativa (Claude, da Anthropic) na geração e revisão de trechos de código e na organização da documentação técnica. As decisões de requisitos, fluxo, design de interface, regras de negócio e procedimentos de avaliação foram definidas pelo autor com a orientadora, e todo o código foi revisado, testado e adaptado pelo autor.
