const apiUrl = "http://localhost:8080/instituicao";
const imgBbApiKey = "f545c3931d66e19f559486d315a819bd";

let stepAtual = 1;

document.addEventListener("DOMContentLoaded", () => {
    // CNPJ
    const inputFoto = document.getElementById('inputFoto');
    const nomeArquivo = document.getElementById('nomeArquivo');

    const cnpj1 = document.getElementById('cnpj');
    const cnpj2 = document.getElementById('cnpjFinanceiro');
    
    [cnpj1, cnpj2].forEach(inp => {
        if (inp) {
            inp.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, "").substring(0, 14);
                if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
                else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4");
                else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
                else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,3})/, "$1.$2");
                if (cnpj1) cnpj1.value = v; 
                if (cnpj2) cnpj2.value = v;
            });
        }
    });

    // Filtros de texto
    const nomeOng = document.getElementById('nomeOng');
    if (nomeOng) {
        nomeOng.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').substring(0, 100);
        });
    }

    const banco = document.getElementById('banco');
    if (banco) {
        banco.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').substring(0, 50);
        });
    }

    // Trava para o campo de Endereço não aceitar sequências longas só de números
    const enderecoInput = document.getElementById('endereco');
    if (enderecoInput) {
        enderecoInput.addEventListener('input', (e) => {
            if (/^\d{9,}$/.test(e.target.value)) {
                e.target.value = e.target.value.substring(0, 8);
            }
        });
    }

    // Telefones
    const telefones = [document.getElementById('telefone'), document.getElementById('numeroPessoal')];
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

    // Agência
    const agencia = document.getElementById('agencia');
    if (agencia) {
        agencia.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '').substring(0, 5);
            e.target.value = v.length > 4 ? v.substring(0, 4) + '-' + v.substring(4) : v;
        });
    }

    // Orçamento
    const orcamento = document.getElementById('orcamento');
    if (orcamento) {
        orcamento.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (!v) return e.target.value = '';
            v = (v / 100).toFixed(2).replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
            e.target.value = "R$ " + v;
        });
    }

    // CEP E REVELAÇÃO DO CAMPO DE NÚMERO
    const cepInput = document.getElementById('cep');
    const balao = document.getElementById('balaoNumero');
    const numInput = document.getElementById('numeroResidencia');
    const colNumero = document.getElementById('col-numero');

    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            let rawValue = e.target.value.replace(/\D/g, "").substring(0, 8);
            
            if (rawValue.length > 5) {
                e.target.value = rawValue.substring(0, 5) + "-" + rawValue.substring(5);
            } else {
                e.target.value = rawValue;
            }

            if (rawValue.length === 8) {
                if (colNumero) colNumero.style.display = 'table-cell';
                if (numInput) numInput.setAttribute('required', 'true');
                if (balao) balao.style.display = 'block';
                
                buscarCep(rawValue);
                
                setTimeout(() => {
                    if (balao) balao.style.display = 'none';
                }, 6000);
            } else {
                if (colNumero) colNumero.style.display = 'none';
                if (numInput) {
                    numInput.removeAttribute('required');
                    numInput.value = '';
                }
                if (balao) balao.style.display = 'none';
            }
        });
    }

    if (numInput && balao) {
        numInput.addEventListener('focus', () => {
            balao.style.display = 'none';
        });
    }

    if (inputFoto && nomeArquivo) {
        inputFoto.addEventListener('change', (e) => {
            const arquivos = e.target.files;
            if (arquivos.length > 0) {
                const nomes = Array.from(arquivos).map(file => file.name).join(', ');
                nomeArquivo.textContent = `Selecionado(s): ${nomes}`;
                nomeArquivo.style.color = '#28a745';
            } else {
                nomeArquivo.textContent = 'Nenhum arquivo selecionado';
                nomeArquivo.style.color = '#666666';
            }
        });
    }
});

