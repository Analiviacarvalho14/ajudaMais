let CADASTRO_URL = "http://localhost:8080/usuario";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("usuarioForm") || document.querySelector("form");
    if (form) {
        form.addEventListener("submit", cadastrarUsuario);
    }
});


async function cadastrarUsuario(event) {
    event.preventDefault();


    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;


    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
    }


    const usuarioDTO = {
        nome: document.getElementById("nome").value.trim(),
        cpf: document.getElementById("cpf").value.trim(),
        email: document.getElementById("email").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        senha: senha
    };


    try {
        const response = await fetch(CADASTRO_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuarioDTO)
        });
        
        const termos = document.getElementById('termos');
        if (termos && !termos.checked) {
            alert('É necessário aceitar os termos e condições de uso para finalizar.');
            return;
        }


        if (response.ok || response.status === 201) {
            alert("Usuário cadastrado com sucesso!");
            window.location.href = "login.html";
        } else if (response.status === 409) {
            alert("Este CPF ou E-mail já está cadastrado no banco!");
        } else {
            alert("O servidor respondeu com erro " + response.status);
        }
    } catch (error) {
        console.error("Erro na requisição Fetch:", error);
    }
}

function togglePassword(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const btn = el.nextElementSibling;
    if (el.type === "password") {
        el.type = "text";
        if (btn) btn.textContent = "Ocultar";
    } else {
        el.type = "password";
        if (btn) btn.textContent = "Ver";
    }
}

// Telefones
    const telefones = [document.getElementById('telefone')];
    telefones.forEach(t => {
        if (t) {
            t.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, "").substring(0, 11);
                if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
                else if (v.length > 5) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
                else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
                e.target.value = v;
            });
        }
    });