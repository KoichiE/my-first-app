// ==========================================
// CONFIGURACIÓN Y ELEMENTOS
// ==========================================

const STORAGE_KEY = "clickChallengeLeaderboard";
const MAX_RECORDS = 10;

const campoNombre = document.getElementById("nombreJugador");
const campoTitulo = document.getElementById("tituloEvento");
const selectorDuracion = document.getElementById("duracion");

const botonIniciar = document.getElementById("iniciar");
const botonClick = document.getElementById("sumar");
const botonReiniciar = document.getElementById("reiniciar");

const temporizador = document.getElementById("temporizador");
const contador = document.getElementById("contador");
const mensaje = document.getElementById("mensaje");
const estadoPartida = document.getElementById("estadoPartida");

const panelResultado = document.getElementById("panelResultado");
const resultadoJugador = document.getElementById("resultadoJugador");
const resultadoFinal = document.getElementById("resultadoFinal");
const mensajeRecord = document.getElementById("mensajeRecord");

const modalRanking = document.getElementById("modalRanking");
const tablaRanking = document.getElementById("tablaRanking");
const rankingVacio = document.getElementById("rankingVacio");
const categoriaRanking = document.getElementById("categoriaRanking");

const barraProgreso = document.getElementById("barraProgreso");
const porcentaje = document.getElementById("porcentaje");
const textoProgreso = document.getElementById("textoProgreso");
const metaInput = document.getElementById("metaInput");

// ==========================================
// VARIABLES DE LA PARTIDA
// ==========================================

let totalClicks = 0;
let tiempoInicio = 0;
let duracionPartida = 10;
let partidaActiva = false;
let animacionId = null;
let jugadorActual = "";

// ==========================================
// FUNCIONES GENERALES
// ==========================================

function formatearTiempo(milisegundos) {
    const minutos = Math.floor(milisegundos / 60000);
    const segundos = Math.floor((milisegundos % 60000) / 1000);
    const milisegundosRestantes = Math.floor(milisegundos % 1000);

    return (
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0") + "." +
        String(milisegundosRestantes).padStart(3, "0")
    );
}

function obtenerMeta() {
    const meta = Number(metaInput.value);

    if (!Number.isFinite(meta) || meta < 1) {
        return 100;
    }

    return Math.floor(meta);
}

function actualizarMeta() {
    const meta = obtenerMeta();
    const progreso = Math.min((totalClicks / meta) * 100, 100);

    barraProgreso.style.width = progreso + "%";
    porcentaje.textContent = Math.floor(progreso) + "%";
    textoProgreso.textContent = `${totalClicks} / ${meta} clics`;
}

function actualizarContador() {
    contador.textContent = totalClicks;
    actualizarMeta();
}

// ==========================================
// LEADERBOARD Y LOCALSTORAGE
// ==========================================

// Estructura:
// {
//   "10": [{ nombre: "Ana", clicks: 50, fecha: "..." }],
//   "20": [],
//   "30": []
// }

function obtenerRankingGuardado() {
    const rankingInicial = {
        "10": [],
        "20": [],
        "30": []
    };

    try {
        const datos = localStorage.getItem(STORAGE_KEY);

        if (!datos) {
            return rankingInicial;
        }

        const ranking = JSON.parse(datos);

        // Validar la estructura recuperada
        for (const tiempo of ["10", "20", "30"]) {
            if (!Array.isArray(ranking[tiempo])) {
                ranking[tiempo] = [];
            }

            ranking[tiempo] = ranking[tiempo]
                .filter(registro =>
                    registro &&
                    typeof registro.nombre === "string" &&
                    Number.isFinite(registro.clicks) &&
                    registro.clicks >= 0
                )
                .sort((a, b) => b.clicks - a.clicks)
                .slice(0, MAX_RECORDS);
        }

        return ranking;

    } catch (error) {
        console.error("No se pudo leer el ranking:", error);
        return rankingInicial;
    }
}

function guardarRanking(ranking) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranking));
        return true;
    } catch (error) {
        console.error("No se pudo guardar el ranking:", error);
        return false;
    }
}

