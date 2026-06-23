/* ==========================================================================
   SORTEIO MENDES — APLICAÇÃO PRINCIPAL
   Sistema de sorteio corporativo com persistência local.

   Este arquivo está organizado nas seguintes seções:

   1. STORAGE     → Persistência no localStorage e backup
   2. DOM         → Referências aos elementos da página
   3. UI          → Renderização, modais, navegação entre telas
   4. SORTEIO     → Lógica do fluxo: contagem → roleta → gol → vencedor
   5. EFFECTS     → Confetes e brilho sutil do cursor
   6. INIT        → Inicialização e registro de eventos
   ========================================================================== */


/* ==========================================================================
   1. STORAGE — Persistência de dados
   ========================================================================== */

const STORAGE_KEYS = {
    participantes:      'mendes_participantes',
    todosParticipantes: 'mendes_todos_participantes',
    historico:          'mendes_historico',
};

let participantes = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.participantes)
) || [];

let vencedoresHistory = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.historico)
) || [];

let todosParticipantes = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.todosParticipantes)
) || [...participantes];

function salvarParticipantesStorage() {
    localStorage.setItem(STORAGE_KEYS.participantes, JSON.stringify(participantes));
}

function salvarTodosParticipantesStorage() {
    localStorage.setItem(STORAGE_KEYS.todosParticipantes, JSON.stringify(todosParticipantes));
}

function salvarHistoricoStorage() {
    localStorage.setItem(STORAGE_KEYS.historico, JSON.stringify(vencedoresHistory));
}

/**
 * Retorna apenas os participantes elegíveis para sorteio
 * (exclui quem já foi sorteado / registrado como ganhador).
 */
function getElegiveis() {
    const nomesGanhadores = new Set(
        vencedoresHistory.map(v => v.nome.toUpperCase())
    );
    return participantes.filter(p => !nomesGanhadores.has(p.toUpperCase()));
}


/* ==========================================================================
   2. DOM — Referências aos elementos da página
   ========================================================================== */

const screens = {
    home:        document.getElementById('home-screen'),
    suspense:    document.getElementById('suspense-screen'),
    draw:        document.getElementById('draw-screen'),
    gol:         document.getElementById('gol-screen'),
    prizeReveal: document.getElementById('prize-reveal-screen'),
    winner:      document.getElementById('winner-screen'),
};

// Elementos de exibição
const elParticipantCount = document.getElementById('participant-count');
const elUrnCountText     = document.getElementById('urn-count-text');
const elCountdown        = document.getElementById('countdown');
const elRouletteNames    = document.getElementById('roulette-names');
const elWinnerName       = document.getElementById('winner-name');
const elHistoryList      = document.getElementById('history-list');

// Botões principais
const btnSortear         = document.getElementById('btn-sortear');
const btnNovoSorteio     = document.getElementById('btn-novo-sorteio');
const btnHistorico       = document.getElementById('btn-historico');
const btnConfig          = document.getElementById('btn-config');
const btnFullscreen      = document.getElementById('btn-fullscreen');

// Modais
const historyModal       = document.getElementById('history-modal');
const configModal        = document.getElementById('config-modal');
const btnCloseHistory    = document.getElementById('close-history');
const btnCloseConfig     = document.getElementById('close-config');

// Configuração de participantes
const btnSaveParticipants = document.getElementById('btn-save-participants');
const participantsInput   = document.getElementById('participants-input');
const btnClearHistory     = document.getElementById('btn-clear-history');

// Tabs do modal de configuração
const tabBtns             = document.querySelectorAll('.tab-btn');
const tabContents         = document.querySelectorAll('.tab-content');

// Overlay de ganhadores
const btnShowOverlay      = document.getElementById('btn-show-winners-overlay');
const btnCloseOverlay     = document.getElementById('btn-close-overlay');
const winnersOverlay      = document.getElementById('winners-overlay');

// Backup
const btnExportBackup     = document.getElementById('btn-export-backup');
const btnImportBackup     = document.getElementById('btn-import-backup');
const importFileInput     = document.getElementById('import-file-input');

// Ganhador manual (aba Ganhadores)
const btnAddManualWinner  = document.getElementById('btn-add-manual-winner');
const manualWinnerName    = document.getElementById('manual-winner-name');
const manualWinnerDate    = document.getElementById('manual-winner-date');

