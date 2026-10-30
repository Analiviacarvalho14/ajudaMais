
const CHAVE_SESSAO = "ajudaGovSessao";

function salvarSessao({ tipo, nome, email }) {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ tipo, nome, email }));
}

function obterSessao() {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    if (!bruto) return null;
    try {
        return JSON.parse(bruto);
    } catch {
        return null;
    }
}

function encerrarSessao() {
    localStorage.removeItem(CHAVE_SESSAO);
}

function atualizarCabecalho() {
    const linkConta = document.getElementById("linkConta");
    const areaConta = document.getElementById("areaConta");
    if (!linkConta || !areaConta) return;

    const sessao = obterSessao();

     if (sessao && sessao.nome) {
        areaConta.textContent = `Olá, ${sessao.nome} `;
        if (sessao.tipo == "ong"){
            linkConta.setAttribute("href", "perfilOng.html");
        } else {
            linkConta.setAttribute("href", "perfilUsuario.html");
        }
        linkConta.onclick = null;
    } else {
        areaConta.textContent = "Entre na sua conta 👤";
        linkConta.setAttribute("href", "login.html");
        linkConta.onclick = null;
    }
}

document.addEventListener("DOMContentLoaded", atualizarCabecalho);
