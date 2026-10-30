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
    const TEXTO_ATUACAO = {
        saude: 'Saúde',
        crianca: 'Crianças',
        idoso: 'Idosos',
        animal: 'Animais',
        outra: 'Outra'
    };

    const filtrosAtivos = new Set();
    let todasInstituicoes = [];

    // Padroniza e resolve variação de plural/singular do banco de dados
    function normalizar(valor) {
        let norm = (valor || '')
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        if (norm === 'criancas') norm = 'crianca';
        if (norm === 'idosos') norm = 'idoso';
        if (norm === 'animais') norm = 'animal';

        return norm;
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const container = document.getElementById('lista-ongs');
        if (!container) return;

        todasInstituicoes = await buscarInstituicoes();

        ativarFiltro();
        ativarBusca();
        aplicarFiltroDaUrl();
        atualizarGridComPaginacao();
    });

    function renderizarCartoes(instituicoes, container) {
        if (instituicoes.length === 0) {
            container.innerHTML = '<p class="sem-resultados">Nenhuma ONG encontrada para os filtros selecionados.</p>';
            return;
        }

        container.innerHTML = instituicoes.map(ong => {
            const atuacao = normalizar(ong.atuacao);
            const classeUrgencia = (ong.urgencia || '').toLowerCase();
            const imagem = fotoInstituicao === 'function' ? fotoInstituicao(ong) : (ong.imagem || FOTO_PADRAO_ONG);

            return `
                <a href="relatorioOng.html?cnpj=${encodeURIComponent(ong.cnpj)}" class="cartao-ong ${classeUrgencia}" data-categoria="${escaparHtml(atuacao)}">
                    <img src="${escaparHtml(imagem)}" width="64" height="64" alt="Foto de ${escaparHtml(ong.nome)}">
                    <div class="informacoes-principais">
                        <strong>${escaparHtml(ong.nome)}</strong>
                        <span>Atuação: ${escaparHtml(TEXTO_ATUACAO[atuacao] || ong.atuacao) || 'Não informado'}</span>
                    </div>
                    <div class="informacoes-extras">
                        <strong>NECESSIDADE:</strong>
                        <span>${escaparHtml(ong.necessidades) || 'Nenhuma necessidade cadastrada'}</span>
                    </div>
                </a>
            `;
        }).join('');
    }

    function obterInstituicoesFiltradas() {
        const inputBusca = document.getElementById('input-busca');
        const termoBusca = inputBusca ? normalizar(inputBusca.value) : '';

        return todasInstituicoes.filter(ong => {
            const atuacaoOng = normalizar(ong.atuacao);
            
            // Passa se não houver filtro ativo ou se o filtro selecionado bater
            const passaNoFiltro = filtrosAtivos.size === 0 || filtrosAtivos.has(atuacaoOng);

            // Filtro por termo digitado na caixa de pesquisa
            const textoCompleto = normalizar(`${ong.nome} ${ong.atuacao} ${ong.necessidades}`);
            const passaNaBusca = !termoBusca || textoCompleto.includes(termoBusca);

            return passaNoFiltro && passaNaBusca;
        });
    }

    function atualizarGridComPaginacao() {
        const container = document.getElementById('lista-ongs');
        const containerPaginacao = document.getElementById('paginacao-ongs');
        if (!container) return;

        const instituicoesFiltradas = obterInstituicoesFiltradas();

        const totalPaginas = Math.ceil(instituicoesFiltradas.length / itensPorPagina) || 1;
        if (paginaAtual > totalPaginas) paginaAtual = 1;

        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const ongsPaginadas = instituicoesFiltradas.slice(inicio, fim);

        renderizarCartoes(ongsPaginadas, container);
        renderizarControlesPaginacao(instituicoesFiltradas.length, containerPaginacao, atualizarGridComPaginacao);
    }

    function ativarFiltro() {
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

                paginaAtual = 1; 
                atualizarBotoesAtivos(botoes);
                atualizarGridComPaginacao();
            });
        });

        if (botaoLimpar) {
            botaoLimpar.addEventListener('click', () => {
                filtrosAtivos.clear();
                const inputBusca = document.getElementById('input-busca');
                if (inputBusca) inputBusca.value = '';
                paginaAtual = 1;
                atualizarBotoesAtivos(botoes);
                atualizarGridComPaginacao();
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

    function ativarBusca() {
        const inputBusca = document.getElementById('input-busca');
        if (inputBusca) {
            inputBusca.addEventListener('input', () => {
                paginaAtual = 1;
                atualizarGridComPaginacao();
            });
        }
    }

    function aplicarFiltroDaUrl() {
        const params = new URLSearchParams(window.location.search);
        const valor = normalizar(params.get('categoria') || params.get('cat'));
        if (!valor) return;

        const botoes = document.querySelectorAll('.botao-categoria[data-filtro]');
        const botao = document.querySelector(`.botao-categoria[data-filtro="${valor}"]`);
        if (botao) {
            filtrosAtivos.clear();
            filtrosAtivos.add(valor);
            atualizarBotoesAtivos(botoes);
        }
    }
})();