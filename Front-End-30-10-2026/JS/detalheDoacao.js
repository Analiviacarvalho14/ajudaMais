document.addEventListener("DOMContentLoaded", () => {
    // Banco de opções por categoria
    const opcoesPorCategoria = {
        roupas: [
            "Roupa de cama",
            "Roupa de frio",
            "Roupa de banho",
            "Roupa infantil",
            "Roupa masculina",
            "Roupa feminina",
            "Calçados"
        ],
        alimentos: [
            "Arroz (kg)",
            "Feijão (kg)",
            "Macarrão (pct)",
            "Óleo (un)",
            "Leite (L)",
            "Cesta Básica",
            "Açúcar (kg)"
        ],
        higiene: [
            "Sabonete",
            "Escova de dentes",
            "Pasta de dentes",
            "Papel higiênico",
            "Shampoo"
        ],
        outra: [
            "Brinquedos",
            "Produtos de Limpeza",
            "Móveis",
            "Ração para animais"
        ]
    };

    let contadorCaixas = 2;

    // Função para preencher um select de tipo com opções
    function preencherOpcoesSelect(selectElement, categoria) {
        if (!selectElement) return;
        const listaItens = opcoesPorCategoria[categoria] || opcoesPorCategoria['outra'];
        selectElement.innerHTML = '<option value="" disabled selected>Selecione</option>';
        listaItens.forEach(item => {
            const option = document.createElement('option');
            option.value = item.toLowerCase().replace(/[^a-z0-9]/g, '');
            option.textContent = item;
            selectElement.appendChild(option);
        });
    }

    // Inicializa as duas caixas padrão (Roupas e Alimentos)
    preencherOpcoesSelect(document.getElementById('tipo-roupas'), 'roupas');
    preencherOpcoesSelect(document.getElementById('tipo-alimentos'), 'alimentos');

    // Lógica para Adicionar Nova Caixa de Doação
    const btnAddTabela = document.getElementById('btn-add-tabela');
    const containerCards = document.getElementById('container-cards');

    if (btnAddTabela && containerCards) {
        btnAddTabela.addEventListener('click', () => {
            contadorCaixas++;
            const idTipo = `tipo-extra-${contadorCaixas}`;
            const idQtd = `qtd-extra-${contadorCaixas}`;

            const novaCaixa = document.createElement('div');
            novaCaixa.className = 'box-detalhe-item';
            novaCaixa.setAttribute('data-categoria', 'higiene');

            novaCaixa.innerHTML = `
                <button type="button" class="btn-remover-card" title="Remover este bloco">✕</button>
                <h2 class="box-item-title">Higiene / Outros</h2>
                
                <div class="box-item-row">
                    <div class="box-row-left">
                        <label for="${idTipo}">Tipo</label>
                        <div class="select-wrapper">
                            <select id="${idTipo}" class="custom-select select-tipo">
                                <option value="" disabled selected>Selecione</option>
                            </select>
                            <span class="custom-arrow">⌵</span>
                        </div>
                    </div>
                </div>

                <div class="box-item-row">
                    <div class="box-row-left">
                        <label for="${idQtd}">Quantidade</label>
                        <div class="select-wrapper">
                            <select id="${idQtd}" class="custom-select select-qtd">
                                <option value="" disabled selected>0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
                            </select>
                            <span class="custom-arrow">⌵</span>
                        </div>
                    </div>
                </div>
            `;

            containerCards.appendChild(novaCaixa);

            // Preenche os itens do novo select
            const selectNovo = document.getElementById(idTipo);
            preencherOpcoesSelect(selectNovo, 'higiene');

            // Botão para remover a caixa criada
            novaCaixa.querySelector('.btn-remover-card').addEventListener('click', () => {
                novaCaixa.remove();
            });
        });
    }

    // Lógica do Botão Doar
    const btnDoar = document.getElementById('btn-doar');

    if (btnDoar) {
        btnDoar.addEventListener('click', () => {
            const caixas = document.querySelectorAll('.box-detalhe-item');
            const itensDoados = [];

            caixas.forEach(caixa => {
                const selectTipo = caixa.querySelector('.select-tipo');
                const selectQtd = caixa.querySelector('.select-qtd');

                if (selectTipo && selectQtd && selectTipo.value !== "" && selectQtd.value !== "") {
                    const nomeItem = selectTipo.options[selectTipo.selectedIndex].text;
                    const qtd = selectQtd.value;
                    itensDoados.push(`${nomeItem} (${qtd} un)`);
                }
            });

            if (itensDoados.length === 0) {
                alert("Por favor, selecione pelo menos um item e a respetiva quantidade antes de doar!");
                return;
            }

            let resumo = "Doação realizada com sucesso!\n\nItens doados:\n- " + itensDoados.join("\n- ");
            alert(resumo);

            const querDoarMais = confirm("Deseja fazer mais alguma doação?");

            if (querDoarMais) {
                // Reseta todos os campos
                document.querySelectorAll('.select-tipo, .select-qtd').forEach(sel => sel.value = "");
            } else {
                alert("Obrigado pela sua doação!");
                window.location.href = "paginaEntrada.html";
            }
        });
    }
});