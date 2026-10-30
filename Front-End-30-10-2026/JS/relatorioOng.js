const API_BASE_URL = `http://localhost:8080`;

// ===== ESTADO GLOBAL =====
let chartInstance = null;
let doacoesGlobais = [];
let cnpjAtual = null;
let instituicaoAtual = null; // objeto completo da ONG (vem do GET /instituicao/{cnpj})
let periodoAtual = 'hora';
let valorDoacaoAtual = 0;

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    cnpjAtual = urlParams.get('cnpj');

    initChart();
    carregarInstituicao(cnpjAtual);
    carregarDoacoes();

    // Atualiza o gráfico a cada minuto (a janela de "última hora" anda sozinha)
    setInterval(() => filtrarFinanceiro(periodoAtual), 60000);
});

// ===== HELPERS =====

// Data + hora no formato "dd/mm/aaaa HH:mm:ss".
// Como a entidade Doacao só tem o campo String "data", o horário vai junto nele.
function formatarDataHora(d) {
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// PARSER DE DATA (formatos antigos: dd/mm/aaaa, aaaa-mm-dd, ddmmaaaa)
function parseData(dataStr) {
    if (!dataStr) return new Date(0);
    if (dataStr.includes('/')) {
        // "dd/mm/aaaa" ou "dd/mm/aaaa HH:mm:ss"
        const [parteData, parteHora] = dataStr.trim().split(' ');
        const [d, m, a] = parteData.split('/');
        const [hh = 0, mm = 0, ss = 0] = (parteHora || '').split(':').map(Number);
        return new Date(a, m - 1, d, hh, mm, ss);
    }
    if (dataStr.includes('-')) {
        // "aaaa-mm-dd" puro seria lido como UTC; força horário local
        if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
            const [a, m, d] = dataStr.split('-');
            return new Date(a, m - 1, d);
        }
        return new Date(dataStr);
    }
    if (dataStr.length === 8 && !isNaN(dataStr)) {
        const d = dataStr.substring(0, 2);
        const m = dataStr.substring(2, 4);
        const a = dataStr.substring(4, 8);
        return new Date(a, m - 1, d);
    }
    return new Date(dataStr);
}

function dataDaDoacao(d) {
    return parseData(d.data);
}

// Doações antigas (só "dd/mm/aaaa") não têm horário
function temHorario(d) {
    return /\d{2}:\d{2}/.test(d.data || '');
}

function formatarQuando(d) {
    if (!d.data) return '-';
    // mostra sem os segundos: "07/10/2026 14:32"
    return temHorario(d) ? d.data.slice(0, 16) : d.data;
}

// ===== 1. INICIALIZAÇÃO DO GRÁFICO =====
function initChart() {
    const ctx = document.getElementById('financialChart').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(26, 91, 140, 0.4)');
    gradient.addColorStop(1, 'rgba(26, 91, 140, 0.0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Ganhos (R$)',
                data: [],
                borderColor: '#1a5b8c',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#1a5b8c',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` Total: R$ ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 12 }, maxTicksLimit: 12 }
                },
                y: {
                    grid: { color: '#f0f0f0' },
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'R$ ' + value;
                        }
                    }
                }
            }
        }
    });
}

// ===== 2. PROCESSAMENTO POR PERÍODO =====
function processarDadosPorPeriodo(doacoes, periodo) {
    const hoje = new Date();
    let labels = [];
    let valores = [];

    if (periodo === 'hora') {
        // Última hora, minuto a minuto (60 pontos)
        const base = new Date();
        base.setSeconds(0, 0);

        for (let i = 59; i >= 0; i--) {
            const m = new Date(base.getTime() - i * 60000);
            labels.push(m.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
            valores.push(0);
        }

        doacoes.forEach(d => {
            if (!temHorario(d)) return; // doações antigas sem horário não entram aqui
            const dt = dataDaDoacao(d);
            dt.setSeconds(0, 0);
            const diff = Math.round((base - dt) / 60000);
            if (diff >= 0 && diff < 60) {
                valores[59 - diff] += Number(d.quantidade) || 0;
            }
        });

    } else if (periodo === 'hoje') {
        labels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
        valores = [0, 0, 0, 0, 0, 0, 0, 0];

        const horaAtual = hoje.getHours();

        const totalHoje = doacoes
            .filter(d => dataDaDoacao(d).toDateString() === hoje.toDateString())
            .reduce((acc, d) => acc + (Number(d.quantidade) || 0), 0);

        let indiceHora = 0;
        if (horaAtual >= 22) indiceHora = 7;
        else if (horaAtual >= 20) indiceHora = 6;
        else if (horaAtual >= 18) indiceHora = 5;
        else if (horaAtual >= 16) indiceHora = 4;
        else if (horaAtual >= 14) indiceHora = 3;
        else if (horaAtual >= 12) indiceHora = 2;
        else if (horaAtual >= 10) indiceHora = 1;
        else indiceHora = 0;

        for (let i = indiceHora; i < valores.length; i++) {
            valores[i] = totalHoje;
        }

    } else if (periodo === 'semana') {
        for (let i = 6; i >= 0; i--) {
            const dia = new Date();
            dia.setDate(hoje.getDate() - i);
            labels.push(dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));

            const somaDia = doacoes
                .filter(d => dataDaDoacao(d).toDateString() === dia.toDateString())
                .reduce((acc, d) => acc + (Number(d.quantidade) || 0), 0);
            valores.push(somaDia);
        }

    } else if (periodo === 'mes') {
        labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        valores = [0, 0, 0, 0];

        doacoes.forEach(d => {
            const dt = dataDaDoacao(d);
            const diffDias = Math.floor((hoje - dt) / (1000 * 60 * 60 * 24));
            if (diffDias >= 0 && diffDias < 28) {
                const semanaIdx = 3 - Math.floor(diffDias / 7);
                valores[semanaIdx] += (Number(d.quantidade) || 0);
            }
        });

    } else if (periodo === 'ano') {
        labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        valores = new Array(12).fill(0);

        doacoes.forEach(d => {
            const dt = dataDaDoacao(d);
            if (dt.getFullYear() === hoje.getFullYear()) {
                valores[dt.getMonth()] += (Number(d.quantidade) || 0);
            }
        });
    }

    return { labels, valores };
}

