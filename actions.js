
"use strict";

// =================================
// ELEMENTOS HTML
// =================================

let totalClicks = 0;

const contador = document.getElementById("contador");
const mensaje = document.getElementById("mensaje");

const botonSumar = document.getElementById("sumar");
const botonRestar = document.getElementById("restar");
const botonReiniciar = document.getElementById("reiniciar");

const campoTitulo = document.getElementById("tituloEvento");
const tituloActual = document.getElementById("tituloActual");

const metaInput = document.getElementById("metaInput");
const barraProgreso = document.getElementById("barraProgreso");
const barraFondo = document.getElementById("barraFondo");
const porcentaje = document.getElementById("porcentaje");
const textoProgreso = document.getElementById("textoProgreso");

// =================================
// TÍTULO EDITABLE EN TIEMPO REAL
// =================================

campoTitulo.addEventListener("input", function () {
    const titulo = campoTitulo.value.trim();

    tituloActual.textContent = titulo || "Evento escolar";

    document.title = titulo
        ? titulo + " | Colegio Bolívar"
        : "Contador de Eventos | Colegio Bolívar";
});

// =================================
// VALIDACIÓN DE LA META
// =================================

function obtenerMeta() {
    const valor = Number(metaInput.value);

    if (
        metaInput.value.trim() === "" ||
        !Number.isFinite(valor) ||
        !Number.isInteger(valor) ||
        valor < 1 ||
        valor > 1000000
    ) {
        return null;
    }

    return valor;
}

// =================================
// ACTUALIZAR BARRA DE PROGRESO
// =================================

function actualizarMeta() {
    const meta = obtenerMeta();

    if (meta === null) {
        porcentaje.textContent = "--";
        barraProgreso.style.width = "0%";
        barraFondo.setAttribute("aria-valuenow", "0");

        textoProgreso.textContent =
            "Introduce una meta entera entre 1 y 1.000.000.";

        textoProgreso.classList.remove("meta-completada");
        return;
    }

    const progreso = Math.min((totalClicks / meta) * 100, 100);
    const porcentajeRedondeado = Math.floor(progreso);
    const restantes = Math.max(meta - totalClicks, 0);

    barraProgreso.style.width = progreso + "%";
    porcentaje.textContent = porcentajeRedondeado + "%";

    barraFondo.setAttribute(
        "aria-valuenow",
        porcentajeRedondeado
    );

    if (totalClicks >= meta) {
        textoProgreso.textContent =
            "¡Meta alcanzada! Objetivo de " + meta +
            " participaciones completado.";

        textoProgreso.classList.add("meta-completada");
    } else {
        textoProgreso.textContent =
            "Faltan " + restantes +
            " participaciones para alcanzar la meta.";

        textoProgreso.classList.remove("meta-completada");
    }
}

// =================================
// ACTUALIZAR CONTADOR Y MENSAJES
// =================================

function actualizarContador() {
    contador.textContent = totalClicks;

    // Animación del número
    contador.classList.remove("animar");
    void contador.offsetWidth;
    contador.classList.add("animar");

    const meta = obtenerMeta();

    if (meta !== null && totalClicks >= meta) {
        mensaje.textContent =
            "¡Felicitaciones! ¡Han alcanzado la meta del evento!";
    } else if (totalClicks === 0) {
        mensaje.textContent =
            "¡Listos para comenzar el evento!";
    } else if (totalClicks === 1) {
        mensaje.textContent =
            "¡Primera participación registrada!";
    } else {
        mensaje.textContent =
            "¡Excelente! Llevamos " + totalClicks +
            " participaciones registradas.";
    }

    actualizarMeta();
}

// =================================
// BOTÓN SUMAR
// =================================

botonSumar.addEventListener("click", function () {
    totalClicks++;
    actualizarContador();
});

// =================================
// BOTÓN RESTAR
// =================================

botonRestar.addEventListener("click", function () {
    if (totalClicks > 0) {
        totalClicks--;
        actualizarContador();
    } else {
        mensaje.textContent = "El contador ya está en cero.";
    }
});

// =================================
// BOTÓN REINICIAR
// =================================

botonReiniciar.addEventListener("click", function () {
    totalClicks = 0;
    actualizarContador();

    mensaje.textContent = "Contador reiniciado a cero.";
});

// =================================
// CAMBIO DE META
// =================================

metaInput.addEventListener("input", actualizarMeta);
metaInput.addEventListener("change", actualizarContador);

// =================================
// INICIALIZACIÓN
// =================================

actualizarContador();

