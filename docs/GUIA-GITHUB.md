# Como colocar o crie.Ciência no GitHub e publicar o site

Este guia não exige instalar nada nem usar linha de comando. Tudo é feito pelo navegador.

**Resultado final:** um endereço como `https://SEU-USUARIO.github.io/crie-ciencia/` que qualquer professor pode abrir no computador ou no celular.

---

## Parte 1: criar a conta (só uma vez)

1. Acesse **github.com** e clique em **Sign up**.
2. Escolha um nome de usuário simples, porque ele fará parte do endereço do site (ex.: `cristian-oliveira`).
3. Confirme o e-mail.

## Parte 2: criar o repositório

Um *repositório* é a pasta do projeto dentro do GitHub.

1. Já logado, clique no **+** no canto superior direito e escolha **New repository**.
2. Preencha:
   - **Repository name:** `crie-ciencia`
   - **Description:** `Plataforma para gestão de projetos em feiras de ciências escolares (TCC, UFERSA)`
   - Marque **Public**. O GitHub Pages gratuito só funciona em repositório público. Não há problema, porque o protótipo não tem dados reais.
   - **Não** marque "Add a README file" (o projeto já tem um).
3. Clique em **Create repository**.

## Parte 3: enviar os arquivos

1. Na página do repositório recém-criado, clique no link **uploading an existing file**.
2. Abra no Windows a pasta `crie-ciencia` (em `Documentos\Claude\crie-ciencia`).
3. Selecione **tudo o que está dentro dela** (Ctrl + A): as pastas `css`, `js`, `img`, `docs` e os arquivos `index.html`, `README.md`.
4. Arraste para a área da página do GitHub. As pastas são enviadas junto com o conteúdo. Use Chrome ou Edge.
   - Atenção: arraste o **conteúdo** da pasta, e não a pasta `crie-ciencia` em si. O `index.html` precisa ficar na "raiz" do repositório.
5. Espere a lista de arquivos aparecer. Em **Commit changes**, escreva uma mensagem que explique o envio, por exemplo:
   `Versão inicial do protótipo navegável`
6. Clique em **Commit changes**.

Confira: na página do repositório você deve ver `index.html`, `README.md` e as pastas `css`, `docs`, `img` e `js`.

## Parte 4: publicar o site (GitHub Pages)

1. No repositório, clique em **Settings** (aba de cima, com ícone de engrenagem).
2. No menu da esquerda, clique em **Pages**.
3. Em **Build and deployment**, na opção **Source**, escolha **Deploy from a branch**.
4. Em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
5. Espere de 1 a 3 minutos e recarregue a página. Vai aparecer no topo:
   **Your site is live at https://SEU-USUARIO.github.io/crie-ciencia/**
6. Abra o endereço e teste. Esse é o link para enviar aos professores e à orientadora.

Dica: para mostrar o link na página inicial do repositório, clique na engrenagem ao lado de **About** (à direita) e marque **Use your GitHub Pages website**.

## Parte 5: atualizar o site depois de uma mudança

Sempre que alterar algum arquivo no computador:

1. No repositório, clique em **Add file** → **Upload files**.
2. Arraste os arquivos alterados. Se um arquivo estiver dentro de uma pasta (ex.: `js/telas.js`), arraste a **pasta** `js` inteira, para que ele vá para o lugar certo e substitua o antigo.
3. Escreva uma mensagem clara do que mudou. Exemplos:
   - `Corrige contador de palavras do resumo`
   - `Ajusta textos da tela de pendências após o teste com professores`
   - `Adiciona botão para baixar dados da sessão de teste`
4. Clique em **Commit changes**. Em 1 a 3 minutos o site é atualizado.

Essas mensagens formam o **histórico** do projeto (aba **Commits**). Ele mostra a evolução do sistema e ajuda a explicar as mudanças na banca, por isso vale escrever mensagens que descrevam o que foi feito.

Se o site não mudar, aperte **Ctrl + F5** no navegador para forçar a atualização.

## Quando o projeto crescer: GitHub Desktop (opcional)

Quando houver muitas alterações, enviar arquivo por arquivo fica trabalhoso. O **GitHub Desktop** é um programa gratuito, com botões, que sincroniza uma pasta do computador com o repositório:

1. Baixe em **desktop.github.com**, instale e entre com sua conta.
2. **File → Clone repository**, escolha `crie-ciencia` e uma pasta do computador.
3. Trabalhe nos arquivos dessa pasta normalmente.
4. No GitHub Desktop aparecem os arquivos alterados. Escreva a mensagem no campo **Summary**, clique em **Commit to main** e depois em **Push origin**.

## Sobre os dados durante os testes

- Cada pessoa que abre o link tem os **próprios dados**, guardados no navegador dela. Ninguém vê o que o outro digitou.
- Antes de cada participante: rodapé → **Modo de teste** → **Carregar dados de exemplo**.
- Ao final da sessão: **Baixar dados (JSON)** e guardar o arquivo com o código do participante (ex.: `P03.json`).
- Se o teste for feito em computador emprestado, faça o download antes de fechar o navegador.

## Problemas comuns

| Problema | Solução |
|---|---|
| Página abre sem cores e sem formatação | O `index.html` não está na raiz ou as pastas `css` e `js` não foram enviadas. Confira a lista de arquivos no repositório. |
| Erro 404 no endereço do site | Aguarde alguns minutos após ativar o Pages e confira se escolheu a branch `main` e `/ (root)`. |
| A opção Pages pede plano pago | O repositório está como privado. Em Settings → General → Danger Zone → Change visibility, mude para Public. |
| Mudança não aparece | Aguarde 1 a 3 minutos e aperte Ctrl + F5. |
