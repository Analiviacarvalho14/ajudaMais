const API_URL = "http://localhost:8080/instituicao"; 
let senhaReal = "";

function obterSessao() {
    const ongSalva = localStorage.getItem("ajudaGovSessao") || sessionStorage.getItem("ajudaGovSessao");
    return ongSalva ? JSON.parse(ongSalva) : null;
}

document.addEventListener("DOMContentLoaded", () => {
    const sessao = obterSessao();
    
    carregarDadosOng(sessao);

    if (document.getElementById("cnpj")) {
        carregarDadosOng(sessao);

        const btnToggleView = document.getElementById("btn-toggle-senha-view");
        if (btnToggleView) {
            btnToggleView.addEventListener("click", toggleSenhaVisualizacao);
        }

        const btnLogout = document.getElementById("btn-logout");
        if (btnLogout) {
            btnLogout.addEventListener("click", encerrarSessao);
        }

         const btnReturn = document.getElementById("btn-return");
        if (btnReturn) {
            btnReturn.addEventListener("click",voltar);
        }
    }
    
    //Edita ong
    const formEdicao = document.getElementById("form-perfil-ong");
    if (formEdicao) {
        carregarDadosEdicao(sessao);

        const inputTelefone = document.getElementById("telefone");
        if (inputTelefone) {
            inputTelefone.addEventListener("input", mascaraTelefone);
        }

        formEdicao.addEventListener("submit", (e) => {
            e.preventDefault();
            salvarAlteracoes();
        });

        const btnToggleSenha = document.getElementById("btn-toggle-senha");
        if (btnToggleSenha) {
            btnToggleSenha.addEventListener("click", () => togglePasswordVisibility('senha'));
        }

        const btnToggleConfirmar = document.getElementById("btn-toggle-confirmar");
        if (btnToggleConfirmar) {
            btnToggleConfirmar.addEventListener("click", () => togglePasswordVisibility('confirmarSenha'));
        }
    }
});

async function carregarDadosEdicao(sessao) {
    try {
        const ong = await buscarOngLogadaNoBanco(sessao);

        if (ong) {
            document.getElementById("cnpj").value = ong.cnpj || "";
        document.getElementById("nomeRazaoSocial").value = ong.nome || "";
        document.getElementById("email").value = ong.email || "";
        document.getElementById("telefone").value = ong.telefone || "";
        document.getElementById("descricao").value = ong.descricao || "";
        document.getElementById("regiao").value = ong.regiao || "";
        document.getElementById("categoria").value = ong.atuacao || "";
        document.getElementById("urgencia").value = ong.urgencia || "";
        document.getElementById("pix").value = ong.pix || "";

        senhaReal = ong.senha || "";
        }
    } catch (error) {
        console.error("Erro ao carregar formulário de edição:", error);
    }
}

async function carregarDadosOng(sessao) {
    try {
        const ong = await buscarOngLogadaNoBanco(sessao);

        if (!ong) {
            alert("Não foi possível localizar a ONG referente ao e-mail logado.");
            return;
        }

        console.log("ONG carregada com sucesso via e-mail:", ong);

        document.getElementById("cnpj").value = ong.cnpj || "";
        document.getElementById("nomeRazaoSocial").value = ong.nome || "";
        document.getElementById("email").value = ong.email || "";
        document.getElementById("telefone").value = ong.telefone || "";
        document.getElementById("descricao").value = ong.descricao || "";
        document.getElementById("regiao").value = ong.regiao || "";
        document.getElementById("categoria").value = ong.atuacao || "";
        document.getElementById("urgencia").value = ong.urgencia || "";
        

        senhaReal = ong.senha || "";

    } catch (error) {
        console.error("Erro ao carregar perfil da ONG:", error);
    }
}

async function salvarAlteracoes() {
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (senha !== confirmarSenha) {
        alert("As senhas informadas não coincidem!");
        return;
    }

    const cnpjInput = document.getElementById("cnpj").value;

    const cnpjLimpo = cnpjInput.replace(/\D/g, "");

    if (!cnpjLimpo) {
        alert("CNPJ não encontrado!");
        return;
    }

    const ongDTO = {
        cnpj: cnpjInput,
        nome: document.getElementById("nomeRazaoSocial").value,
        email: document.getElementById("email").value,
        senha: senha,
        pix: document.getElementById("pix").value,
        telefone: document.getElementById("telefone").value,
        atuacao: document.getElementById("categoria").value,
        regiao: document.getElementById("regiao").value,
        descricao: document.getElementById("descricao").value,
        urgencia: document.getElementById("urgencia").value
    };

    try {
        const response = await fetch(`${API_URL}/${cnpjInput}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ongDTO)
        });

        if (response.ok) {
            alert("Informações da ONG atualizadas com sucesso!");
            window.location.href = "perfilOng.html";
        } else {
            alert("Falha ao salvar as alterações. Verifique os dados fornecidos.");
        }
    } catch (error) {
        console.error("Erro ao atualizar perfil da ONG:", error);
        alert("Erro de conexão com o servidor Spring Boot.");
    }
}

async function buscarOngLogadaNoBanco(sessao) {
    if (!sessao || !sessao.email) {
        console.warn("Nenhum e-mail encontrado na sessão local.");
        return null;
    }

    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

    const listaOngs = await resposta.json();

    if (!Array.isArray(listaOngs)) return null;

    const emailSessao = String(sessao.email).trim().toLowerCase();
    
    return listaOngs.find(o => o.email && String(o.email).trim().toLowerCase() === emailSessao);
}

function encerrarSessao(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (confirm("Tem certeza que deseja sair da conta?")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "paginaEntrada.html";
    }
}

function voltar() {
    window.location.href = "paginaEntrada.html"
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.type = field.type === "password" ? "text" : "password";
    }
}

function mascaraCNPJ(e) {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");
    e.target.value = value;
}

function mascaraTelefone(e) {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    e.target.value = value;
}