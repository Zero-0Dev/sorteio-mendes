/* 
  Sorteio Mendes Holler - Lógica Principal 
  Sem áudios para manter o código limpo e simples.
*/

// ==========================================
// CONFIGURAÇÕES GERAIS
// ==========================================

// Lista inicial de participantes (Padrão ou carregada do LocalStorage)
let defaultParticipantes = [
    "João Silva",
    "Maria Oliveira",
    "Carlos Eduardo",
    "Ana Beatriz",
    "Roberto Carlos",
    "Fernanda Lima",
    "Lucas Mendes",
    "Juliana Paes",
    "Marcos Holler",
    "Camila Pitanga"
];

let participantes = JSON.parse(localStorage.getItem('mendes_participantes')) || [...defaultParticipantes];
let vencedoresHistory = JSON.parse(localStorage.getItem('mendes_historico')) || [];

// Elementos da Interface
const screens = {
    home: document.getElementById('home-screen'),
    suspense: document.getElementById('suspense-screen'),
    draw: document.getElementById('draw-screen'),
    gol: document.getElementById('gol-screen'),
    winner: document.getElementById('winner-screen')
};

const elParticipantCount = document.getElementById('participant-count');
const elCountdown = document.getElementById('countdown');
const elRouletteNames = document.getElementById('roulette-names');
const elWinnerName = document.getElementById('winner-name');
const elHistoryList = document.getElementById('history-list');

// Botões e Modais
const btnSortear = document.getElementById('btn-sortear');
const btnNovoSorteio = document.getElementById('btn-novo-sorteio');
const btnHistorico = document.getElementById('btn-historico');
const btnConfig = document.getElementById('btn-config');
const historyModal = document.getElementById('history-modal');
const configModal = document.getElementById('config-modal');
const btnCloseHistory = document.getElementById('close-history');
const btnCloseConfig = document.getElementById('close-config');
const btnSaveParticipants = document.getElementById('btn-save-participants');
const participantsInput = document.getElementById('participants-input');
const btnClearHistory = document.getElementById('btn-clear-history');

// ==========================================
// INICIALIZAÇÃO
// ==========================================
function init() {
    atualizarContador();
    btnSortear.addEventListener('click', iniciarSorteio);
    btnNovoSorteio.addEventListener('click', resetParaHome);
    
    // Config Modal
    btnConfig.addEventListener('click', abrirModalConfig);
    btnCloseConfig.addEventListener('click', () => configModal.classList.remove('active'));
    btnSaveParticipants.addEventListener('click', salvarParticipantes);
    
    // History Modal
    btnHistorico.addEventListener('click', () => {
        atualizarHistorico();
        historyModal.classList.add('active');
    });
    btnCloseHistory.addEventListener('click', () => historyModal.classList.remove('active'));
    btnClearHistory.addEventListener('click', limparHistorico);
}

function abrirModalConfig() {
    // Preenche a textarea com a lista atual
    participantsInput.value = participantes.join('\n');
    configModal.classList.add('active');
}

function salvarParticipantes() {
    const lines = participantsInput.value.split('\n');
    // Filtra linhas vazias
    participantes = lines.map(line => line.trim()).filter(line => line.length > 0);
    
    // Salva no localStorage
    localStorage.setItem('mendes_participantes', JSON.stringify(participantes));
    
    atualizarContador();
    configModal.classList.remove('active');
    
    // Reseta o botão de sorteio caso estivesse desativado
    btnSortear.disabled = false;
    btnSortear.innerHTML = '<span class="btn-icon">⚽</span> SORTEAR AGORA!';
    btnSortear.style.opacity = "1";
    alert('Participantes atualizados com sucesso!');
}

function limparHistorico() {
    if(confirm('Tem certeza que deseja apagar todo o histórico de ganhadores?')) {
        vencedoresHistory = [];
        localStorage.removeItem('mendes_historico');
        atualizarHistorico();
    }
}

function atualizarContador() {
    elParticipantCount.textContent = participantes.length;
    if (participantes.length === 0) {
        btnSortear.disabled = true;
        btnSortear.innerHTML = "TODOS SORTEADOS!";
        btnSortear.style.opacity = "0.5";
    }
}

