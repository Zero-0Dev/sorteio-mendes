# Sorteio Corporativo - Mendes Holler

Este é um site estático desenvolvido para os sorteios internos da **Mendes Holler**, focado em campanhas (como a da Copa do Mundo). O projeto foi desenhado para gerar suspense, expectativa e entregar um alto impacto visual na hora de revelar o vencedor, sem a necessidade de banco de dados ou sistemas complexos.

## 🛠 Tecnologias Utilizadas

* HTML5
* CSS3 (Animações, Flexbox)
* JavaScript (Vanilla JS)
* [canvas-confetti](https://github.com/catdad/canvas-confetti) (Biblioteca leve para o efeito de fogos de artifício e confetes)

---

## 👥 Como alterar os participantes

Toda a lista de participantes é gerenciada diretamente no arquivo JavaScript, o que torna o processo muito fácil e rápido.

1. Abra o arquivo `js/script.js` usando qualquer editor de texto (Bloco de Notas, VSCode, etc).
2. Logo nas primeiras linhas, você verá a lista de participantes:

```javascript
let participantes = [
    "João Silva",
    "Maria Oliveira",
    "Carlos Eduardo",
    "Ana Beatriz"
];
```

3. Adicione, remova ou altere os nomes colocando-os sempre entre aspas duplas (`" "`) e separados por vírgula (`,`). O último nome da lista não precisa de vírgula no final.
4. Salve o arquivo e recarregue a página (`F5`).

> **Nota:** O sistema evita repetir vencedores na mesma sessão. Assim que um nome ganha, ele é temporariamente retirado da urna até que a página seja recarregada.

---

## 🚀 Como publicar no GitHub Pages

Este projeto foi estruturado para ser totalmente compatível com o GitHub Pages, permitindo um deploy gratuito e automático.

### Passo a Passo

1. **Crie um repositório no GitHub:**
   - Acesse [github.com](https://github.com) e crie um novo repositório (ex: `sorteio-mendes`).
   - Deixe-o como **Público**.

2. **Envie os arquivos:**
   - Faça o upload de todos os arquivos e pastas deste projeto para o seu novo repositório (`index.html`, pasta `css`, pasta `js`, etc).

3. **Ative o GitHub Pages:**
   - No seu repositório do GitHub, clique em **Settings** (Configurações).
   - No menu lateral esquerdo, desça até encontrar **Pages**.
   - Em "Source" (ou Build and deployment > Branch), selecione a branch `main` ou `master` e a pasta `/root`.
   - Clique em **Save**.

4. **Pronto!**
   - Em alguns minutos, o GitHub exibirá o link oficial do seu site no topo dessa mesma página (ex: `https://seu-usuario.github.io/sorteio-mendes/`).

---

## 🎨 Como customizar a Arte Visual (Logotipo)

Se desejar inserir o logotipo oficial da empresa:
1. Salve o seu logotipo na pasta `assets/imagens/` (ex: `logo.png`).
2. No arquivo `index.html`, substitua o bloco:
   ```html
   <div class="logo-sphere"></div>
   <h1>MENDES HOLLER</h1>
   ```
   Por:
   ```html
   <img src="assets/imagens/logo.png" alt="Mendes Holler Logo" style="max-height: 80px;">
   ```

## Boas Festas e Bons Sorteios! 🏆
