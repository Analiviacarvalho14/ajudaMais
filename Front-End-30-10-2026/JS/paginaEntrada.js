let paginaAtual = 1;
const itensPorPagina = 9; 

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



async function carregarImagemImgBB() {
    try {
        const response = await fetch(`instituicao`);
    if (!response.ok) {
        throw new Error(`Erro ao carregar o JSON: ${response.statusText}.`);
    }

    const dados = await response.json();

    } catch (erro) {
        console.error('Erro ao carregar as iamgens:', erro)
    }
    
}

function renderizarCardsOng(instituicoes, container) {
    if (instituicoes.length === 0) {
        container.innerHTML = '<p class="sem-resultados">Nenhuma ONG cadastrada ainda.</p>';
        return;
    }


    // data-cnpj é usado pelo clique (ver ativarCliqueParaRelatorio) para
    // saber para qual relatorioOng.html?cnpj=... levar o usuário.
    container.innerHTML = instituicoes.map(ong => {
        const imagem = ong.imagem && ong.imagem.trim() !== '' ? ong.imagem : FOTO_PADRAO_ONG;
        return `
        <div class="card-ong" data-cnpj="${escaparHtml(ong.cnpj)}">
            <div class="card-header">
                <img class="card-ong-foto" src="${escaparHtml(imagem)}" alt="Foto de ${escaparHtml(ong.nome)}">
                ${escaparHtml(ong.nome)}
            </div>
            <p class="card-desc">${escaparHtml(ong.descricao) || 'Esta ONG ainda não cadastrou uma descrição.'}</p>
        </div>
    `}).join('');
}


function renderizarCardsUrgentes(instituicoes, container) {
    const urgentes = instituicoes.filter(ehProjetoUrgente).slice(0, 3);

    if (urgentes.length === 0) {
        container.innerHTML = '<p class="sem-resultados">Nenhum projeto urgente no momento.</p>';
        return;
    }

    container.innerHTML = urgentes.map(ong => {
        const imagem = ong.imagem && ong.imagem.trim() !== '' ? ong.imagem : FOTO_PADRAO_ONG;
        return `
            <div class="card-urgente ${(ong.urgencia || '').toLowerCase()}" data-cnpj="${escaparHtml(ong.cnpj)}">
                <img src="${escaparHtml(imagem)}" width="64" height="64" alt="Foto de ${escaparHtml(ong.nome)}">
                <div class="info-principal">
                    <strong>${escaparHtml(ong.nome)}</strong>
                    <span>${escaparHtml(ong.descricao) || 'Sem descrição cadastrada.'}</span>
                </div>
                <div class="info-necessidades">
                    <strong>NECESSIDADES:</strong>
                    <span>${escaparHtml(ong.necessidades) || 'Não informado'}</span>
                </div>
            </div>
    `}).join('');
}

// Um único listener por container (delegação de evento) em vez de um
// onclick por card — funciona mesmo depois que renderizarCardsOng/
// renderizarCardsUrgentes trocam o innerHTML de novo.
function ativarCliqueParaRelatorio(container) {
    if (!container) return;

    container.addEventListener('click', (evento) => {
        const card = evento.target.closest('.card-ong, .card-urgente');
        if (!card) return;

        const cnpj = card.getAttribute('data-cnpj');
        if (!cnpj) return;

        window.location.href = `relatorioOng.html?cnpj=${encodeURIComponent(cnpj)}`;
    });
}

// Inicialização das visualizações
document.addEventListener('DOMContentLoaded', async () => {
    const gridOngs = document.getElementById('grid-ongs');
    const containerPaginacao = document.getElementById('paginacao-ongs');
    const listaUrgentes = document.getElementById('lista-urgentes');
    
    if (!gridOngs && !listaUrgentes) return;

    const instituicoes = await buscarInstituicoes();

    if (listaUrgentes) {
        renderizarCardsUrgentes(instituicoes, listaUrgentes);
        ativarCliqueParaRelatorio(listaUrgentes);
    }

    function atualizarGridComPaginacao() {
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const ongsPaginadas = instituicoes.slice(inicio, fim);

        renderizarCardsOng(ongsPaginadas, gridOngs);
        renderizarControlesPaginacao(instituicoes.length, containerPaginacao, atualizarGridComPaginacao);
    }

    if (gridOngs) {
        atualizarGridComPaginacao();
        ativarCliqueParaRelatorio(gridOngs);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-projetos-urgentes');
    if (!container) return;

    const instituicoes = await buscarInstituicoes();
    const urgentes = ordenarPorUrgencia(instituicoes.filter(ehProjetoUrgente));

    renderizarCardsUrgentes(urgentes, container);
});