function registrarPuntaje(nombre, clicks, tiempo) {
    const ranking = obtenerRankingGuardado();
    const categoria = String(tiempo);

    const nuevoRegistro = {
        nombre: nombre,
        clicks: clicks,
        fecha: new Date().toISOString()
    };

    ranking[categoria].push(nuevoRegistro);

    ranking[categoria].sort((a, b) => b.clicks - a.clicks);

    const posicion = ranking[categoria].findIndex(
        registro => registro === nuevoRegistro
    );

    const entraEnRanking = posicion !== -1 && posicion < MAX_RECORDS;

    ranking[categoria] = ranking[categoria].slice(0, MAX_RECORDS);

    if (!guardarRanking(ranking)) {
        return {
            guardado: false,
            nuevoRecord: false
        };
    }

    return {
        guardado: true,
        nuevoRecord: entraEnRanking,
        posicion: entraEnRanking ? posicion + 1 : null
    };
}

// ==========================================
// MOSTRAR LEADERBOARD
// ==========================================

function mostrarRanking(tiempo = selectorDuracion.value) {
    const ranking = obtenerRankingGuardado();
    const categoria = String(tiempo);
    const registros = ranking[categoria] || [];

    categoriaRanking.textContent =
        `PARTIDAS DE ${categoria} SEGUNDOS`;

    tablaRanking.innerHTML = "";

    if (registros.length === 0) {
        rankingVacio.classList.remove("hidden");
    } else {
        rankingVacio.classList.add("hidden");

        registros.forEach((registro, index) => {
            const fila = document.createElement("tr");

            const posicion = document.createElement("td");
            posicion.textContent = `#${index + 1}`;

            const nombre = document.createElement("td");
            nombre.textContent = registro.nombre;

            const puntaje = document.createElement("td");
            puntaje.textContent = registro.clicks;

            fila.appendChild(posicion);
            fila.appendChild(nombre);
            fila.appendChild(puntaje);

            tablaRanking.appendChild(fila);
        });
    }

    document.querySelectorAll(".tab-button").forEach(boton => {
        boton.classList.toggle(
            "active",
            boton.dataset.tiempo === categoria
        );
    });

    modalRanking.classList.remove("hidden");
}

function cerrarRanking() {
    modalRanking.classList.add("hidden");
}

// ==========================================
// CRONÓMETRO
// ==========================================

function actualizarTemporizador() {
    if (!partidaActiva) return;

    const tiempoTranscurrido = performance.now() - tiempoInicio;
    const tiempoTotal = duracionPartida * 1000;
    const tiempoRestante = Math.max(0, tiempoTotal - tiempoTranscurrido);

    temporizador.textContent = formatearTiempo(tiempoRestante);

    if (tiempoRestante <= 0) {
        finalizarPartida();
        return;
    }

    animacionId = requestAnimationFrame(actualizarTemporizador);
}

// ==========================================
// INICIAR PARTIDA
// ==========================================

function iniciarPartida() {
    const nombre = campoNombre.value.trim();

    if (!nombre) {
        mensaje.textContent = "Primero debes escribir tu nombre para jugar.";
        campoNombre.focus();
        return;
    }

    if (partidaActiva) return;

    jugadorActual = nombre;
    duracionPartida = Number(selectorDuracion.value);

    totalClicks = 0;
    actualizarContador();

    tiempoInicio = performance.now();
    partidaActiva = true;

    panelResultado.classList.add("hidden");

    botonClick.disabled = false;
    botonIniciar.disabled = true;
    selectorDuracion.disabled = true;
    campoNombre.disabled = true;

    estadoPartida.textContent = "PARTIDA EN CURSO";
    mensaje.textContent = `¡Vamos, ${jugadorActual}! Haz tantos clics como puedas.`;

    temporizador.textContent =
        formatearTiempo(duracionPartida * 1000);

    animacionId = requestAnimationFrame(actualizarTemporizador);
}

// ==========================================
// REGISTRAR CLICS
// ==========================================

function registrarClick() {
    if (!partidaActiva) return;

    const tiempoTranscurrido = performance.now() - tiempoInicio;

    if (tiempoTranscurrido >= duracionPartida * 1000) {
        finalizarPartida();
        return;
    }

    totalClicks++;
    actualizarContador();
}

