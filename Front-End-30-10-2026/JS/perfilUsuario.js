const API_URL = "http://localhost:8080/usuario"; 

let senhaReal = "";

// Recupera o objeto salvo no login (localStorage ou sessionStorage)
function obterSessao() {
    const usuarioSalvo = localStorage.getItem("ajudaGovSessao") || sessionStorage.getItem("ajudaGovSessao");
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
}

document.addEventListener("DOMContentLoaded", () => {
    const sessao = obterSessao();

    // Visualização do Perfil
    if (document.getElementById("view-cpf")) {
        carregarPerfilVisualizacao(sessao);

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
            btnReturn.addEventListener("click", voltar);
        }
    }

    // Edição do Perfil
    const formEdicao = document.getElementById("form-perfil-usuario");
    if (formEdicao) {
        carregarDadosEdicao(sessao);

        const inputTelefone = document.getElementById("telefone");
        if (inputTelefone) {
            inputTelefone.addEventListener("input", mascaraTelefone);
        }

        formEdicao.addEventListener("submit", (e) => {
            e.preventDefault();
            salvarAlteracoes(sessao);
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

// Busca na API e filtra ESTRITAMENTE pelo E-MAIL gravado no login
async function buscarUsuarioLogadoNoBanco(sessao) {
    if (!sessao || !sessao.email) {
        console.warn("Nenhum e-mail encontrado na sessão local.");
        return null;
    }

    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

    const listaUsuarios = await resposta.json();

    if (!Array.isArray(listaUsuarios)) return null;

    // Filtro exato ignorando diferenças de letras maiúsculas/minúsculas e espaços extras
    const emailSessao = String(sessao.email).trim().toLowerCase();
    
    return listaUsuarios.find(u => u.email && String(u.email).trim().toLowerCase() === emailSessao);
}

// Carrega os dados na tela de Visualização
async function carregarPerfilVisualizacao(sessao) {
    try {
        const usuario = await buscarUsuarioLogadoNoBanco(sessao);

        if (!usuario) {
            alert("Não foi possível localizar o usuário referente ao e-mail logado.");
            return;
        }

        console.log("Usuário carregado com sucesso via e-mail:", usuario);

        if (document.getElementById("view-cpf")) document.getElementById("view-cpf").textContent = usuario.cpf || "Não informado";
        if (document.getElementById("view-nome")) document.getElementById("view-nome").textContent = usuario.nome || "Não informado";
        if (document.getElementById("view-email")) document.getElementById("view-email").textContent = usuario.email || "Não informado";
        if (document.getElementById("view-telefone")) document.getElementById("view-telefone").textContent = usuario.telefone || "Não informado";

        senhaReal = usuario.senha || "";

    } catch (erro) {
        console.error("Erro ao carregar dados do perfil:", erro);
        alert("Erro ao conectar com o servidor para buscar os dados do usuário.");
    }
}

// Carrega os dados no formulário de Edição
async function carregarDadosEdicao(sessao) {
    try {
        const usuario = await buscarUsuarioLogadoNoBanco(sessao);

        if (usuario) {
            if (document.getElementById("cpf")) document.getElementById("cpf").value = usuario.cpf || "";
            if (document.getElementById("nome")) document.getElementById("nome").value = usuario.nome || "";
            if (document.getElementById("email")) document.getElementById("email").value = usuario.email || "";
            if (document.getElementById("telefone")) document.getElementById("telefone").value = usuario.telefone || "";
        }
    } catch (error) {
        console.error("Erro ao carregar formulário de edição:", error);
    }
}

// Salva as alterações sem perder o identificador do banco
async function salvarAlteracoes(sessao) {
    const usuarioBanco = await buscarUsuarioLogadoNoBanco(sessao);

    const senha = document.getElementById("senha") ? document.getElementById("senha").value : "";
    const confirmarSenha = document.getElementById("confirmarSenha") ? document.getElementById("confirmarSenha").value : "";

    if (senha !== confirmarSenha) {
        alert("As senhas informadas não coincidem!");
        return;
    }

    const usuarioAtualizadoSenha = {
        cpf: document.getElementById("cpf").value,
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: senha,
        telefone: document.getElementById("telefone").value
    };

    const usuarioAtualizado = {
        cpf: document.getElementById("cpf").value,
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: senha,
        telefone: document.getElementById("telefone").value
    };

    // Usa o ID (ou CPF caso sua API Spring Boot use CPF no PathVariable)
    const idIdentificador = usuarioBanco.id || usuarioBanco.cpf || usuarioAtualizado.cpf;

    try {
        if (senha != null){
            const response = await fetch(`${API_URL}/${idIdentificador}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuarioAtualizadoSenha)
            });

            if (response.ok) {
                // Atualiza o Storage sem apagar o objeto completo
                const chaveStorage = localStorage.getItem("ajudaGovSessao") ? "ajudaGovSessao" : "ajudaGovSessao";
                const operacaoStorage = localStorage.getItem("ajudaGovSessao") ? localStorage : sessionStorage;
            
                operacaoStorage.setItem(chaveStorage, JSON.stringify(usuarioAtualizado));

                alert("Informações atualizadas com sucesso!");
                window.location.href = "perfilUsuario.html";
            } else {
                alert("Falha ao atualizar dados. Verifique o servidor.");
            } 
        } else {
            const response = await fetch(`${API_URL}/${idIdentificador}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuarioAtualizado)
            });

            if (response.ok) {
                // Atualiza o Storage sem apagar o objeto completo
                const chaveStorage = localStorage.getItem("ajudaGovSessao") ? "ajudaGovSessao" : "ajudaGovSessao";
                const operacaoStorage = localStorage.getItem("ajudaGovSessao") ? localStorage : sessionStorage;
            
                operacaoStorage.setItem(chaveStorage, JSON.stringify(usuarioAtualizado));

                alert("Informações atualizadas com sucesso!");
                window.location.href = "perfilUsuario.html";
            } else {
                alert("Falha ao atualizar dados. Verifique o servidor.");
            }
        }
        
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert("Erro de conexão com o servidor Spring Boot.");
    }
}

// Encerra a sessão
function encerrarSessao(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (confirm("Tem certeza que deseja sair da conta?")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "paginaEntrada.html";
    }

    async function buscarUsuarioLogadoNoBanco(sessao) {
    if (!sessao) return null;

    // Extrai o e-mail/CPF da sessão
    const emailSessao = typeof sessao === "object" ? (sessao.email || sessao.cpf) : sessao;

    if (!emailSessao) return null;

    // Tenta buscar diretamente pela API ou filtrando a lista
    try {
        const resposta = await fetch(`${API_URL}`);
        if (!resposta.ok) return null;

        const listaUsuarios = await resposta.json();
        
        if (Array.isArray(listaUsuarios)) {
            return listaUsuarios.find(u => 
                (u.email.toLowerCase() === String(emailSessao).toLowerCase())
            );
        }
        return listaUsuarios;
    } catch (e) {
        console.error("Erro na busca do usuário:", e);
        return null;
        }
    }   
}

function voltar() {
    window.location.href = "paginaEntrada.html"
}

function mascaraTelefone(e) {
let value = e.target.value.replace(/\D/g, "");
value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
value = value.replace(/(\d{5})(\d)/, "$1-$2");
e.target.value = value;
} 