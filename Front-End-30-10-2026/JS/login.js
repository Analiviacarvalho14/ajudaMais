let abaSelecionada = 'ong';

function alternarVisibilidadeSenha() {
    const inputSenha = document.getElementById('senha');
    const btnVer = document.getElementById('btnVer');

    if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        btnVer.textContent = 'Ocultar';
    } else {
        inputSenha.type = 'password';
        btnVer.textContent = 'Ver';
    }
}

function mudarAba(tipo) {
    abaSelecionada = tipo;
    const abaOng = document.getElementById('abaOng');
    const abaUser = document.getElementById('abaUser');

    if (tipo === 'ong') {
        abaOng.classList.add('ativa');
        abaUser.classList.remove('ativa');
    } else {
        abaUser.classList.add('ativa');
        abaOng.classList.remove('ativa');
    }

    atualizarLinkCadastro();
}

function atualizarLinkCadastro() {
    const linkCadastro = document.getElementById('linkCadastro');
    if (!linkCadastro) return;
    linkCadastro.setAttribute(
        'href',
        abaSelecionada === 'ong' ? 'missaoOng.html' : 'cadastroUsuario.html'
    );
}

function validarSenha() {
    const senhaInput = document.getElementById('senha').value;
    const caixaValidacao = document.getElementById('caixa-validacao');
    const regraEspecial = document.getElementById('regra-especial');
    const regraTamanho = document.getElementById('regra-tamanho');

    if (caixaValidacao) {
        if (senhaInput.length > 0) {
            caixaValidacao.style.display = 'block';
        } else {
            caixaValidacao.style.display = 'none';
        }
    }

    if (regraTamanho) {
        if (senhaInput.length >= 8) {
            regraTamanho.classList.add('regra-valida');
            regraTamanho.innerText = "✔️ No mínimo 8 caracteres";
        } else {
            regraTamanho.classList.remove('regra-valida');
            regraTamanho.innerText = "❌ No mínimo 8 caracteres";
        }
    }

    if (regraEspecial) {
        const temEspecial = /[@#$!]/.test(senhaInput);
        if (temEspecial) {
            regraEspecial.classList.add('regra-valida');
            regraEspecial.innerText = "✔️ Um caractere especial (@, #, $, !)";
        } else {
            regraEspecial.classList.remove('regra-valida');
            regraEspecial.innerText = "❌ Um caractere especial (@, #, $, !)";
        }
    }
}

function mostrarErroLogin(mensagem) {
    const elErro = document.getElementById('mensagem-erro');
    if (elErro) {
        elErro.textContent = mensagem;
        elErro.style.display = 'block';
    } else {
        alert(mensagem);
    }
}

function esconderErroLogin() {
    const elErro = document.getElementById('mensagem-erro');
    if (elErro) elErro.style.display = 'none';
}

function extrairNomeDaResposta(texto, fallback) {
    const match = texto.match(/Seja bem-vind@ (.+)$/);
    return match ? match[1].trim() : fallback;
}

async function tentarEntrar() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const botao = document.getElementById('botaoEntrar');

    esconderErroLogin();

    if (!email || !senha) {
        mostrarErroLogin("Por favor, preencha e-mail e senha.");
        return;
    }

    const caminho = abaSelecionada === 'ong' ? '/instituicao/login' : '/usuario/login';

    botao.disabled = true;
    botao.textContent = "Entrando...";

    try {
        const resposta = await apiFetch(caminho, {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        const texto = await resposta.text();

        if (resposta.ok) {
            const nome = extrairNomeDaResposta(texto, email);
            salvarSessao({ tipo: abaSelecionada, nome, email });
            window.location.href = "paginaEntrada.html";
        } else {
            mostrarErroLogin(texto || "Não foi possível entrar. Verifique seus dados.");
        }
    } catch (erro) {
        console.error(erro);
        mostrarErroLogin("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
        botao.disabled = false;
        botao.textContent = "Entrar";
    }
}

document.addEventListener('DOMContentLoaded', atualizarLinkCadastro);