// ==========================================
// FINALIZAR PARTIDA Y GUARDAR RÉCORD
// ==========================================

function finalizarPartida() {
    if (!partidaActiva) return;

    partidaActiva = false;

    cancelAnimationFrame(animacionId);

    temporizador.textContent =
        formatearTiempo(duracionPartida * 1000);

    botonClick.disabled = true;
    botonIniciar.disabled = false;
    selectorDuracion.disabled = false;
    campoNombre.disabled = false;

    estadoPartida.textContent = "PARTIDA FINALIZADA";
    mensaje.textContent = "¡Se acabó el tiempo!";

    resultadoJugador.textContent =
        `${jugadorActual} · ${duracionPartida} segundos`;

    resultadoFinal.textContent = totalClicks;

    // Registrar automáticamente el resultado
    const resultado = registrarPuntaje(
        jugadorActual,
        totalClicks,
        duracionPartida
    );

    if (!resultado.guardado) {
        mensajeRecord.textContent =
            "No se pudo guardar el resultado en este navegador.";
    } else if (resultado.nuevoRecord) {
        mensajeRecord.textContent =
            `¡Nuevo récord! Ocupas el puesto #${resultado.posicion}.`;
    } else {
        mensajeRecord.textContent =
            "Partida registrada. ¡Intenta entrar al Top 10!";
    }

    panelResultado.classList.remove("hidden");

    // Abrir automáticamente la categoría correspondiente
    mostrarRanking(duracionPartida);
}

// ==========================================
// REINICIAR PARTIDA
// ==========================================

function reiniciarPartida() {
    if (animacionId !== null) {
        cancelAnimationFrame(animacionId);
        animacionId = null;
    }

    partidaActiva = false;
    totalClicks = 0;

    actualizarContador();

    duracionPartida = Number(selectorDuracion.value);

    temporizador.textContent =
        formatearTiempo(duracionPartida * 1000);

    botonClick.disabled = true;
    botonIniciar.disabled = false;
    selectorDuracion.disabled = false;
    campoNombre.disabled = false;

    estadoPartida.textContent = "LISTO PARA JUGAR";
    mensaje.textContent =
        "Escribe tu nombre y presiona iniciar para comenzar.";

    panelResultado.classList.add("hidden");
}

// ==========================================
// EVENTOS
// ==========================================

botonIniciar.addEventListener("click", iniciarPartida);

botonClick.addEventListener("click", registrarClick);

botonReiniciar.addEventListener("click", reiniciarPartida);

metaInput.addEventListener("input", actualizarMeta);

campoTitulo.addEventListener("input", () => {
    const nuevoTitulo = campoTitulo.value.trim();

    document.getElementById("tituloActual").textContent =
        nuevoTitulo || "Click Speed Challenge";
});

selectorDuracion.addEventListener("change", () => {
    duracionPartida = Number(selectorDuracion.value);

    temporizador.textContent =
        formatearTiempo(duracionPartida * 1000);

    actualizarMeta();
});

// Botón superior para abrir ranking
document.getElementById("abrirRanking").addEventListener("click", () => {
    mostrarRanking(selectorDuracion.value);
});

// Botón de ranking al finalizar
document.getElementById("verRankingFinal").addEventListener("click", () => {
    mostrarRanking(duracionPartida);
});

// Cerrar ranking
document.getElementById("cerrarRanking").addEventListener("click", cerrarRanking);

// Cambiar categoría desde las pestañas
document.querySelectorAll(".tab-button").forEach(boton => {
    boton.addEventListener("click", () => {
        mostrarRanking(boton.dataset.tiempo);
    });
});

// Cerrar al hacer clic fuera de la ventana
modalRanking.addEventListener("click", (evento) => {
    if (evento.target === modalRanking) {
        cerrarRanking();
    }
});

// Cerrar con Escape
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        cerrarRanking();
    }
});

// ==========================================
// INICIALIZACIÓN
// ==========================================

reiniciarPartida();
actualizarMeta();