// Busca na API ViaCEP
function buscarCep(cep) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => {
            if (!data.erro) {
                const campoEndereco = document.getElementById('endereco');
                if (campoEndereco) {
                    campoEndereco.value = `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
                }
            }
        })
        .catch(() => {});
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

function navigateStep(direction) {
    if (direction === 1 && !validateStep()) return;

    if (stepAtual + direction > 4) {
        finalizarCadastroOng();
        return;
    }

    const currentStepEl = document.getElementById(`step-${stepAtual}`);
    const currentTabEl = document.getElementById(`tab-${stepAtual}`);

    if (currentStepEl) currentStepEl.classList.remove('active');
    if (currentTabEl) currentTabEl.classList.remove('active');

    stepAtual += direction;

    const nextStepEl = document.getElementById(`step-${stepAtual}`);
    const nextTabEl = document.getElementById(`tab-${stepAtual}`);

    if (nextStepEl) nextStepEl.classList.add('active');
    if (nextTabEl) nextTabEl.classList.add('active');

    const btnVoltar = document.getElementById('btnVoltar');
    const btnProsseguir = document.getElementById('btnProsseguir');

    if (btnVoltar) btnVoltar.style.display = stepAtual === 1 ? 'none' : 'inline-block';
    if (btnProsseguir) btnProsseguir.textContent = stepAtual === 4 ? 'Finalizar' : 'Prosseguir';
}

// Upload de imagem no imgBB
async function uploadImagemImgBB(file) {
    if (!file) return "";
    
    const data = new FormData();
    data.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgBbApiKey}`, {
        method: 'POST',
        body: data
    });
    
    const responseData = await response.json();

    if (!response.ok) {
        console.error("Erro detalhado do ImgBB:", responseData);
        throw new Error(responseData?.error?.message || "Erro ao realizar o upload da imagem.");
    }

    
    return responseData.data.url;
}

async function finalizarCadastroOng() {
    const termos = document.getElementById('termos');
    if (termos && !termos.checked) {
        alert('É necessário aceitar os termos e condições de uso para finalizar.');
        return;
    }

    const senhaEl = document.getElementById('senha');
    const confirmarSenhaEl = document.getElementById('confirmarSenha');
    
    if (senhaEl && confirmarSenhaEl) {
        if (senhaEl.value !== confirmarSenhaEl.value) {
            alert('As senhas não coincidem.');
            return;
        }

        const temEspecial = /[@#$!]/.test(senhaEl.value);
        if (!temEspecial) {
            alert('A senha deve ter no mínimo um caractere especial (@, #, $, !).');
            return;
        } 
    }

    const btnProsseguir = document.getElementById('btnProsseguir');
    if (btnProsseguir) {
        btnProsseguir.disabled = true;
        btnProsseguir.textContent = 'Enviando...';
    }

    let imageUrl = "";
    const inputFoto = document.getElementById('inputFoto');

    // Executa o upload caso um arquivo tenha sido selecionado
    if (inputFoto && inputFoto.files && inputFoto.files[0]) {
        try {
            imageUrl = await uploadImagemImgBB(inputFoto.files[0]);
        } catch (error) {
            console.error(error);
            alert('Falha ao enviar a imagem do perfil. Tente novamente.');
            if (btnProsseguir) {
                btnProsseguir.disabled = false;
                btnProsseguir.textContent = 'Finalizar';
            }
            return;
        }
    }

    const cnpjEl = document.getElementById('cnpj');
    const cnpjLimpo = cnpjEl ? cnpjEl.value.replace(/\D/g, '') : '';

    const getValue = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };

    const instituicao = {
        cnpj: cnpjLimpo,
        nome: getValue('nomeOng'),
        descricao: getValue('suaHistoria'),
        atuacao: getValue('atuacao'),
        regiao: getValue('regiao'),
        email: getValue('email'),
        senha: getValue('senha'),
        telefone: getValue('telefone'),
        urgencia: getValue('urgencia'),
        pix: getValue('pix'),
        contaBancaria: {
            numeroConta: getValue('conta'),
            agencia: getValue('agencia')
        },
        imagem: imageUrl
    };

    try {
        const resposta = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(instituicao)
        });

        if (resposta.ok) {
            alert('Cadastro da ONG realizado com sucesso!');
            window.location.href = 'paginaEntrada.html';
        } else {
            const texto = await resposta.text();
            alert(texto || 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.');
        }
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
        if (btnProsseguir) {
            btnProsseguir.disabled = false;
            btnProsseguir.textContent = 'Finalizar';
        }
    }
}

function validateStep() {
    let valid = true;
    const controls = document.querySelectorAll(`#step-${stepAtual} .input-control[required]`);
    
    controls.forEach(c => {
        const parentCol = c.closest('.grid-col');
        if (parentCol && parentCol.style.display === 'none') {
            return;
        }

        c.classList.remove('invalid');
        const err = c.parentElement ? c.parentElement.querySelector('.error-message') : null;
        if (err) err.style.display = 'none';

        if (!c.value.trim()) {
            c.classList.add('invalid');
            if (err) err.style.display = 'block';
            valid = false;
        }
    });
    return valid;
}