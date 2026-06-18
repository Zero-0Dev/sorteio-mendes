let defaultParticipantes = [];
let defaultVencedores = [];

let participantes = JSON.parse(localStorage.getItem('mendes_participantes')) || [...defaultParticipantes];
let vencedoresHistory = JSON.parse(localStorage.getItem('mendes_historico')) || [...defaultVencedores];
let todosParticipantes = JSON.parse(localStorage.getItem('mendes_todos_participantes')) || [...participantes];

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
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const btnShowOverlay = document.getElementById('btn-show-winners-overlay');
const btnCloseOverlay = document.getElementById('btn-close-overlay');
const winnersOverlay = document.getElementById('winners-overlay');
const btnExportBackup = document.getElementById('btn-export-backup');
const btnImportBackup = document.getElementById('btn-import-backup');
const importFileInput = document.getElementById('import-file-input');
const btnAddManualWinner = document.getElementById('btn-add-manual-winner');
const manualWinnerName = document.getElementById('manual-winner-name');
const manualWinnerDate = document.getElementById('manual-winner-date');

function init() {
    atualizarContador();
    btnSortear.addEventListener('click', iniciarSorteio);
    btnNovoSorteio.addEventListener('click', resetParaHome);
    
    btnFullscreen.addEventListener('click', toggleFullScreen);
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');
        });
    });
    
    btnConfig.addEventListener('click', abrirModalConfig);
    btnCloseConfig.addEventListener('click', () => configModal.classList.remove('active'));
    btnSaveParticipants.addEventListener('click', salvarParticipantes);
    
    btnHistorico.addEventListener('click', () => {
        atualizarHistorico();
        historyModal.classList.add('active');
    });
    btnCloseHistory.addEventListener('click', () => historyModal.classList.remove('active'));
    btnClearHistory.addEventListener('click', limparHistorico);
    
    btnShowOverlay.addEventListener('click', mostrarOverlayGanhadores);
    btnCloseOverlay.addEventListener('click', () => winnersOverlay.classList.add('hidden'));
    
    btnExportBackup.addEventListener('click', exportarBackup);
    btnImportBackup.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importarBackup);
    btnAddManualWinner.addEventListener('click', adicionarGanhadorManual);
}

function abrirModalConfig() {
    renderizarVisualizacao();
    renderizarAbaGanhadores();
    participantsInput.value = participantes.join('\n');
    configModal.classList.add('active');
}

function renderizarVisualizacao() {
    const listEl = document.getElementById('participants-view-list');
    listEl.innerHTML = '';
    
    const winnerNames = new Map();
    vencedoresHistory.forEach(v => {
        winnerNames.set(v.nome, v.data || v.hora);
    });
    
    const todosNomes = [...new Set([...todosParticipantes])];
    
    if (todosNomes.length === 0 && participantes.length === 0) {
        listEl.innerHTML = '<li style="color: #888; list-style: none;">Nenhum participante cadastrado.</li>';
        return;
    }
    
    const aindaNaUrna = [...participantes];
    const jaSorteados = todosNomes.filter(n => winnerNames.has(n));
    const naoSorteados = todosNomes.filter(n => !winnerNames.has(n) && !aindaNaUrna.includes(n));
    const listaFinal = [...aindaNaUrna, ...jaSorteados, ...naoSorteados];
    
    listaFinal.forEach(nome => {
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = nome;
        li.appendChild(nameSpan);
        
        if (winnerNames.has(nome)) {
            li.classList.add('winner-in-list');
            const badge = document.createElement('span');
            badge.className = 'winner-badge';
            badge.textContent = `\u{1F3C6} ${winnerNames.get(nome)}`;
            li.appendChild(badge);
        }
        
        listEl.appendChild(li);
    });
}

