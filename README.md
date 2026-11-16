# crie.Ciência

Plataforma web para professores orientadores gerenciarem equipes, projetos e inscrições em feiras de ciências da educação básica.

Projeto de Trabalho de Conclusão de Curso, Licenciatura em Computação, UFERSA.
Autor: Cristian Emanuel Mendonça de Oliveira. Orientadora: Profa. Kátia Cilene da Silva Moura.

## Situação atual

Protótipo funcional usado nos testes de usabilidade com professores. Os dados ficam guardados apenas no navegador de quem está usando (localStorage). Não há servidor, login nem envio real de arquivos.

## Como abrir

- **Online:** pelo endereço do GitHub Pages do repositório.
- **No computador:** basta dar dois cliques no arquivo `index.html`. Não é preciso instalar nada.

## Estrutura

```
index.html        estrutura da página (cabeçalho, área das telas e rodapé)
css/estilo.css    cores, fontes e aparência de todos os componentes
js/dados.js       armazenamento, dados de exemplo e regras (pendências, prazos)
js/interface.js   funções de apoio: campos, chips, validação, máscaras, avisos
js/telas.js       uma função para cada tela do sistema
js/app.js         rotas (#painel, #alunos...) e modo de teste
img/logo.svg      ícone do sistema
docs/             explicação técnica, tecnologias, roteiro de uso e guia de publicação
```

## Telas

Painel, Meu cadastro, Alunos, Equipe, Projeto, Inscrição na feira, Resumo, Pendências, Documentos e Avaliação na feira (ficha de avaliação e classificação).

## Documentação

- [Roteiro de uso](docs/ROTEIRO-DE-USO.md): passo a passo para professores e avaliadores
- [Tecnologias](docs/TECNOLOGIAS.md): cada tecnologia usada, explicada para o TCC
- [Explicação técnica](docs/EXPLICACAO-TECNICA.md): arquitetura, dados e regras
- [Guia do GitHub](docs/GUIA-GITHUB.md): como publicar alterações

## Modo de teste

No rodapé da página. Permite carregar os dados de exemplo, começar sem dados e copiar ou baixar tudo em JSON, incluindo o registro das telas abertas e ações feitas, com horário.

Todos os dados de exemplo são fictícios.
