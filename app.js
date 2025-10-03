// Seletores principais
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalConteudo = document.querySelector(".modal-conteudo");
const conteudoDireita = document.querySelector(".conteudo-direita");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let imagens = Array.from(document.querySelectorAll(".img-competidor"));
let indiceAtual = -1; // índice da imagem aberta
let lastClickedImg = null;

// Abre o modal com animação
function abrirModal(img) {
    lastClickedImg = img;
    indiceAtual = imagens.indexOf(img);

    document.querySelectorAll(".clone-img").forEach(clone => clone.remove());

    const rect = img.getBoundingClientRect();

    // cria clone da imagem clicada
    const clone = img.cloneNode();
    clone.classList.add("clone-img");
    document.body.appendChild(clone);

    // posição inicial (card)
    clone.style.top = rect.top + "px";
    clone.style.left = rect.left + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";

    // prepara modal no DOM, mas sem mostrar (sem .show)
    modal.style.display = "flex";
    modal.classList.remove("show");
    modalConteudo.classList.remove("reveal");

    // força reflow
    modal.offsetHeight;

    // pega posição final (imagem do modal)
    const modalRect = modalImg.getBoundingClientRect();

    // anima clone até a posição final
    requestAnimationFrame(() => {
        clone.style.top = modalRect.top + "px";
        clone.style.left = modalRect.left + "px";
        clone.style.width = modalRect.width + "px";
        clone.style.height = modalRect.height + "px";
    });

    // quando a animação do clone terminar → mostra modal real
    clone.addEventListener("transitionend", () => {
        carregarConteudo(img);

        modal.classList.add("show");
        modalConteudo.classList.add("reveal");

        // remove clone depois de breve delay
        setTimeout(() => {
            if (clone && clone.parentNode) clone.remove();
        }, 40);
    }, { once: true });
}

// Carrega imagem e colunas laterais
function carregarConteudo(img) {
    const imgSrc = img.src;
    modalImg.src = imgSrc;

    // monta o conteúdo lateral
    const ocupacao = img.getAttribute("data-ocupacao");
    const texto1 = img.getAttribute("data-texto1");
    const texto2 = img.getAttribute("data-texto2");
    const texto3 = img.getAttribute("data-texto3");

    conteudoDireita.innerHTML = `
        <div class="item alternado">
            <img src="/img/${ocupacao}1.png" alt="">
            <p>${texto1 || ""}</p>
        </div>

        <div class="item alternado invertido">
            <p>${texto2 || ""}</p>
            <img src="/img/${ocupacao}2.png" alt="">
        </div>

        <div class="item alternado">
            <img src="/img/${ocupacao}3.png" alt="">
            <p>${texto3 || ""}</p>
        </div>
    `;
}

// Fecha o modal com animação reversa
function fecharModal() {
    if (indiceAtual === -1) return;

    const img = imagens[indiceAtual];
    const rect = img.getBoundingClientRect();

    // cria clone da imagem do modal
    const clone = modalImg.cloneNode();
    clone.classList.add("clone-img");
    document.body.appendChild(clone);

    // posição inicial (imagem do modal)
    const modalRect = modalImg.getBoundingClientRect();
    clone.style.top = modalRect.top + "px";
    clone.style.left = modalRect.left + "px";
    clone.style.width = modalRect.width + "px";
    clone.style.height = modalRect.height + "px";

    // força reflow
    clone.getBoundingClientRect();

    // esconde conteúdo real
    modalConteudo.classList.remove("reveal");
    modal.classList.remove("show");

    // anima clone de volta ao card original
    requestAnimationFrame(() => {
        clone.style.top = rect.top + "px";
        clone.style.left = rect.left + "px";
        clone.style.width = rect.width + "px";
        clone.style.height = rect.height + "px";
    });

    // quando terminar → fecha modal e remove clone
    clone.addEventListener("transitionend", () => {
        setTimeout(() => {
            modal.style.display = "none";
            if (clone && clone.parentNode) clone.remove();
        }, 40);
    }, { once: true });

    indiceAtual = -1;
}

// Navegação (anterior e próximo) — circular
function mostrarAnterior() {
    if (indiceAtual > 0) {
        indiceAtual--;
    } else {
        indiceAtual = imagens.length - 1; // volta para o último
    }
    carregarConteudo(imagens[indiceAtual]);
}

function mostrarProximo() {
    if (indiceAtual < imagens.length - 1) {
        indiceAtual++;
    } else {
        indiceAtual = 0; // volta para o primeiro
    }
    carregarConteudo(imagens[indiceAtual]);
}

// Clique nas imagens abre modal
imagens.forEach(img => {
    img.addEventListener("click", () => abrirModal(img));
});

// Clique fora do conteúdo fecha modal
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        fecharModal();
    }
});

// Botões de navegação
prevBtn.addEventListener("click", mostrarAnterior);
nextBtn.addEventListener("click", mostrarProximo);

// Também permite navegar com setas do teclado
window.addEventListener("keydown", (e) => {
    if (modal.style.display === "flex") {
        if (e.key === "ArrowLeft") mostrarAnterior();
        if (e.key === "ArrowRight") mostrarProximo();
        if (e.key === "Escape") fecharModal();
    }
});


function animarTransicao(direcao, proximaImg) {
    const conteudo = modalConteudo;

    // remove animações antigas
    conteudo.classList.remove("slide-out-left", "slide-in-right", "slide-out-right", "slide-in-left");

    // define classes dependendo da direção
    let sair, entrar;
    if (direcao === "proximo") {
        sair = "slide-out-left";
        entrar = "slide-in-right";
    } else {
        sair = "slide-out-right";
        entrar = "slide-in-left";
    }

    // aplica animação de saída
    conteudo.classList.add(sair);

    conteudo.addEventListener("animationend", function handler() {
        conteudo.removeEventListener("animationend", handler);

        // troca o conteúdo
        carregarConteudo(proximaImg);

        // remove animação de saída e aplica entrada
        conteudo.classList.remove(sair);
        conteudo.classList.add(entrar);

        conteudo.addEventListener("animationend", () => {
            conteudo.classList.remove(entrar);
        }, { once: true });
    }, { once: true });
}

function mostrarProximo() {
    const proximo = indiceAtual < imagens.length - 1 ? indiceAtual + 1 : 0;
    animarTransicao("proximo", imagens[proximo]);
    indiceAtual = proximo;
}

function mostrarAnterior() {
    const anterior = indiceAtual > 0 ? indiceAtual - 1 : imagens.length - 1;
    animarTransicao("anterior", imagens[anterior]);
    indiceAtual = anterior;
}
