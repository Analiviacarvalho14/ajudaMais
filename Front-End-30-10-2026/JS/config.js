/**
 * Configuração central do front-end.
 * Se o back-end rodar em outra porta/host, basta alterar aqui.
 */
const API_BASE = "http://localhost:8080";

/**
 * Wrapper de fetch já configurado para falar com o back-end:
 * - monta a URL completa a partir do API_BASE
 * - define Content-Type JSON
 *
 * OBS: não usamos "credentials: include" aqui de propósito. O back-end usa
 * @CrossOrigin(origins = "*") em todos os controllers, e o navegador BLOQUEIA
 * qualquer requisição com credentials:"include" quando o servidor libera "*"
 * como origem (regra de segurança do CORS). Como o back-end não usa
 * HttpSession (a sessão de login é guardada no localStorage, ver sessao.js),
 * não precisamos enviar cookies mesmo.
 */
async function apiFetch(caminho, opcoes = {}) {
    const resposta = await fetch(`${API_BASE}${caminho}`, {
        headers: {
            "Content-Type": "application/json",
            ...(opcoes.headers || {})
        },
        ...opcoes
    });
    return resposta;
}

/**
 * Funções compartilhadas de leitura (READ) das ONGs, usadas por
 * paginaEntrada.js, categorias.js, regioes.js e projetosUrgentes.js
 * para montar os cards dinamicamente a partir do back-end.
 */

// Imagem usada quando a ONG não cadastrou nenhuma foto em missaoOng.html
const FOTO_PADRAO_ONG = "../IMG/icone casa.jpg";

/**
 * Busca todas as ONGs cadastradas (GET /instituicao).
 * Retorna [] em caso de erro, para as páginas não quebrarem.
 */
async function buscarInstituicoes() {
    try {
        const resposta = await apiFetch("/instituicao");
        if (!resposta.ok) return [];
        return await resposta.json();
    } catch (erro) {
        console.error("Não foi possível carregar as ONGs:", erro);
        return [];
    }
}

// Retorna a foto cadastrada pela ONG (base64) ou a imagem padrão
function fotoInstituicao(instituicao) {
    return instituicao.fotoUrl && instituicao.fotoUrl.trim() !== ""
        ? instituicao.fotoUrl
        : FOTO_PADRAO_ONG;
}

// Evita que nome/descrição digitados pela ONG quebrem o HTML da página
// (proteção simples contra XSS ao inserir texto dinâmico com innerHTML)
function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

// Os 4 níveis de urgência possíveis, do mais grave para o menos grave.
// Usado tanto para validar quem é "projeto urgente" quanto para ordenar
// as listagens (paginaEntrada.js, projetosUrgentes.js, categorias.js).
const NIVEIS_URGENCIA = ["perigo-imediato", "perigo", "atencao", "contido"];

// Só é considerada "projeto urgente" a ONG que preencheu o nível de urgência
function ehProjetoUrgente(instituicao) {
    return NIVEIS_URGENCIA.includes((instituicao.urgencia || "").toLowerCase());
}

// Ordena um array de instituições do nível de urgência mais grave para o
// menos grave. Quem não tem nível cadastrado vai para o final. 
function ordenarPorUrgencia(instituicoes) {
    return [...instituicoes].sort((a, b) => {
        const posA = NIVEIS_URGENCIA.indexOf((a.urgencia || "").toLowerCase());
        const posB = NIVEIS_URGENCIA.indexOf((b.urgencia || "").toLowerCase());
        return (posA === -1 ? NIVEIS_URGENCIA.length : posA) - (posB === -1 ? NIVEIS_URGENCIA.length : posB);
    });
}
