/* ==========================================================
   HISTÓRICO - LÓGICA
   ========================================================== */

const botoesCategoriaHistorico = document.querySelectorAll("#history-category-grid [data-cat]");
const textoCategoriaHistorico = document.getElementById("history-selected-label");
const mensagemStatusHistorico = document.getElementById("history-status");
const listaHistorico = document.getElementById("history-list");
const secaoVazia = document.getElementById("history-empty");

let categoriaHistoricoSelecionada = "Todas";

/* ==========================================================
   INICIALIZAÇÃO
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    carregarHistorico();
    configurarEventos();
});

function configurarEventos() {
    botoesCategoriaHistorico.forEach((botao) => {
        botao.addEventListener("click", () => selecionarCategoriaHistorico(botao));
    });
}

/* ==========================================================
   CATEGORIAS
   ========================================================== */

function selecionarCategoriaHistorico(botaoClicado) {
    const categoriaDoBotao = botaoClicado.dataset.cat;
    const clicouNaCategoriaAtiva = categoriaHistoricoSelecionada === categoriaDoBotao;

    categoriaHistoricoSelecionada = clicouNaCategoriaAtiva ? "Todas" : categoriaDoBotao;

    atualizarBotoesCategoriaHistorico();
    atualizarLabelCategoriaHistorico();
    carregarHistorico();
}

function atualizarBotoesCategoriaHistorico() {
    botoesCategoriaHistorico.forEach((botao) => {
        const estaAtivo = botao.dataset.cat === categoriaHistoricoSelecionada;
        botao.classList.toggle("active", estaAtivo);
        botao.setAttribute("aria-pressed", String(estaAtivo));
    });
}

function atualizarLabelCategoriaHistorico() {
    textoCategoriaHistorico.textContent =
        categoriaHistoricoSelecionada === "Todas"
            ? "Todas as categorias"
            : categoriaHistoricoSelecionada;
}

/* ==========================================================
   HISTÓRICO
   ========================================================== */

function obterHistorico() {
    try {
        return JSON.parse(localStorage.getItem("historicoEncontros") || "[]");
    } catch {
        return [];
    }
}

function filtrarHistorico(historico) {
    if (categoriaHistoricoSelecionada === "Todas") {
        return historico;
    }
    return historico.filter(item => item.categoria === categoriaHistoricoSelecionada);
}

function carregarHistorico() {
    const historico = obterHistorico();
    const historicoFiltrado = filtrarHistorico(historico);

    // Ordenar por data mais recente primeiro
    historicoFiltrado.sort((a, b) => new Date(b.data) - new Date(a.data));

    if (historicoFiltrado.length === 0) {
        listaHistorico.innerHTML = "";
        listaHistorico.hidden = true;
        secaoVazia.hidden = false;
        mensagemStatusHistorico.textContent = categoriaHistoricoSelecionada === "Todas"
            ? "Nenhum encontro marcado ainda."
            : `Nenhum encontro na categoria "${categoriaHistoricoSelecionada}".`;
        return;
    }

    secaoVazia.hidden = true;
    listaHistorico.hidden = false;
    listaHistorico.innerHTML = historicoFiltrado.map(criarItemHistorico).join("");

    // Adicionar eventos aos botões de desmarcar
    document.querySelectorAll(".history-unmark-btn").forEach((botao) => {
        botao.addEventListener("click", () => desmarcarItem(botao.dataset.titulo, botao.dataset.categoria));
    });

    mensagemStatusHistorico.textContent = `${historicoFiltrado.length} encontro${historicoFiltrado.length !== 1 ? "s" : ""} encontrado${historicoFiltrado.length !== 1 ? "s" : ""}.`;
}

function criarItemHistorico(item) {
    const dataFormatada = formatarData(item.data);
    const temCusto = item.custo && item.custo !== "R$ 0";
    const temLink = item.link;

    return `
        <article class="history-item" data-titulo="${escapeHtml(item.titulo)}" data-categoria="${escapeHtml(item.categoria)}">
            <div class="history-item-header">
                <div class="history-item-icon" aria-hidden="true">${escapeHtml(item.icone)}</div>
                <div class="history-item-content">
                    <h3 class="history-item-title">${escapeHtml(item.titulo)}</h3>
                    <span class="history-item-category">${escapeHtml(item.categoria)}</span>
                </div>
            </div>

            <div class="history-item-meta">
                <div class="history-item-meta-item">
                    <span class="history-item-meta-label">Data:</span>
                    <span class="history-item-meta-value">${dataFormatada}</span>
                </div>
                <div class="history-item-meta-item">
                    <span class="history-item-meta-label">Duração:</span>
                    <span class="history-item-meta-value">${escapeHtml(item.duracao)}</span>
                </div>
                ${temCusto ? `
                <div class="history-item-meta-item">
                    <span class="history-item-meta-label">Custo:</span>
                    <span class="history-item-meta-value">${escapeHtml(item.custo)}</span>
                </div>
                ` : ""}
            </div>

            ${temLink ? `
            <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="history-item-link">
                ${escapeHtml(item.linkTexto || "Abrir link")}
            </a>
            ` : ""}

            <div class="history-item-actions">
                <button type="button" class="history-unmark-btn" data-titulo="${escapeHtml(item.titulo)}" data-categoria="${escapeHtml(item.categoria)}">
                    Desmarcar
                </button>
            </div>
        </article>
    `;
}

function desmarcarItem(titulo, categoria) {
    const historico = obterHistorico();
    const index = historico.findIndex(item => item.titulo === titulo && item.categoria === categoria);

    if (index !== -1) {
        historico.splice(index, 1);
        localStorage.setItem("historicoEncontros", JSON.stringify(historico));
        carregarHistorico();
        mensagemStatusHistorico.textContent = "Desmarcado! Voltará a aparecer nas surpresas.";
    }
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}