// ===== FILTRO FINANCEIRO =====
function filtrarFinanceiro(periodo, btnElement) {
    periodoAtual = periodo;

    if (btnElement) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }

    const { labels, valores } = processarDadosPorPeriodo(doacoesGlobais, periodo);

    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = valores;
        chartInstance.update();
    }
}

// ===== 3. DOAÇÕES (POR INSTITUIÇÃO) =====
async function carregarDoacoes() {
    const extratoTable = document.getElementById('extratoTable');

    if (!cnpjAtual) {
        extratoTable.innerHTML = '<tr><td colspan="3">Nenhuma instituição selecionada.</td></tr>';
        return;
    }

    try {
        // O back-end devolve todas as doações; filtramos as DESTA instituição pelo CNPJ
        const response = await fetch(`${API_BASE_URL}/doacao`);
        if (response.ok) {
            const todas = await response.json();
            const cnpjLimpo = String(cnpjAtual).replace(/\D/g, '');
            doacoesGlobais = todas.filter(d =>
                String(d.instituicao?.cnpj || '').replace(/\D/g, '') === cnpjLimpo);
            renderizarExtrato(doacoesGlobais);
            filtrarFinanceiro(periodoAtual); // mantém a aba selecionada
        } else {
            extratoTable.innerHTML = '<tr><td colspan="3">Erro ao carregar extrato.</td></tr>';
        }
    } catch (error) {
        console.error("Erro ao buscar doações:", error);
        extratoTable.innerHTML = '<tr><td colspan="3">Erro ao carregar extrato.</td></tr>';
    }
}

async function confirmarDoacaoSimulada() {
    const agora = new Date();

    if (!instituicaoAtual) {
        alert("Os dados da instituição ainda não foram carregados. Tente novamente.");
        return;
    }

    // IMPORTANTE: o back-end usa cascade MERGE em Doacao.instituicao. Se mandarmos só o
    // CNPJ, o merge copia campos nulos por cima da ONG. Por isso mandamos o objeto completo,
    // exatamente como veio do GET /instituicao/{cnpj}.
    const novaDoacao = {
        tipo: "Pix",
        data: formatarDataHora(agora),
        quantidade: valorDoacaoAtual,
        instituicao: instituicaoAtual
    };

    try {
        const response = await fetch(`${API_BASE_URL}/doacao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaDoacao)
        });

        if (response.ok) {
            fecharModalDoacao();
            await carregarDoacoes(); // Recarrega do servidor

            setTimeout(() => {
                alert(`🎉 Doação de R$ ${valorDoacaoAtual.toFixed(2)} recebida! O gráfico foi atualizado.`);
            }, 300);
        } else {
            alert("Erro ao registrar a doação.");
        }
    } catch (error) {
        console.error("Erro ao enviar doação:", error);
        alert("Erro de conexão com o servidor.");
    }
}

// ===== EXTRATO (mais recentes primeiro) =====
function renderizarExtrato(doacoes) {
    const extratoTable = document.getElementById('extratoTable');
    extratoTable.innerHTML = '';

    if (!doacoes || doacoes.length === 0) {
        extratoTable.innerHTML = '<tr><td colspan="3">Nenhuma doação registrada.</td></tr>';
        return;
    }

    [...doacoes]
        .sort((a, b) => dataDaDoacao(b) - dataDaDoacao(a))
        .forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatarQuando(d)}</td>
                <td>${d.tipo || '-'}</td>
                <td>R$ ${Number(d.quantidade || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            `;
            extratoTable.appendChild(tr);
        });
}