// Ganhador anterior (aba Editar Lista)
const btnEditAddWinner       = document.getElementById('btn-edit-add-winner');
const editManualWinnerName   = document.getElementById('edit-manual-winner-name');
const editManualWinnerDate   = document.getElementById('edit-manual-winner-date');


/* ==========================================================================
   3. UI — Interface e renderização
   ========================================================================== */

// --- Navegação entre telas ---

function mudarTela(telaAtiva) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    telaAtiva.classList.remove('hidden');
    telaAtiva.classList.add('active');
}

function resetParaHome() {
    document.querySelector('.winner-content').classList.remove('show');
    atualizarContador();
    mudarTela(screens.home);
}

// --- Botão de sorteio ---

function atualizarContador() {
    const elegiveis = getElegiveis();
    elParticipantCount.textContent = participantes.length;

    if (elegiveis.length === 0 && vencedoresHistory.length > 0) {
        btnSortear.disabled      = true;
        btnSortear.innerHTML     = 'SORTEIO ENCERRADO';
        btnSortear.style.opacity = '0.5';
    } else if (elegiveis.length === 0) {
        btnSortear.disabled      = true;
        btnSortear.innerHTML     = '<span class="btn-icon">⚽</span> INICIAR SORTEIO';
        btnSortear.style.opacity = '0.5';
    } else {
        btnSortear.disabled      = false;
        btnSortear.innerHTML     = '<span class="btn-icon">⚽</span> INICIAR SORTEIO';
        btnSortear.style.opacity = '1';
    }
}

// --- Renderização de listas ---

