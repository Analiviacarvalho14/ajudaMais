let paginaAtual = 1;
const itensPorPagina = 5; 

function renderizarControlesPaginacao(totalItens, containerPaginacao, aoMudarPagina) {
    if (!containerPaginacao) return;

    const totalPaginas = Math.ceil(totalItens / itensPorPagina);

    if (totalPaginas <= 1) {
        containerPaginacao.innerHTML = '';
        return;
    }

    containerPaginacao.innerHTML = `
        <button id="btn-anterior" ${paginaAtual === 1 ? 'disabled' : ''}>Anterior</button>
        <span id="numPagina">Página ${paginaAtual} de ${totalPaginas}</span>
        <button id="btn-proximo" ${paginaAtual === totalPaginas ? 'disabled' : ''}>Próxima</button>
    `;

    const btnAnterior = containerPaginacao.querySelector('#btn-anterior');
    const btnProximo = containerPaginacao.querySelector('#btn-proximo');

    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                aoMudarPagina();
            }
        });
    }

    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                aoMudarPagina();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-projetos-urgentes');
    if (!container) return;
    const containerPaginacao = document.getElementById('paginacao-ongs');

    const instituicoes = await buscarInstituicoes();
    const urgentes = ordenarPorUrgencia(instituicoes.filter(ehProjetoUrgente));
    const filtrosAtivos = new Set();

    function obterProjetosFiltrados() {
        if (filtrosAtivos.size === 0) return urgentes;
        return urgentes.filter(ong => {
            const nivel = (ong.urgencia || '').toLowerCase();
            return filtrosAtivos.has(nivel);
        });
    }

    function atualizarGridComPaginacao() {
        const filtrados = obterProjetosFiltrados();
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const ongsPaginadas = filtrados.slice(inicio, fim);

        renderizarCardsUrgentes(ongsPaginadas, container);
        renderizarControlesPaginacao(filtrados.length, containerPaginacao, atualizarGridComPaginacao);
    }

    function aplicarFiltroRisco() {
        paginaAtual = 1;
        atualizarGridComPaginacao();
    }

    ativarFiltroRisco(filtrosAtivos, aplicarFiltroRisco);
    atualizarGridComPaginacao();
});

function renderizarCardsUrgentes(urgentes, container) {
    if (urgentes.length === 0) {
        container.innerHTML = '<p class="sem-resultados">Nenhum projeto urgente no momento.</p>';
        return;
    }

    container.innerHTML = urgentes.map(ong => {
        const nivel = (ong.urgencia || '').toLowerCase();
        const imagem = ong.imagem && ong.imagem.trim() !== '' ? ong.imagem : FOTO_PADRAO_ONG;
        return `
        <a href="relatorioOng.html?cnpj=${encodeURIComponent(ong.cnpj)}" class="card ${nivel}" data-nivel="${nivel}">
            <img src="${escaparHtml(imagem)}" width="64" height="64" alt="Foto de ${escaparHtml(ong.nome)}">
            <div class="info-main">
                <strong>${escaparHtml(ong.nome)}</strong>
                <span>${escaparHtml(ong.descricao) || 'Sem descrição cadastrada.'}</span>
            </div>
            <div class="info-needs">
                <strong>NECESSIDADES:</strong>
                <span>${escaparHtml(ong.necessidades) || 'Não informado'}</span>
            </div>
        </a>
    `;
    }).join('');
}

function ativarFiltroRisco(filtrosAtivos, aoAlterar) {
    const botoes = document.querySelectorAll('.navegacao-categorias .botao-categoria[data-filtro]');
    const botaoLimpar = document.querySelector('.navegacao-categorias .botao-limpar');

    function atualizarBotoes() {
        botoes.forEach(botao => {
            const filtro = botao.getAttribute('data-filtro');
            const ativo = filtro === 'todos' ? filtrosAtivos.size === 0 : filtrosAtivos.has(filtro);
            botao.classList.toggle('ativo', ativo);
        });
    }

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const filtro = botao.getAttribute('data-filtro');
            if (filtro === 'todos') {
                filtrosAtivos.clear();
            } else if (filtrosAtivos.has(filtro)) {
                filtrosAtivos.delete(filtro);
            } else {
                filtrosAtivos.add(filtro);
            }
            atualizarBotoes();
            aoAlterar();
        });
    });

    if (botaoLimpar) {
        botaoLimpar.addEventListener('click', () => {
            filtrosAtivos.clear();
            atualizarBotoes();
            aoAlterar();
        });
    }
}