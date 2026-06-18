# Planejamento do Próximo Sprint - Sorteio Mendes Holler 🏆⚽

Este arquivo serve como roteiro e documentação do estado atual do projeto para dar continuidade ao desenvolvimento assim que você retornar.

---

## 📌 Estado Atual do Projeto

O projeto está configurado como um **Single Page Application (SPA)** leve e estático, pronto para rodar direto no navegador e publicado no **GitHub Pages**:
1. **Interface Moderna**: Visual inspirado em futebol/Copa do Mundo (tons escuros de grená, detalhes dourados, verdes, e fontes esportivas).
2. **Fluxo do Sorteio**:
   - Tela Inicial com contador de pessoas na urna.
   - Contagem Regressiva Dramática (3, 2, 1...).
   - Roleta rápida com efeito de desfoque nos nomes.
   - Tela de Impacto: **GOOOOOOL!**
   - Tela de Vitória com confetes e fogos dourados (`canvas-confetti`).
3. **Persistência Local**: Todo o estado da urna, participantes cadastrados e histórico de ganhadores são mantidos no `localStorage` do navegador.
4. **Painel de Controle (Modal de Configuração)**:
   - **Aba Urna**: Exibe a lista atual de participantes e destaca com 🏆 os que já foram sorteados.
   - **Aba Editar Lista**: Permite colar a lista de funcionários (separados por linha) e limpa automaticamente números e aspas.
   - **Aba Ganhadores**: Lista todos os vencedores agrupados por data.
5. **Overlay de Compartilhamento (Print)**: Tela inteira elegante que resume os ganhadores do dia para facilitar capturas de tela (prints) com o logo da empresa.
6. **Privacidade Garantida**: Todos os nomes reais dos funcionários e ganhadores anteriores foram removidos do código fonte para que o repositório no GitHub possa ser público sem expor dados pessoais.

---

## 🚀 Próximas Implementações (Backlog do Sprint)

Para a continuidade do projeto, sugerimos as seguintes melhorias técnicas e de experiência do usuário:

### 1. Funcionalidade de Backup e Restauração (Importar/Exportar)
* **Objetivo**: Facilitar a migração de dados e evitar a perda do histórico caso o navegador seja limpo.
* **O que fazer**:
  - Criar um botão "Exportar Backup" na aba de configurações que gera um arquivo `.json` contendo a lista atual de participantes e o histórico de ganhadores.
  - Criar um botão "Importar Backup" para ler esse arquivo `.json` e restaurar o estado completo no `localStorage`.

### 2. Cadastro Manual de Ganhadores Anteriores pela Interface
* **Objetivo**: Evitar a necessidade de usar o Console do navegador (`F12`) para inserir sorteios antigos (como os de 12/06).
* **O que fazer**:
  - Adicionar um formulário simples (Nome e Data) na aba "Ganhadores" para permitir a inserção manual de vencedores históricos direto pela tela.

### 3. Melhoria na Gestão de Vencedores (Destaque e Exclusão)
* **Objetivo**: Dar mais controle sobre o status dos participantes já sorteados.
* **O que fazer**:
  - Permitir reintroduzir um ganhador de volta à urna caso seja necessário.
  - Opção para alternar se um ganhador anterior deve ser totalmente removido das edições ou se ele pode voltar a concorrer no futuro.

### 4. Validação de Assets (Imagens e Sons)
* **Objetivo**: Substituir as imagens provisórias pelas oficiais da Mendes Holler.
* **O que fazer**:
  - Inserir a imagem da logo da empresa em `assets/imagens/logo.jpg`.
  - Inserir a imagem oficial do prêmio (camiseta) em `assets/imagens/premio.jpg`.
  - (Opcional) Adicionar efeito sonoro de torcida/vuvuzela no momento da tela de "GOOOOOOL!".

---

## 🛠️ Como Retomar o Projeto

1. Abra a pasta do projeto no VS Code ou editor de preferência.
2. Certifique-se de que os arquivos locais estão sincronizados com o repositório remoto.
3. Para testar localmente, basta abrir o `index.html` no navegador.
4. Para atualizar o site público após fazer alterações:
   ```powershell
   git add .
   git commit -m "feat: descrição da melhoria"
   git push origin main
   ```
5. O GitHub Pages atualizará o link público em 1 ou 2 minutos.
