/* ==========================================================
   POEMAS - LÓGICA
   ========================================================== */

const CAMINHO_POEMAS_JSON = "../JSON/Poemas.json";
const LINHAS_POR_ESTROFE = 4;

const listaPoemas = document.getElementById("poemas-lista");
const statusPoemas = document.getElementById("poemas-status");
const contadorPoemas = document.getElementById("poemas-contador");

/* ==========================================================
   INICIALIZAÇÃO
   ========================================================== */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", carregarPoemas);
} else {
    carregarPoemas();
}

/* ==========================================================
   CARREGAMENTO DO JSON
   ========================================================== */

async function carregarPoemas() {
    try {
        const response = await fetch(CAMINHO_POEMAS_JSON);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const texto = (await response.text()).replace(/^\uFEFF/, "");
        const dados = JSON.parse(texto);
        renderizarPoemas(Array.isArray(dados) ? dados : []);
    } catch (error) {
        console.error("Erro ao carregar poemas:", error);
        listaPoemas.replaceChildren();
        contadorPoemas.textContent = "Erro";
        statusPoemas.textContent = "Erro ao carregar os poemas. Recarregue a página.";
    }
}

/* ==========================================================
   RENDERIZAÇÃO
   ========================================================== */

function renderizarPoemas(poemas) {
    listaPoemas.replaceChildren();

    if (poemas.length === 0) {
        contadorPoemas.textContent = "0 poemas";
        statusPoemas.textContent = "Nenhum poema cadastrado ainda.";
        return;
    }

    const fragmento = document.createDocumentFragment();
    poemas.forEach((poema, indice) => fragmento.appendChild(criarCartaoPoema(poema, indice)));
    listaPoemas.appendChild(fragmento);

    contadorPoemas.textContent = `${poemas.length} poema${poemas.length !== 1 ? "s" : ""}`;
    statusPoemas.textContent = "";
}

function criarCartaoPoema(poema, indice) {
    const cartao = document.createElement("article");
    cartao.className = "poema-card";

    const estrela = document.createElement("span");
    estrela.className = "poema-estrela";
    estrela.setAttribute("aria-hidden", "true");
    estrela.textContent = indice % 2 === 0 ? "✦" : "✧";
    cartao.appendChild(estrela);

    const titulo = document.createElement("h2");
    titulo.className = "poema-titulo";
    titulo.textContent = obterTitulo(poema);
    cartao.appendChild(titulo);

    const texto = document.createElement("div");
    texto.className = "poema-texto";
    agruparEmEstrofes(normalizarLinhas(obterTexto(poema))).forEach(linhas => {
        const estrofe = document.createElement("p");
        estrofe.className = "poema-estrofe";
        linhas.forEach(linha => {
            const elementoLinha = document.createElement("span");
            elementoLinha.className = "poema-linha";
            elementoLinha.textContent = linha;
            estrofe.appendChild(elementoLinha);
        });
        texto.appendChild(estrofe);
    });
    cartao.appendChild(texto);

    const fraseFinal = document.createElement("p");
    fraseFinal.className = "poema-frase-final";

    const rotulo = document.createElement("span");
    rotulo.className = "poema-frase-rotulo";
    rotulo.textContent = "Frase final";
    fraseFinal.appendChild(rotulo);

    const conteudo = document.createElement("span");
    conteudo.className = "poema-frase-texto";
    conteudo.textContent = obterFraseFinal(poema);
    fraseFinal.appendChild(conteudo);

    cartao.appendChild(fraseFinal);

    return cartao;
}

/* ==========================================================
   NORMALIZAÇÃO DOS DADOS
   ========================================================== */

function obterTitulo(poema) {
    return primeiroTextoValido(poema.titulo, poema.Titulo, poema["título"], "Poema sem título");
}

function obterTexto(poema) {
    const candidatos = [poema.texto, poema.Texto, poema["texto do poema"]];

    for (const candidato of candidatos) {
        if (Array.isArray(candidato)) {
            const linhas = normalizarLinhas(candidato);
            if (linhas.length > 0) {
                return linhas;
            }
            continue;
        }

        if (typeof candidato === "string" && candidato.trim() !== "") {
            return candidato;
        }
    }

    return [];
}

function obterFraseFinal(poema) {
    return primeiroTextoValido(poema.fraseFinal, poema.frasefinal, poema["frase final"], "");
}

function primeiroTextoValido(...valores) {
    for (const valor of valores) {
        if (typeof valor === "string" && valor.trim() !== "") {
            return valor.trim();
        }
    }
    return "";
}

function normalizarLinhas(texto) {
    if (Array.isArray(texto)) {
        return texto.map(linha => String(linha).trim()).filter(linha => linha !== "");
    }

    if (typeof texto === "string") {
        return texto.split(/\r?\n/).map(linha => linha.trim()).filter(linha => linha !== "");
    }

    return [];
}

function agruparEmEstrofes(linhas) {
    const estrofes = [];

    for (let indice = 0; indice < linhas.length; indice += LINHAS_POR_ESTROFE) {
        estrofes.push(linhas.slice(indice, indice + LINHAS_POR_ESTROFE));
    }

    return estrofes;
}