function mudarTela(telaAtiva) {
    // Esconde todas as telas
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    // Mostra a tela desejada
    telaAtiva.classList.remove('hidden');
    telaAtiva.classList.add('active');
}

// ==========================================
// FLUXO DO SORTEIO
// ==========================================

function iniciarSorteio() {
    if (participantes.length === 0) return;
    
    mudarTela(screens.suspense);
    elCountdown.classList.remove('animate');
    
    let count = 3;
    elCountdown.textContent = count;
    
    // Animação inicial
    void elCountdown.offsetWidth; // Trigger reflow
    elCountdown.classList.add('animate');
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            elCountdown.textContent = count;
            elCountdown.classList.remove('animate');
            void elCountdown.offsetWidth;
            elCountdown.classList.add('animate');
        } else {
            clearInterval(interval);
            iniciarRolagem();
        }
    }, 1200); // 1.2s para cada número dar tempo da animação
}

function iniciarRolagem() {
    mudarTela(screens.draw);
    
    let spinCount = 0;
    const maxSpins = 40; // Quantas vezes o nome vai trocar antes de parar (velocidade alta)
    const spinSpeed = 80; // Milissegundos por troca
    
    // Embaralha para dar a sensação de aleatoriedade na roleta
    const nomesEmbaralhados = [...participantes].sort(() => 0.5 - Math.random());
    
    const rolagemInterval = setInterval(() => {
        // Exibe nomes aleatórios passando rápido
        elRouletteNames.textContent = nomesEmbaralhados[spinCount % nomesEmbaralhados.length];
        spinCount++;
        
        if (spinCount >= maxSpins) {
            clearInterval(rolagemInterval);
            exibirGol();
        }
    }, spinSpeed);
}

function exibirGol() {
    mudarTela(screens.gol);
    
    // O "GOOOOOOL" fica na tela por um curto período (surpresa)
    setTimeout(() => {
        escolherVencedor();
    }, 1500); // 1.5 segundos
}

function escolherVencedor() {
    // Sorteio real acontece aqui
    const randomIndex = Math.floor(Math.random() * participantes.length);
    const vencedor = participantes[randomIndex];
    
    // Remove o vencedor da lista
    participantes.splice(randomIndex, 1);
    
    // Adiciona ao histórico
    vencedoresHistory.push({
        nome: vencedor,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    
    // Salva no localStorage
    localStorage.setItem('mendes_historico', JSON.stringify(vencedoresHistory));
    localStorage.setItem('mendes_participantes', JSON.stringify(participantes));
    
    atualizarHistorico();
    
    // Configura tela e exibe
    elWinnerName.textContent = vencedor;
    mudarTela(screens.winner);
    
    // Dispara a animação principal da tela de vencedor
    setTimeout(() => {
        document.querySelector('.winner-content').classList.add('show');
        lancarConfetes();
    }, 100);
}

// ==========================================
// EFEITOS E CONFETES
// ==========================================

function lancarConfetes() {
    // Efeito de explosão central inicial (Fogos de artifício no Canvas)
    var duration = 4000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    // Intervalo disparando confetes
    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      // Confetes das bordas laterais (Estilo estádio)
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#008000', '#FFCC00', '#ffffff']
      }));
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#008000', '#FFCC00', '#ffffff']
      }));
    }, 250);
    
    // Explosão dourada no centro
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFCC00']
    });
}

// ==========================================
// CONTROLE E ESTADO
// ==========================================

function resetParaHome() {
    document.querySelector('.winner-content').classList.remove('show');
    atualizarContador();
    mudarTela(screens.home);
}

function atualizarHistorico() {
    elHistoryList.innerHTML = '';
    
    if (vencedoresHistory.length === 0) {
        elHistoryList.innerHTML = '<li>Nenhum sorteio realizado ainda.</li>';
        return;
    }
    
    // Mostra do mais recente para o mais antigo
    [...vencedoresHistory].reverse().forEach(v => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${v.nome}</strong> <span>(${v.hora})</span>`;
        elHistoryList.appendChild(li);
    });
}

// Inicia o app
init();