function renderizarVisualizacao() {
    const elegiveis = getElegiveis();
    if (elUrnCountText) {
        elUrnCountText.textContent = `Participantes na urna: ${participantes.length} | Elegíveis para sorteio: ${elegiveis.length}`;
    }

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

    const aindaNaUrna  = [...participantes];
    const jaSorteados  = todosNomes.filter(n => winnerNames.has(n));
    const naoSorteados = todosNomes.filter(n => !winnerNames.has(n) && !aindaNaUrna.includes(n));
    const listaFinal   = [...aindaNaUrna, ...jaSorteados, ...naoSorteados];

    listaFinal.forEach(nome => {
        const li       = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = nome;
        li.appendChild(nameSpan);

        if (winnerNames.has(nome)) {
            li.classList.add('winner-in-list');
            const badge       = document.createElement('span');
            badge.className   = 'winner-badge';
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
        const partsA = a.split('/');
        const partsB = b.split('/');
        const dA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
        const dB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
        return dB - dA;
    });

    sortedDates.forEach(date => {
        const group     = document.createElement('div');
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

// --- Modais e Overlays ---

function abrirModalConfig() {
    renderizarVisualizacao();
    renderizarAbaGanhadores();
    participantsInput.value = participantes.join('\n');
    configModal.classList.add('active');
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
            const div       = document.createElement('div');
            div.className   = 'overlay-winner-name';
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
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

// --- Ações do Painel de Configuração ---

function salvarParticipantes() {
    const lines = participantsInput.value.split(/\r?\n/);
    let parsed  = [];

    lines.forEach(line => {
        let cleanLine = line.replace(/^\d+[.\-\)]\s*/, '').replace(/["']/g, '').trim();

        if (cleanLine.includes(',') && cleanLine.length > 20) {
            cleanLine.split(',').forEach(sub => {
                if (sub.trim().length > 0) parsed.push(sub.trim());
            });
        } else if (cleanLine.length > 0) {
            parsed.push(cleanLine);
        }
    });

    participantes = parsed;

    todosParticipantes = [...new Set([...parsed, ...vencedoresHistory.map(v => v.nome)])];
    salvarTodosParticipantesStorage();
    salvarParticipantesStorage();

    atualizarContador();

    document.querySelector('.tab-btn[data-target="content-view"]').click();
    renderizarVisualizacao();

    btnSortear.disabled      = false;
    btnSortear.innerHTML     = '<span class="btn-icon">⚽</span> INICIAR SORTEIO';
    btnSortear.style.opacity = '1';

    alert(`Sucesso! A urna agora tem ${participantes.length} participantes.`);
}

function limparHistorico() {
    if (confirm('Tem certeza que deseja apagar todo o histórico de ganhadores?')) {
        vencedoresHistory = [];
        localStorage.removeItem(STORAGE_KEYS.historico);
        atualizarHistorico();
    }
}

/**
 * Registra um ganhador manualmente a partir de campos de input genéricos.
 * Reutilizado tanto na aba "Ganhadores" quanto na aba "Editar Lista".
 */
function adicionarGanhadorManualGenerico(inputNome, inputData) {
    const nome = inputNome.value.trim();
    let data   = inputData.value.trim();

    if (!nome) {
        alert('Digite o nome do ganhador.');
        inputNome.focus();
        return;
    }

    if (!data) {
        data = new Date().toLocaleDateString('pt-BR');
    } else {
        const partes = data.split('/');
        if (partes.length !== 3 || partes[0].length < 1 || partes[1].length < 1 || partes[2].length !== 4) {
            alert('Data inválida. Use o formato dd/mm/aaaa.');
            inputData.focus();
            return;
        }
    }

    // Verifica se já está registrado como ganhador
    const jaGanhou = vencedoresHistory.some(v => v.nome.toUpperCase() === nome.toUpperCase());
    if (jaGanhou) {
        alert(`"${nome.toUpperCase()}" já está registrado como ganhador.`);
        return;
    }

    vencedoresHistory.push({
        nome: nome.toUpperCase(),
        hora: 'Manual',
        data: data,
    });

    if (!todosParticipantes.includes(nome.toUpperCase())) {
        todosParticipantes.push(nome.toUpperCase());
        salvarTodosParticipantesStorage();
    }

    const idx = participantes.findIndex(p => p.toUpperCase() === nome.toUpperCase());
    if (idx !== -1) {
        participantes.splice(idx, 1);
        salvarParticipantesStorage();
    }

    salvarHistoricoStorage();
    atualizarContador();

    inputNome.value = '';
    inputData.value = '';

    renderizarAbaGanhadores();
    renderizarVisualizacao();

    alert(`Ganhador "${nome.toUpperCase()}" registrado em ${data} com sucesso!`);
}

/** Wrapper para o formulário da aba "Ganhadores". */
function adicionarGanhadorManual() {
    adicionarGanhadorManualGenerico(manualWinnerName, manualWinnerDate);
}

// --- Backup / Restauração ---

function exportarBackup() {
    const dados = {
        versao: '1.0',
        dataExportacao: new Date().toLocaleString('pt-BR'),
        participantes: participantes,
        todosParticipantes: todosParticipantes,
        historico: vencedoresHistory,
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');

    a.href     = url;
    a.download = `backup_sorteio_mendes_${new Date().toISOString().slice(0, 10)}.json`;

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

    reader.onload = function (e) {
        try {
            const dados = JSON.parse(e.target.result);

            if (!dados.participantes || !dados.historico) {
                alert('Arquivo inválido! O arquivo não contém os dados esperados.');
                return;
            }

            if (!confirm(
                `Deseja restaurar o backup de ${dados.dataExportacao || 'data desconhecida'}?\n\n` +
                `• ${dados.participantes.length} participantes na urna\n` +
                `• ${dados.historico.length} ganhadores no histórico\n\n` +
                `⚠️ Isso substituirá todos os dados atuais!`
            )) return;

            participantes      = dados.participantes;
            todosParticipantes = dados.todosParticipantes || [...dados.participantes];
            vencedoresHistory  = dados.historico;

            salvarParticipantesStorage();
            salvarTodosParticipantesStorage();
            salvarHistoricoStorage();

            atualizarContador();
            renderizarVisualizacao();
            renderizarAbaGanhadores();
            participantsInput.value = participantes.join('\n');

            alert(
                `Backup restaurado com sucesso!\n` +
                `${participantes.length} participantes e ${vencedoresHistory.length} ganhadores carregados.`
            );
        } catch (err) {
            alert('Erro ao ler o arquivo de backup. Verifique se é um arquivo .json válido.');
        }
    };

    reader.readAsText(file);
    importFileInput.value = '';
}


/* ==========================================================================
   4. SORTEIO — Fluxo do sorteio
   ========================================================================== */

function iniciarSorteio() {
    const elegiveis = getElegiveis();
    if (elegiveis.length === 0) return;

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

    let spinCount      = 0;
    const maxSpins     = 40;
    const spinSpeed    = 80;
    const embaralhados = [...getElegiveis()].sort(() => 0.5 - Math.random());

    const rolagemInterval = setInterval(() => {
        elRouletteNames.textContent = embaralhados[spinCount % embaralhados.length];
        spinCount++;

        if (spinCount >= maxSpins) {
            clearInterval(rolagemInterval);
            exibirGol();
        }
    }, spinSpeed);
}

function exibirGol() {
    mudarTela(screens.gol);
    setTimeout(() => exibirPremioAntesDoVencedor(), 1500);
}

function exibirPremioAntesDoVencedor() {
    mudarTela(screens.prizeReveal);
    setTimeout(() => escolherVencedor(), 2500);
}

function escolherVencedor() {
    const elegiveis   = getElegiveis();
    const randomIndex = Math.floor(Math.random() * elegiveis.length);
    const vencedor    = elegiveis[randomIndex];

    // Remove da lista principal de participantes
    const idxNaLista = participantes.indexOf(vencedor);
    if (idxNaLista !== -1) participantes.splice(idxNaLista, 1);

    vencedoresHistory.push({
        nome: vencedor,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        data: new Date().toLocaleDateString('pt-BR'),
    });

    salvarHistoricoStorage();
    salvarParticipantesStorage();
    atualizarHistorico();

    elWinnerName.textContent = vencedor;
    mudarTela(screens.winner);

    setTimeout(() => {
        document.querySelector('.winner-content').classList.add('show');
        lancarConfetes();
    }, 100);
}


/* ==========================================================================
   5. EFFECTS — Efeitos visuais
   ========================================================================== */

// --- Confetes ---

function lancarConfetes() {
    const duration     = 4000;
    const animationEnd = Date.now() + duration;
    const defaults     = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#FFD700', '#008000', '#FFCC00', '#ffffff'],
        }));

        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#FFD700', '#008000', '#FFCC00', '#ffffff'],
        }));
    }, 250);

    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFCC00'],
    });
}

