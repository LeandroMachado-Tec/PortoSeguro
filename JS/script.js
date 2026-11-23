/* ==========================================================
   1. OPÇÕES DE ENCONTRO
   Carregadas de JSON/encontros.json
   ========================================================== */

let encontros = [];

/* ==========================================================
   2. ELEMENTOS DA PÁGINA
   ========================================================== */

const botoesDeCategoria = document.querySelectorAll("[data-cat]");
const textoCategoriaSelecionada = document.getElementById("selected-label");
const mensagemDeStatus = document.getElementById("status");
const painelDeResultado = document.getElementById("result");
const botaoSurpresa = document.getElementById("surprise");
const botaoSortearNovamente = document.getElementById("again");
const botaoRecolher = document.getElementById("collapse-result");

const resultadoIcone = document.getElementById("result-icon");
const resultadoTitulo = document.getElementById("result-title");
const resultadoDescricao = document.getElementById("result-description");
const resultadoDuracao = document.getElementById("result-time");
const resultadoCusto = document.getElementById("result-cost");
const resultadoCustoLabel = document.getElementById("result-cost-label");
const resultadoMetaRight = document.getElementById("result-meta-right");
const resultadoLink = document.getElementById("result-link");
const botaoMarcar = document.getElementById("mark-btn");
const acoesResultado = document.getElementById("result-actions");

// Menu elements
const botaoMenu = document.getElementById("menu-btn");
const painelMenu = document.getElementById("menu-panel");
const botaoFecharMenu = document.getElementById("close-menu");
const botaoFotoPerfil = document.getElementById("profile-photo-btn");
const botaoFotoPadrao = document.getElementById("default-photo-btn");
const backdropMenu = painelMenu?.querySelector(".menu-backdrop");

/* ==========================================================
   3. ESTADO ATUAL DO SITE
   ========================================================== */

let categoriaSelecionada = "Todas";
let ultimoTituloSorteado = "";

/* ==========================================================
   3.5. CARREGAR ENCONTROS DO JSON
   ========================================================== */

let encontrosCarregados = false;

