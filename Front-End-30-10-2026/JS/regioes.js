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

(function () {
    const TEXTO_REGIAO = {
        'norte': 'Norte',
        'nordeste': 'Nordeste',
        'centro-oeste': 'Centro-Oeste',
        'sudeste': 'Sudeste',
        'sul': 'Sul'
    };

    const filtrosAtivos = new Set();
    let instituicoes = [];

    document.addEventListener('DOMContentLoaded', async () => {
        const container = document.getElementById('lista-ongs');
        if (!container) return;
        const containerPaginacao = document.getElementById('paginacao-ongs');

        instituicoes = await buscarInstituicoes();

        function atualizarGridComPaginacao() {
            const filtradas = obterInstituicoesFiltradas();

            const inicio = (paginaAtual - 1) * itensPorPagina;
            const fim = inicio + itensPorPagina;
            const ongsPaginadas = filtradas.slice(inicio, fim);

            renderizarCartoes(ongsPaginadas, container);
            renderizarControlesPaginacao(filtradas.length, containerPaginacao, atualizarGridComPaginacao);
        }

        function aplicarFiltros() {
            paginaAtual = 1; // Reseta para a primeira página ao alterar o filtro/busca
            atualizarGridComPaginacao();
        }

        ativarFiltro(aplicarFiltros);
        ativarBusca(aplicarFiltros);
        aplicarFiltroDaUrl();

        atualizarGridComPaginacao();
    });

    function normalizar(valor) {
        return (valor || '')
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-');
    }

    // Filtra o array de dados com base na região e no termo de busca
    function obterInstituicoesFiltradas() {
        const inputBusca = document.getElementById('input-busca');
        const termoBusca = inputBusca ? inputBusca.value.toLowerCase().trim() : '';

        return instituicoes.filter(ong => {
            const regiao = normalizar(ong.regiao);
            const passaNoFiltro = filtrosAtivos.size === 0 || filtrosAtivos.has(regiao);

            const textoCompleto = `
                ${ong.nome || ''} 
                ${TEXTO_REGIAO[regiao] || ong.regiao || ''} 
                ${ong.necessidades || ''}
            `.toLowerCase();

            const passaNaBusca = !termoBusca || textoCompleto.includes(termoBusca);

            return passaNoFiltro && passaNaBusca;
        });
    }

    function renderizarCartoes(lista, container) {
        if (lista.length === 0) {
            container.innerHTML = '<p class="sem-resultados">Nenhuma ONG encontrada.</p>';
            return;
        }

        container.innerHTML = lista.map(ong => {
            const regiao = normalizar(ong.regiao);
            const classeUrgencia = (ong.urgencia || '').toLowerCase();
            const imagem = ong.imagem && ong.imagem.trim() !== '' ? ong.imagem : FOTO_PADRAO_ONG;

            return `
                <a href="relatorioOng.html?cnpj=${encodeURIComponent(ong.cnpj)}" class="cartao-ong ${classeUrgencia}" data-regiao="${escaparHtml(regiao)}">
                    <img src="${escaparHtml(imagem)}" width="64" height="64" alt="Foto de ${escaparHtml(ong.nome)}">
                    <div class="informacoes-principais">
                        <strong>${escaparHtml(ong.nome)}</strong>
                        <span>Região: ${escaparHtml(TEXTO_REGIAO[regiao] || ong.regiao) || 'Não informada'}</span>
                    </div>
                    <div class="informacoes-extras">
                        <strong>NECESSIDADE:</strong>
                        <span>${escaparHtml(ong.necessidades) || 'Nenhuma necessidade cadastrada'}</span>
                    </div>
                </a>
            `;
        }).join('');
    }

    function ativarFiltro(aoAlterar) {
        const botoes = document.querySelectorAll('.botao-categoria[data-filtro]');
        const botaoLimpar = document.querySelector('.botao-limpar');

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

                atualizarBotoesAtivos(botoes);
                aoAlterar();
            });
        });

        if (botaoLimpar) {
            botaoLimpar.addEventListener('click', () => {
                filtrosAtivos.clear();
                const inputBusca = document.getElementById('input-busca');
                if (inputBusca) inputBusca.value = '';
                atualizarBotoesAtivos(botoes);
                aoAlterar();
            });
        }
    }

    function atualizarBotoesAtivos(botoes) {
        botoes.forEach(botao => {
            const filtro = botao.getAttribute('data-filtro');
            const ativo = filtro === 'todos' ? filtrosAtivos.size === 0 : filtrosAtivos.has(filtro);
            botao.classList.toggle('ativo', ativo);
        });
    }

    function ativarBusca(aoAlterar) {
        const inputBusca = document.getElementById('input-busca');
        if (inputBusca) inputBusca.addEventListener('input', aoAlterar);
    }

    function aplicarFiltroDaUrl() {
        const params = new URLSearchParams(window.location.search);
        const valor = normalizar(params.get('regiao'));
        if (!valor) return;

        const botao = document.querySelector(`.botao-categoria[data-filtro="${valor}"]`);
        if (botao) botao.click();
    }
})();