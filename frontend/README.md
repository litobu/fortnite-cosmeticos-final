# Fortnite Store Catalog

Este projeto é um catálogo de produtos da loja do Fortnite, desenvolvido com um tema escuro para proporcionar uma experiência visual agradável em ambientes com pouca luz.

## Estrutura do Projeto

```
fortnite-store-catalog
├── src
│   ├── index.html          # Página principal do catálogo
│   ├── styles
│   │   ├── dark.css       # Estilos para o tema escuro
│   │   └── utilities.css   # Classes utilitárias para estilização
│   ├── scripts
│   │   ├── main.js        # Ponto de entrada do JavaScript
│   │   ├── api
│   │   │   └── fortniteApi.js # Funções para interagir com a API da loja
│   │   └── components
│   │       ├── productCard.js  # Componente para exibir informações do produto
│   │       └── catalog.js       # Componente para renderizar o catálogo
│   └── lib
│       └── fetchWrapper.js      # Função para simplificar chamadas de fetch
├── package.json                # Configuração do npm
├── .gitignore                  # Arquivos a serem ignorados pelo controle de versão
└── README.md                   # Documentação do projeto
```

## Instalação

1. Clone o repositório:
   ```
   git clone <URL_DO_REPOSITORIO>
   ```
2. Navegue até o diretório do projeto:
   ``
   
3. Instale as dependências:
   ```
   npm install
   ```

## Uso

Para iniciar o projeto, cole no terminal cd backend - node .\server.js 
e acesse http://localhost:3000

## API

Este projeto utiliza a API da loja do Fortnite para buscar a lista de produtos. As funções para interagir com a API estão localizadas em `src/scripts/api/fortniteApi.js`. e para informações da key api e da api base esta em backend/.env