async function carregarEncontros() {
    try {
        // Use ./ to make path explicitly relative to current page directory
        // This works both locally and on GitHub Pages (served from /PortoSeguro/)
        const response = await fetch("./JSON/encontros.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        encontros = await response.json();
        encontrosCarregados = true;
        atualizarMensagemDaCategoria();
    } catch (error) {
        console.error("Erro ao carregar encontros:", error);
        mensagemDeStatus.textContent = "Erro ao carregar opções. Recarregue a página.";
    }
}

// Carregar encontros ao iniciar
carregarEncontros();

/* ==========================================================
   4. SELEÇÃO DE CATEGORIA
   ========================================================== */

function selecionarCategoria(botaoClicado) {
    const categoriaDoBotao = botaoClicado.dataset.cat;
    const clicouNaCategoriaAtiva = categoriaSelecionada === categoriaDoBotao;

    // Clicar novamente na categoria ativa remove o filtro.
    categoriaSelecionada = clicouNaCategoriaAtiva
        ? "Todas"
        : categoriaDoBotao;

    atualizarBotoesDeCategoria();
    atualizarMensagemDaCategoria();
}

function atualizarBotoesDeCategoria() {
    botoesDeCategoria.forEach((botao) => {
        const estaAtivo = botao.dataset.cat === categoriaSelecionada;

        botao.classList.toggle("active", estaAtivo);
        botao.setAttribute("aria-pressed", String(estaAtivo));
    });

    textoCategoriaSelecionada.textContent =
        categoriaSelecionada === "Todas"
            ? "Todas as opções"
            : categoriaSelecionada;
}

function atualizarMensagemDaCategoria() {
    mensagemDeStatus.textContent =
        categoriaSelecionada === "Todas"
            ? "Todas as categorias estão disponíveis."
            : `Categoria selecionada: ${categoriaSelecionada}`;
}

/* ==========================================================
   5. SORTEIO DO ENCONTRO
   ========================================================== */

function obterEncontrosDisponiveis() {
    const historico = obterHistorico();
    const titulosMarcados = new Set(historico.map(item => `${item.titulo}|${item.categoria}`));

    let base = categoriaSelecionada === "Todas"
        ? encontros
        : encontros.filter((encontro) => encontro.categoria === categoriaSelecionada);

    // Filter out items already marked as done/heard
    return base.filter(encontro => !titulosMarcados.has(`${encontro.titulo}|${encontro.categoria}`));
}

function evitarRepeticaoImediata(encontrosDisponiveis) {
    const encontrosSemOUltimo = encontrosDisponiveis.filter(
        (encontro) => encontro.titulo !== ultimoTituloSorteado
    );

    // Se existir somente uma opção, ela poderá aparecer novamente.
    return encontrosSemOUltimo.length > 0
        ? encontrosSemOUltimo
        : encontrosDisponiveis;
}

function escolherItemAleatorio(lista) {
    const indiceAleatorio = Math.floor(Math.random() * lista.length);
    return lista[indiceAleatorio];
}

async function sortearEncontro() {
    // Wait for data to load if not ready
    if (!encontrosCarregados) {
        mensagemDeStatus.textContent = "Carregando opções...";
        await carregarEncontros();
        if (!encontrosCarregados) return;
    }

    const encontrosDisponiveis = obterEncontrosDisponiveis();

    if (encontrosDisponiveis.length === 0) {
        mensagemDeStatus.textContent =
            "Não há opções disponíveis nesta categoria.";
        return;
    }

    const opcoesParaOSorteio = evitarRepeticaoImediata(
        encontrosDisponiveis
    );

    const encontroSorteado = escolherItemAleatorio(opcoesParaOSorteio);

    ultimoTituloSorteado = encontroSorteado.titulo;

    exibirResultado(encontroSorteado);
}

/* ==========================================================
   6. EXIBIÇÃO DO RESULTADO
   ========================================================== */

let encontroAtual = null;

function exibirResultado(encontro) {
    encontroAtual = encontro;
    resultadoIcone.textContent = encontro.icone;
    resultadoTitulo.textContent = encontro.titulo;
    resultadoDescricao.textContent = encontro.descricao;
    resultadoDuracao.textContent = encontro.duracao;

    // Handle cost vs link in the same grid position
    if (encontro.link) {
        // Show link (for Músicas category)
        resultadoCustoLabel.style.display = "none";
        resultadoCusto.style.display = "none";
        resultadoLink.href = encontro.link;
        resultadoLink.textContent = encontro.linkTexto || "Abrir link";
        resultadoLink.style.display = "inline-flex";
    } else if (encontro.custo) {
        // Show cost (for other categories)
        resultadoCustoLabel.style.display = "block";
        resultadoCusto.style.display = "block";
        resultadoCusto.textContent = encontro.custo;
        resultadoLink.style.display = "none";
    } else {
        // Hide both
        resultadoMetaRight.style.display = "none";
    }

    // Handle mark button
    atualizarBotaoMarcar(encontro);

    painelDeResultado.style.display = "block";
    painelDeResultado.classList.add("show");
    mensagemDeStatus.textContent = "Encontro escolhido.";

    setTimeout(() => {
        painelDeResultado.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }, 40);
}

function atualizarBotaoMarcar(encontro) {
    const historico = obterHistorico();
    const jaMarcado = historico.some(item => item.titulo === encontro.titulo && item.categoria === encontro.categoria);

    if (jaMarcado) {
        botaoMarcar.textContent = encontro.categoria === "Músicas" ? "✓ Marcada como ouvida" : "✓ Marcado como feito";
        botaoMarcar.classList.add("marked");
        botaoMarcar.setAttribute("data-action", "unmark");
    } else {
        botaoMarcar.textContent = encontro.categoria === "Músicas" ? "Marcar como ouvida" : "Marcar como feito";
        botaoMarcar.classList.remove("marked");
        botaoMarcar.setAttribute("data-action", "mark");
    }
    acoesResultado.style.display = "block";
}

function alternarMarcar() {
    if (!encontroAtual) return;

    const acao = botaoMarcar.getAttribute("data-action");
    const historico = obterHistorico();

    if (acao === "mark") {
        // Add to history
        historico.push({
            titulo: encontroAtual.titulo,
            categoria: encontroAtual.categoria,
            icone: encontroAtual.icone,
            descricao: encontroAtual.descricao,
            duracao: encontroAtual.duracao,
            custo: encontroAtual.custo || null,
            link: encontroAtual.link || null,
            linkTexto: encontroAtual.linkTexto || null,
            data: new Date().toISOString()
        });
        salvarHistorico(historico);
        mensagemDeStatus.textContent = encontroAtual.categoria === "Músicas" ? "Marcada como ouvida!" : "Marcado como feito!";
    } else {
        // Remove from history
        const index = historico.findIndex(item => item.titulo === encontroAtual.titulo && item.categoria === encontroAtual.categoria);
        if (index !== -1) {
            historico.splice(index, 1);
            salvarHistorico(historico);
            mensagemDeStatus.textContent = "Desmarcado! Voltará a aparecer nas surpresas.";
        }
    }

    atualizarBotaoMarcar(encontroAtual);
}

function obterHistorico() {
    try {
        return JSON.parse(localStorage.getItem("historicoEncontros") || "[]");
    } catch {
        return [];
    }
}

function salvarHistorico(historico) {
    localStorage.setItem("historicoEncontros", JSON.stringify(historico));
}

/* ==========================================================
   7. EVENTOS
   ========================================================== */

botoesDeCategoria.forEach((botao) => {
    botao.addEventListener("click", () => selecionarCategoria(botao));
});

botaoSurpresa.addEventListener("click", sortearEncontro);
botaoSortearNovamente.addEventListener("click", sortearEncontro);
botaoRecolher?.addEventListener("click", recolherResultado);
botaoMarcar?.addEventListener("click", alternarMarcar);

/* ==========================================================
   8. MENU HAMBÚRGUER
   ========================================================== */

function alternarMenu() {
    const estaAberto = painelMenu.hasAttribute("hidden");

    if (estaAberto) {
        abrirMenu();
    } else {
        fecharMenu();
    }
}

function abrirMenu() {
    painelMenu.hidden = false;
    botaoMenu.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";

    // Focus first menu item for accessibility
    setTimeout(() => botaoFotoPerfil?.focus(), 50);
}

function fecharMenu() {
    painelMenu.hidden = true;
    botaoMenu.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
}

function handleMenuKeydown(event) {
    if (event.key === "Escape") {
        fecharMenu();
        botaoMenu.focus();
    }

    // Trap focus within menu
    if (event.key === "Tab") {
        const focusableElements = painelMenu.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
}

function handleFotoPerfil() {
    // Create a file input for profile photo
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Store the photo in localStorage
                localStorage.setItem("profilePhoto", e.target.result);
                // Update brand mark with photo
                atualizarFotoPerfil(e.target.result);
                mensagemDeStatus.textContent = "Foto de perfil atualizada!";
            };
            reader.readAsDataURL(file);
        }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
    fecharMenu();
}