function renderizarAbaGanhadores() {
    const container = document.getElementById('winners-by-date');
    container.innerHTML = '';
    
    if (vencedoresHistory.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">Nenhum ganhador registrado ainda.</p>';
        return;
    }
    
    const grouped = {};
    vencedoresHistory.forEach(v => {
        const key = v.data || 'Sem data';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(v);
    });
    
    const sortedDates = Object.keys(grouped).sort((a, b) => {
        const partsA = a.split('/'); const partsB = b.split('/');
        const dA = new Date(partsA[2], partsA[1]-1, partsA[0]);
        const dB = new Date(partsB[2], partsB[1]-1, partsB[0]);
        return dB - dA;
    });
    
    sortedDates.forEach(date => {
        const group = document.createElement('div');
        group.className = 'winners-date-group';
        group.innerHTML = `<h3>\u{1F4C5} ${date}</h3>`;
        const ul = document.createElement('ul');
        grouped[date].forEach(v => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${v.nome}</strong><span>${v.hora}</span>`;
            ul.appendChild(li);
        });
        group.appendChild(ul);
        container.appendChild(group);
    });
}

function mostrarOverlayGanhadores() {
    const hoje = new Date().toLocaleDateString('pt-BR');
    document.getElementById('overlay-date').textContent = hoje;
    
    const lista = document.getElementById('overlay-winners-list');
    lista.innerHTML = '';
    
    const ganhadoresHoje = vencedoresHistory.filter(v => v.data === hoje);
    
    if (ganhadoresHoje.length === 0) {
        lista.innerHTML = '<p style="color: #888; font-size: 1.2rem;">Nenhum ganhador sorteado hoje.</p>';
    } else {
        ganhadoresHoje.forEach(v => {
            const div = document.createElement('div');
            div.className = 'overlay-winner-name';
            div.textContent = v.nome;
            lista.appendChild(div);
        });
    }
    
    configModal.classList.remove('active');
    winnersOverlay.classList.remove('hidden');
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
    const lines = participantsInput.value.split(/\r?\n/);
    
    let parsed = [];
    lines.forEach(line => {
        let cleanLine = line.replace(/^\d+[.\-\)]\s*/, '').replace(/["']/g, '').trim();
        
        if (cleanLine.includes(',') && cleanLine.length > 20) {
            let subLines = cleanLine.split(',');
            subLines.forEach(sub => {
                if(sub.trim().length > 0) parsed.push(sub.trim());
            });
        } else if (cleanLine.length > 0) {
            parsed.push(cleanLine);
        }
    });

    participantes = parsed;
    
    todosParticipantes = [...new Set([...parsed, ...vencedoresHistory.map(v => v.nome)])];
    localStorage.setItem('mendes_todos_participantes', JSON.stringify(todosParticipantes));
    localStorage.setItem('mendes_participantes', JSON.stringify(participantes));
    
    atualizarContador();
    
    document.querySelector('.tab-btn[data-target="content-view"]').click();
    renderizarVisualizacao();
    
    btnSortear.disabled = false;
    btnSortear.innerHTML = '<span class="btn-icon">⚽</span> INICIAR SORTEIO';
    btnSortear.style.opacity = "1";
    alert(`Sucesso! A urna agora tem ${participantes.length} participantes.`);
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
        btnSortear.innerHTML = "SORTEIO ENCERRADO";
        btnSortear.style.opacity = "0.5";
    } else if (vencedoresHistory.length > 0) {
        btnSortear.disabled = false;
        btnSortear.innerHTML = '<span class="btn-icon">⚽</span> SORTEAR NOVAMENTE';
        btnSortear.style.opacity = "1";
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
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        data: new Date().toLocaleDateString('pt-BR')
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

function exportarBackup() {
    const dados = {
        versao: '1.0',
        dataExportacao: new Date().toLocaleString('pt-BR'),
        participantes: participantes,
        todosParticipantes: todosParticipantes,
        historico: vencedoresHistory
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_sorteio_mendes_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Backup exportado com sucesso!');
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (!dados.participantes || !dados.historico) {
                alert('Arquivo inválido! O arquivo não contém os dados esperados.');
                return;
            }
            
            if (!confirm(`Deseja restaurar o backup de ${dados.dataExportacao || 'data desconhecida'}?\n\n` +
                `• ${dados.participantes.length} participantes na urna\n` +
                `• ${dados.historico.length} ganhadores no histórico\n\n` +
                `⚠️ Isso substituirá todos os dados atuais!`)) {
                return;
            }
            
            participantes = dados.participantes;
            todosParticipantes = dados.todosParticipantes || [...dados.participantes];
            vencedoresHistory = dados.historico;
            
            localStorage.setItem('mendes_participantes', JSON.stringify(participantes));
            localStorage.setItem('mendes_todos_participantes', JSON.stringify(todosParticipantes));
            localStorage.setItem('mendes_historico', JSON.stringify(vencedoresHistory));
            
            atualizarContador();
            renderizarVisualizacao();
            renderizarAbaGanhadores();
            participantsInput.value = participantes.join('\n');
            
            alert(`Backup restaurado com sucesso!\n${participantes.length} participantes e ${vencedoresHistory.length} ganhadores carregados.`);
        } catch (err) {
            alert('Erro ao ler o arquivo de backup. Verifique se é um arquivo .json válido.');
        }
    };
    reader.readAsText(file);
    importFileInput.value = '';
}

function adicionarGanhadorManual() {
    const nome = manualWinnerName.value.trim();
    let data = manualWinnerDate.value.trim();
    
    if (!nome) {
        alert('Digite o nome do ganhador.');
        manualWinnerName.focus();
        return;
    }
    
    if (!data) {
        data = new Date().toLocaleDateString('pt-BR');
    } else {
        const partes = data.split('/');
        if (partes.length !== 3 || partes[0].length < 1 || partes[1].length < 1 || partes[2].length !== 4) {
            alert('Data inválida. Use o formato dd/mm/aaaa.');
            manualWinnerDate.focus();
            return;
        }
    }
    
    vencedoresHistory.push({
        nome: nome.toUpperCase(),
        hora: 'Manual',
        data: data
    });
    
    if (!todosParticipantes.includes(nome.toUpperCase())) {
        todosParticipantes.push(nome.toUpperCase());
        localStorage.setItem('mendes_todos_participantes', JSON.stringify(todosParticipantes));
    }
    
    const idx = participantes.findIndex(p => p.toUpperCase() === nome.toUpperCase());
    if (idx !== -1) {
        participantes.splice(idx, 1);
        localStorage.setItem('mendes_participantes', JSON.stringify(participantes));
        atualizarContador();
    }
    
    localStorage.setItem('mendes_historico', JSON.stringify(vencedoresHistory));
    
    manualWinnerName.value = '';
    manualWinnerDate.value = '';
    
    renderizarAbaGanhadores();
    renderizarVisualizacao();
    
    alert(`Ganhador "${nome.toUpperCase()}" registrado em ${data} com sucesso!`);
}

// === Efeito de brilho sutil que segue o mouse ===
(function() {
    const glowCanvas = document.getElementById('glow-canvas');
    if (!glowCanvas) return;
    const glowCtx = glowCanvas.getContext('2d');

    function resizeGlowCanvas() {
        glowCanvas.width = glowCanvas.offsetWidth;
        glowCanvas.height = glowCanvas.offsetHeight;
    }
    resizeGlowCanvas();
    window.addEventListener('resize', resizeGlowCanvas);

    let gMouseX = -1000, gMouseY = -1000;
    let gSmoothX = -1000, gSmoothY = -1000;

    document.addEventListener('mousemove', (e) => {
        const rect = glowCanvas.getBoundingClientRect();
        gMouseX = e.clientX - rect.left;
        gMouseY = e.clientY - rect.top;
    });

    document.addEventListener('mouseleave', () => {
        gMouseX = -1000;
        gMouseY = -1000;
    });

    function animateGlow() {
        glowCtx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);

        gSmoothX += (gMouseX - gSmoothX) * 0.05;
        gSmoothY += (gMouseY - gSmoothY) * 0.05;

        if (gMouseX > 0) {
            const glow = glowCtx.createRadialGradient(gSmoothX, gSmoothY, 0, gSmoothX, gSmoothY, 300);
            glow.addColorStop(0, 'rgba(255, 215, 0, 0.045)');
            glow.addColorStop(0.4, 'rgba(80, 20, 10, 0.025)');
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

            glowCtx.fillStyle = glow;
            glowCtx.fillRect(0, 0, glowCanvas.width, glowCanvas.height);
        }

        requestAnimationFrame(animateGlow);
    }

    animateGlow();
})();

init();
