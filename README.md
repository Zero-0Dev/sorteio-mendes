# Sorteio Corporativo

Sistema estático de sorteios com experiência de alto impacto visual.

## Funcionalidades

- Sorteio aleatório com contagem regressiva, roleta de nomes e revelação do prêmio.
- Painel de controle para edição instantânea da lista de participantes.
- Histórico de ganhadores (persistido localmente no navegador).
- Backup e restauração dos dados via arquivo JSON.
- Cadastro manual de ganhadores.
- Overlay fullscreen para print dos ganhadores do dia.
- Modo Tela Cheia nativo.

## Estrutura do Projeto

```
├── index.html                  Página principal
├── css/
│   ├── style.css               Ponto de entrada (importa os demais)
│   ├── variables.css           Cores, fontes e tokens de design
│   ├── base.css                Reset, body e sistema de telas
│   ├── components.css          Botões, inputs, tabs, listas
│   ├── screens.css             Telas do fluxo de sorteio
│   ├── modals.css              Modais, overlays e painel de controle
│   └── responsive.css          Ajustes para telas menores
├── js/
│   └── script.js               Aplicação (Storage → DOM → UI → Sorteio → Effects)
└── assets/
    └── imagens/                Logo e imagem do prêmio
```

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)

## Execução

Abra `index.html` em qualquer navegador moderno.
Compatível com deploy via GitHub Pages.