function atualizarFotoPerfil(fotoDataUrl) {
    const brandMark = document.querySelector(".brand-mark");
    if (brandMark) {
        brandMark.style.backgroundImage = `url(${fotoDataUrl})`;
        brandMark.style.backgroundSize = "cover";
        brandMark.style.backgroundPosition = "center";
        brandMark.textContent = "";
    }
}

function carregarFotoPerfilSalva() {
    const fotoSalva = localStorage.getItem("profilePhoto");
    if (fotoSalva) {
        atualizarFotoPerfil(fotoSalva);
    }
}

/* ==========================================================
   9. RECOLHER RESULTADO
   ========================================================== */

function recolherResultado() {
    painelDeResultado.classList.remove("show");
    // Wait for animation to complete before hiding
    setTimeout(() => {
        if (!painelDeResultado.classList.contains("show")) {
            painelDeResultado.style.display = "none";
        }
    }, 280);
    mensagemDeStatus.textContent = "Resultado recolhido.";
}

/* ==========================================================
   10. EVENTOS DO MENU
   ========================================================== */

botaoMenu?.addEventListener("click", alternarMenu);
botaoFecharMenu?.addEventListener("click", fecharMenu);
backdropMenu?.addEventListener("click", fecharMenu);
botaoFotoPerfil?.addEventListener("click", handleFotoPerfil);
botaoFotoPadrao?.addEventListener("click", handleFotoPadrao);
painelMenu?.addEventListener("keydown", handleMenuKeydown);

// Load saved profile photo on init
carregarFotoPerfilSalva();

/* ==========================================================
   11. FOTO PADRÃO
   ========================================================== */

function handleFotoPadrao() {
    // Remove saved photo from localStorage
    localStorage.removeItem("profilePhoto");
    // Reset brand mark to default
    resetarFotoPerfil();
    mensagemDeStatus.textContent = "Foto padrão restaurada!";
    fecharMenu();
}

function resetarFotoPerfil() {
    const brandMark = document.querySelector(".brand-mark");
    if (brandMark) {
        brandMark.style.backgroundImage = "";
        brandMark.style.backgroundSize = "";
        brandMark.style.backgroundPosition = "";
        brandMark.textContent = "R + L";
    }
}
