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

const screens = {
    home: document.getElementById('home-screen'),
    suspense: document.getElementById('suspense-screen'),
    draw: document.getElementById('draw-screen'),
    gol: document.getElementById('gol-screen'),
    prizeReveal: document.getElementById('prize-reveal-screen'),
    winner: document.getElementById('winner-screen')
};

const elParticipantCount = document.getElementById('participant-count');
const elCountdown = document.getElementById('countdown');
const elRouletteNames = document.getElementById('roulette-names');
const elWinnerName = document.getElementById('winner-name');
const elHistoryList = document.getElementById('history-list');

const btnSortear = document.getElementById('btn-sortear');
const btnNovoSorteio = document.getElementById('btn-novo-sorteio');
const btnHistorico = document.getElementById('btn-historico');
const btnConfig = document.getElementById('btn-config');
const btnFullscreen = document.getElementById('btn-fullscreen');
const historyModal = document.getElementById('history-modal');
const configModal = document.getElementById('config-modal');
const btnCloseHistory = document.getElementById('close-history');
const btnCloseConfig = document.getElementById('close-config');
const btnSaveParticipants = document.getElementById('btn-save-participants');
const participantsInput = document.getElementById('participants-input');
const btnClearHistory = document.getElementById('btn-clear-history');

function init() {
    atualizarContador();
    btnSortear.addEventListener('click', iniciarSorteio);
    btnNovoSorteio.addEventListener('click', resetParaHome);
    
    btnFullscreen.addEventListener('click', toggleFullScreen);
    
    btnConfig.addEventListener('click', abrirModalConfig);
    btnCloseConfig.addEventListener('click', () => configModal.classList.remove('active'));
    btnSaveParticipants.addEventListener('click', salvarParticipantes);
    
    btnHistorico.addEventListener('click', () => {
        atualizarHistorico();
        historyModal.classList.add('active');
    });
    btnCloseHistory.addEventListener('click', () => historyModal.classList.remove('active'));
    btnClearHistory.addEventListener('click', limparHistorico);
}

function abrirModalConfig() {
    participantsInput.value = participantes.join('\n');
    configModal.classList.add('active');
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Erro ao tentar modo tela cheia: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function salvarParticipantes() {
    const lines = participantsInput.value.split('\n');
    participantes = lines.map(line => line.trim()).filter(line => line.length > 0);
    
    localStorage.setItem('mendes_participantes', JSON.stringify(participantes));
    
    atualizarContador();
    configModal.classList.remove('active');
    
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
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    telaAtiva.classList.remove('hidden');
    telaAtiva.classList.add('active');
}

function iniciarSorteio() {
    if (participantes.length === 0) return;
    
    mudarTela(screens.suspense);
    elCountdown.classList.remove('animate');
    
    let count = 3;
    elCountdown.textContent = count;
    
    void elCountdown.offsetWidth;
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
    }, 1200);
}

function iniciarRolagem() {
    mudarTela(screens.draw);
    
    let spinCount = 0;
    const maxSpins = 40;
    const spinSpeed = 80;
    
    const nomesEmbaralhados = [...participantes].sort(() => 0.5 - Math.random());
    
    const rolagemInterval = setInterval(() => {
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
    
    setTimeout(() => {
        exibirPremioAntesDoVencedor();
    }, 1500);
}

function exibirPremioAntesDoVencedor() {
    mudarTela(screens.prizeReveal);
    
    setTimeout(() => {
        escolherVencedor();
    }, 2500);
}

function escolherVencedor() {
    const randomIndex = Math.floor(Math.random() * participantes.length);
    const vencedor = participantes[randomIndex];
    
    participantes.splice(randomIndex, 1);
    
    vencedoresHistory.push({
        nome: vencedor,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    
    localStorage.setItem('mendes_historico', JSON.stringify(vencedoresHistory));
    localStorage.setItem('mendes_participantes', JSON.stringify(participantes));
    
    atualizarHistorico();
    
    elWinnerName.textContent = vencedor;
    mudarTela(screens.winner);
    
    setTimeout(() => {
        document.querySelector('.winner-content').classList.add('show');
        lancarConfetes();
    }, 100);
}

function lancarConfetes() {
    var duration = 4000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
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
    
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFCC00']
    });
}

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
    
    [...vencedoresHistory].reverse().forEach(v => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${v.nome}</strong> <span>(${v.hora})</span>`;
        elHistoryList.appendChild(li);
    });
}

init();