// --- Brilho sutil que segue o cursor ---

(function inicializarBrilhoMouse() {
    const glowCanvas = document.getElementById('glow-canvas');
    if (!glowCanvas) return;

    const ctx = glowCanvas.getContext('2d');

    function resize() {
        glowCanvas.width  = glowCanvas.offsetWidth;
        glowCanvas.height = glowCanvas.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    let mouseX  = -1000, mouseY  = -1000;
    let smoothX = -1000, smoothY = -1000;

    document.addEventListener('mousemove', (e) => {
        const rect = glowCanvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    document.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    function animate() {
        ctx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);

        smoothX += (mouseX - smoothX) * 0.05;
        smoothY += (mouseY - smoothY) * 0.05;

        if (mouseX > 0) {
            const glow = ctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, 300);
            glow.addColorStop(0,   'rgba(255, 215, 0, 0.045)');
            glow.addColorStop(0.4, 'rgba(80, 20, 10, 0.025)');
            glow.addColorStop(1,   'rgba(0, 0, 0, 0)');

            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, glowCanvas.width, glowCanvas.height);
        }

        requestAnimationFrame(animate);
    }

    animate();
})();


/* ==========================================================================
   6. INIT — Inicialização
   ========================================================================== */

function init() {
    atualizarContador();

    // Botões principais
    btnSortear.addEventListener('click', iniciarSorteio);
    btnNovoSorteio.addEventListener('click', resetParaHome);
    btnFullscreen.addEventListener('click', toggleFullScreen);

    // Tabs do modal
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');
        });
    });

    // Modal de configuração
    btnConfig.addEventListener('click', abrirModalConfig);
    btnCloseConfig.addEventListener('click', () => configModal.classList.remove('active'));
    btnSaveParticipants.addEventListener('click', salvarParticipantes);

    // Modal de histórico
    btnHistorico.addEventListener('click', () => {
        atualizarHistorico();
        historyModal.classList.add('active');
    });
    btnCloseHistory.addEventListener('click', () => historyModal.classList.remove('active'));
    btnClearHistory.addEventListener('click', limparHistorico);

    // Overlay de ganhadores
    btnShowOverlay.addEventListener('click', mostrarOverlayGanhadores);
    btnCloseOverlay.addEventListener('click', () => winnersOverlay.classList.add('hidden'));

    // Backup
    btnExportBackup.addEventListener('click', exportarBackup);
    btnImportBackup.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importarBackup);

    // Ganhador manual (aba Ganhadores + aba Editar Lista)
    btnAddManualWinner.addEventListener('click', adicionarGanhadorManual);
    btnEditAddWinner.addEventListener('click', () => {
        adicionarGanhadorManualGenerico(editManualWinnerName, editManualWinnerDate);
    });
}

init();
