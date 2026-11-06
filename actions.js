
"use strict";

// ========================================
// ELEMENTOS HTML
// ========================================

let totalClicks = 0;
let tiempoInicio = null;
let duracionPartida = 10;
let partidaActiva = false;
let animacionId = null;

const contador = document.getElementById("contador");
const temporizador = document.getElementById("temporizador");
const mensaje = document.getElementById("mensaje");
const estadoPartida = document.getElementById("estadoPartida");

const botonSumar = document.getElementById("sumar");
const botonIniciar = document.getElementById("iniciar");
const botonReiniciar = document.getElementById("reiniciar");

const selectorDuracion = document.getElementById("duracion");

const campoTitulo = document.getElementById("tituloEvento");
const tituloActual = document.getElementById("tituloActual");

const panelResultado = document.getElementById("panelResultado");
const resultadoFinal = document.getElementById("resultadoFinal");
const resultadoDetalle = document.getElementById("resultadoDetalle");

const metaInput = document.getElementById("metaInput");
const barraProgreso = document.getElementById("barraProgreso");
const barraFondo = document.getElementById("barraFondo");
const porcentaje = document.getElementById("porcentaje");
const textoProgreso = document.getElementById("textoProgreso");


// ========================================
// FORMATO DEL TIEMPO
// ========================================

function formatearTiempo(milisegundos) {

    const minutos = Math.floor(milisegundos / 60000);

    const segundos = Math.floor(
        (milisegundos % 60000) / 1000
    );

    const milisegundosRestantes =
        Math.floor(milisegundos % 1000);

    return (
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0") + "." +
        String(milisegundosRestantes).padStart(3, "0")
    );
}


// ========================================
// CAMBIAR TÍTULO EN TIEMPO REAL
// ========================================

campoTitulo.addEventListener("input", function () {

    const titulo = campoTitulo.value.trim();

    tituloActual.textContent =
        titulo || "Evento escolar";

    document.title = titulo
        ? titulo + " | Colegio Bolívar"
        : "Click Challenge | Colegio Bolívar";

});


// ========================================
// VALIDAR META
// ========================================

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


// ========================================
// ACTUALIZAR BARRA DE PROGRESO
// ========================================

function actualizarMeta() {

    const meta = obtenerMeta();

    if (meta === null) {

        porcentaje.textContent = "--";

        barraProgreso.style.width = "0%";

        barraFondo.setAttribute(
            "aria-valuenow",
            "0"
        );

        textoProgreso.textContent =
            "Introduce una meta válida entre 1 y 1.000.000.";

        textoProgreso.classList.remove("meta-completada");

        return;
    }

    const progreso = Math.min(
        (totalClicks / meta) * 100,
        100
    );

    const porcentajeRedondeado =
        Math.floor(progreso);

    const restantes = Math.max(
        meta - totalClicks,
        0
    );

    barraProgreso.style.width =
        progreso + "%";

    porcentaje.textContent =
        porcentajeRedondeado + "%";

    barraFondo.setAttribute(
        "aria-valuenow",
        porcentajeRedondeado
    );

    if (totalClicks >= meta) {

        textoProgreso.textContent =
            "¡Meta alcanzada! Objetivo de " +
            meta + " clics completado.";

        textoProgreso.classList.add(
            "meta-completada"
        );

    } else {

        textoProgreso.textContent =
            "Faltan " + restantes +
            " clics para alcanzar la meta.";

        textoProgreso.classList.remove(
            "meta-completada"
        );

    }
}


// ========================================
// ACTUALIZAR CONTADOR
// ========================================

function actualizarContador() {

    contador.textContent = totalClicks;

    contador.classList.remove("animar");

    void contador.offsetWidth;

    contador.classList.add("animar");

    actualizarMeta();

}


// ========================================
// ACTUALIZAR CRONÓMETRO
// ========================================

function actualizarTemporizador() {

    if (!partidaActiva) {
        return;
    }

    const tiempoActual = performance.now();

    const tiempoTranscurrido =
        tiempoActual - tiempoInicio;

    const tiempoMaximo =
        duracionPartida * 1000;

    if (tiempoTranscurrido >= tiempoMaximo) {

        finalizarPartida();

        return;
    }

    temporizador.textContent =
        formatearTiempo(tiempoTranscurrido);

    animacionId =
        requestAnimationFrame(actualizarTemporizador);

}