// ===== DADOS DA INSTITUIÇÃO =====
async function carregarInstituicao(cnpj) {
    if (!cnpj) {
        console.warn("Nenhum CNPJ informado na URL.");
        document.getElementById('historiaText').innerText = "Nenhuma instituição selecionada.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/instituicao/${cnpj}`);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const dados = await response.json();

        // Trata o retorno caso a API devolva um Array ou um Objeto único
        let inst = null;
        if (Array.isArray(dados)) {
            inst = dados.find(i => String(i.cnpj).replace(/\D/g, '') === String(cnpj).replace(/\D/g, '')) || dados[0];
        } else {
            inst = dados;
        }

        if (inst) {
            instituicaoAtual = inst;
            const imagem = inst.imagem && inst.imagem.trim() !== '' ? inst.imagem : FOTO_PADRAO_ONG;
            mostrarConta(inst.contaBancaria);
            document.getElementById('historiaText').innerText = inst.descricao || "Sem história cadastrada.";
            document.getElementById('nomeOngText').innerText = inst.nome || "QUEM SOMOS E NOSSA MISSÃO";
            document.getElementById('descricaoText').innerText = inst.atuacao || inst.descricao || "";
            document.getElementById('numText').innerText = inst.telefone || "";
            document.getElementById('imgLogo').innerHTML =
                `<img id="logo" src="${imagem}" alt="Logo ONG">`;
        } else {
            document.getElementById('historiaText').innerText = "Nenhuma instituição encontrada para este CNPJ.";
            document.getElementById('descricaoText').innerText = "Sem dados disponíveis.";
        }
    } catch (error) {
        console.error("Erro de conexão com a API /instituicao:", error);
        document.getElementById('historiaText').innerText = "Erro de conexão com o servidor.";
    }
}

// ===== CONTA BANCÁRIA =====
// A conta já vem dentro da instituição (Instituicao.contaBancaria), então não precisa de outro fetch.
function mostrarConta(conta) {
    if (!conta) return;
    document.getElementById('infoConta').innerText =
        `Ag: ${conta.agencia || ''} | C/C: ${conta.numeroConta || ''}`;
}

// ===== MODAL DE DOAÇÃO =====
function fazerDoacaoRapida() {
    abrirModalDoacao();
}

function abrirModalDoacao() {
    document.getElementById('modalDoacao').style.display = 'flex';
    document.getElementById('etapaValor').style.display = 'block';
    document.getElementById('etapaQrCode').style.display = 'none';
    document.getElementById('valorDoacaoInput').value = '';
}

function fecharModalDoacao() {
    document.getElementById('modalDoacao').style.display = 'none';
}

function gerarQrCodePix() {
    const inputValor = document.getElementById('valorDoacaoInput').value;
    // Doacao.quantidade é int no back-end, então usamos reais inteiros
    const valor = Math.round(parseFloat(inputValor));

    if (!valor || valor <= 0) {
        alert("Por favor, digite um valor válido.");
        return;
    }

    valorDoacaoAtual = valor;

    document.getElementById('valorConfirmadoText').innerText =
        `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    const pixPayload = `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${valor.toFixed(2)}5802BR5913AjudaGov ONG6008SAO PAULO62070503***6304`;

    document.getElementById('pixCopiaCola').value = pixPayload;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`;
    document.getElementById('qrCodeImg').src = qrCodeUrl;

    document.getElementById('etapaValor').style.display = 'none';
    document.getElementById('etapaQrCode').style.display = 'block';
}

function copiarPix() {
    const inputPix = document.getElementById('pixCopiaCola');
    inputPix.select();
    document.execCommand('copy');
    alert("Código Pix copiado para a área de transferência!");
}

// ===== PDF DO EXTRATO =====
function gerarPdfExtrato() {
    if (!doacoesGlobais || doacoesGlobais.length === 0) {
        alert("Não há registros no extrato para gerar o PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. Cabeçalho do Relatório
    const nomeOng = document.getElementById('nomeOngText')?.innerText || "AjudaGov - Relatório da ONG";

    doc.setFontSize(16);
    doc.setTextColor(26, 91, 140);
    doc.text(nomeOng, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text("Relatório Oficial de Extrato de Doações", 14, 28);

    const dataAtual = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Emissão: ${dataAtual}`, 14, 34);

    doc.setDrawColor(200);
    doc.line(14, 38, 196, 38);

    // 2. Linhas do extrato (mais recentes primeiro)
    const linhasTabela = [...doacoesGlobais]
        .sort((a, b) => dataDaDoacao(b) - dataDaDoacao(a))
        .map(d => [
            formatarQuando(d),
            d.tipo || '-',
            `R$ ${Number(d.quantidade || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ]);

    const totalAcumulado = doacoesGlobais.reduce((acc, d) => acc + (Number(d.quantidade) || 0), 0);

    // 3. Tabela via AutoTable
    doc.autoTable({
        startY: 42,
        head: [['Data de Entrada', 'Tipo / Método', 'Valor (R$)']],
        body: linhasTabela,
        theme: 'striped',
        headStyles: {
            fillColor: [26, 91, 140],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        foot: [[
            'Total Geral Acumulado',
            '',
            `R$ ${totalAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ]],
        footStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 4
        }
    });

    // 4. Salva o arquivo
    doc.save(`extrato_doacoes_${new Date().toISOString().slice(0, 10)}.pdf`);
}