// ========================================
// INICIAR PARTIDA
// ========================================

function iniciarPartida() {

    if (partidaActiva) {
        return;
    }

    duracionPartida =
        Number(selectorDuracion.value);

    if (![10, 20, 30].includes(duracionPartida)) {
        return;
    }

    // Reiniciar datos anteriores

    totalClicks = 0;

    tiempoInicio = null;

    contador.textContent = "0";

    temporizador.textContent = "00:00.000";

    panelResultado.hidden = true;

    resultadoFinal.textContent = "0";

    actualizarMeta();

    // Bloquear configuración durante la partida

    selectorDuracion.disabled = true;

    botonIniciar.disabled = true;

    botonSumar.disabled = false;

    partidaActiva = true;

    estadoPartida.textContent =
        "¡La partida está en marcha!";

    mensaje.textContent =
        "¡Haz tantos clics como puedas!";

    // Iniciar cronómetro desde cero

    tiempoInicio = performance.now();

    animacionId =
        requestAnimationFrame(actualizarTemporizador);

}


// ========================================
// REGISTRAR CLICS
// ========================================

function registrarClick() {

    if (!partidaActiva) {
        return;
    }

    // Comprobar el tiempo real antes de contar

    const tiempoTranscurrido =
        performance.now() - tiempoInicio;

    if (tiempoTranscurrido >= duracionPartida * 1000) {

        finalizarPartida();

        return;
    }

    totalClicks++;

    actualizarContador();

}


// ========================================
// FINALIZAR PARTIDA
// ========================================

function finalizarPartida() {

    if (!partidaActiva) {
        return;
    }

    partidaActiva = false;

    if (animacionId !== null) {

        cancelAnimationFrame(animacionId);

        animacionId = null;

    }

    // Mostrar tiempo final exacto

    temporizador.textContent =
        formatearTiempo(duracionPartida * 1000);

    // Deshabilitar los controles de juego

    botonSumar.disabled = true;

    selectorDuracion.disabled = false;

    botonIniciar.disabled = false;

    // Mostrar resultado

    resultadoFinal.textContent = totalClicks;

    resultadoDetalle.textContent =
        totalClicks === 1
            ? "Clic registrado en " + duracionPartida + " segundos"
            : "Clics registrados en " + duracionPartida + " segundos";

    panelResultado.hidden = false;

    estadoPartida.textContent =
        "Tiempo terminado.";

    mensaje.textContent =
        "¡Partida finalizada! Lograste " +
        totalClicks + " clics.";

    actualizarMeta();

}


// ========================================
// REINICIAR PARTIDA
// ========================================

function reiniciarPartida() {

    partidaActiva = false;

    if (animacionId !== null) {

        cancelAnimationFrame(animacionId);

        animacionId = null;

    }

    totalClicks = 0;

    tiempoInicio = null;

    duracionPartida =
        Number(selectorDuracion.value);

    contador.textContent = "0";

    temporizador.textContent = "00:00.000";

    // Restaurar controles

    botonSumar.disabled = true;

    botonIniciar.disabled = false;

    selectorDuracion.disabled = false;

    // Ocultar resultados anteriores

    panelResultado.hidden = true;

    resultadoFinal.textContent = "0";

    estadoPartida.textContent =
        "Selecciona una duración e inicia la partida.";

    mensaje.textContent =
        "¡Prepárate para comenzar!";

    actualizarMeta();

}


// ========================================
// EVENTOS DE LOS BOTONES
// ========================================

botonIniciar.addEventListener(
    "click",
    iniciarPartida
);

botonSumar.addEventListener(
    "click",
    registrarClick
);

botonReiniciar.addEventListener(
    "click",
    reiniciarPartida
);


// ========================================
// CAMBIAR DURACIÓN
// ========================================

selectorDuracion.addEventListener("change", function () {

    duracionPartida =
        Number(selectorDuracion.value);

    temporizador.textContent = "00:00.000";

});


// ========================================
// CAMBIAR META
// ========================================

metaInput.addEventListener(
    "input",
    actualizarMeta
);


// ========================================
// INICIALIZACIÓN
// ========================================

reiniciarPartida();
