/* =====================================
   BODA ELIZABETH & CARLOS
   JAVASCRIPT PRINCIPAL
===================================== */


/* =====================================
   ELEMENTOS
===================================== */

const openButton =
    document.getElementById("openButton");

const envelopeScreen =
    document.getElementById("envelopeScreen");

const invitation =
    document.getElementById("invitation");

const envelope =
    document.querySelector(".envelope");

const music =
    document.getElementById("music");

const musicButton =
    document.getElementById("musicButton");


/* =====================================
   PREPARAR IMAGEN PRINCIPAL
===================================== */

function preloadImage(src) {

    return new Promise((resolve) => {

        const image = new Image();

        image.onload = () => {

            resolve();

        };

        image.onerror = () => {

            console.warn(
                "No se pudo cargar:",
                src
            );

            resolve();

        };

        image.src = src;

    });

}


/* =====================================
   PREPARAR FUENTES
===================================== */

function preloadFonts() {

    if (
        document.fonts &&
        document.fonts.ready
    ) {

        return document.fonts.ready;

    }

    return Promise.resolve();

}


/* =====================================
   PREPARAR PORTADA
===================================== */

async function prepareInvitation() {

    console.log(
        "⏳ Preparando portada..."
    );


    /* =============================
       IMAGEN PRINCIPAL
    ============================= */

    await preloadImage(
        "assets/images/Eli-Carlos.jpeg"
    );


    /* =============================
       IMAGEN CEREMONIA
    ============================= */

    await preloadImage(
        "assets/images/talapo-azul.jpg"
    );


    /* =============================
       IMAGENES DECORATIVAS
    ============================= */

    await preloadImage(
        "assets/images/rasgadosppal.png"
    );

    await preloadImage(
        "assets/images/rasgadosppal2.png"
    );

    await preloadImage(
        "assets/images/rasgados.png"
    );

    await preloadImage(
        "assets/images/rasgadostransp.png"
    );

    await preloadImage(
        "assets/images/mano.png"
    );


    /* =============================
       FUENTES
    ============================= */

    await preloadFonts();


    /* =============================
       FORZAR RECALCULO
    ============================= */

    if (invitation) {

        invitation.offsetHeight;

    }


    console.log(
        "✓ Portada preparada"
    );

}


/* =====================================
   MOSTRAR INVITACIÓN
===================================== */

function showInvitation() {

    if (!invitation) {

        return;

    }


    console.log(
        "💒 Mostrando invitación"
    );


    /* =============================
       OCULTAR SOBRE COMPLETAMENTE
    ============================= */

    if (envelopeScreen) {

        envelopeScreen.style.display =
            "none";

    }


    /* =============================
       MOSTRAR INVITACIÓN
    ============================= */

    invitation.classList.remove(
        "hidden"
    );


    /*
       Mostramos la invitación
       directamente.

       La portada ya está completa:
       foto + nombres + alianzas +
       Nos casamos + fecha + hora.
    */

    invitation.classList.add(
        "show"
    );


    /* =============================
       VOLVER ARRIBA
    ============================= */

    window.scrollTo(
        0,
        0
    );


    console.log(
        "✓ Portada completa visible"
    );


    /* =============================
       ACTUALIZAR MÚSICA
    ============================= */

    updateMusicButton();

}


/* =====================================
   ABRIR INVITACIÓN
===================================== */

if (openButton) {

    openButton.addEventListener(
        "click",
        async () => {

            console.log(
                "💌 Abriendo invitación"
            );


            /* =============================
               EVITAR DOBLE CLICK
            ============================= */

            openButton.disabled = true;


            /* =============================
               PREPARAR PORTADA
            ============================= */

            await prepareInvitation();


            /* =============================
               MÚSICA
            ============================= */

            if (music) {

                music.play()
                    .then(() => {

                        updateMusicButton();

                    })
                    .catch(() => {

                        console.log(
                            "El navegador bloqueó el audio"
                        );

                        updateMusicButton();

                    });

            }


            /* =============================
               MOSTRAR PORTADA
            ============================= */

            showInvitation();

        }
    );

}


/* =====================================
   CONTROL DE MÚSICA
===================================== */

if (musicButton && music) {

    musicButton.addEventListener(
        "click",
        toggleMusic
    );


    music.addEventListener(
        "play",
        updateMusicButton
    );


    music.addEventListener(
        "pause",
        updateMusicButton
    );


    music.addEventListener(
        "ended",
        updateMusicButton
    );


    updateMusicButton();

}


/* =====================================
   ACTIVAR / DESACTIVAR MÚSICA
===================================== */

function toggleMusic() {

    if (!music) {

        return;

    }


    if (music.paused) {

        music.play()
            .then(() => {

                updateMusicButton();

            })
            .catch(() => {

                console.log(
                    "No se pudo reproducir la música"
                );

            });

    } else {

        music.pause();

        updateMusicButton();

    }

}


/* =====================================
   ACTUALIZAR BOTÓN DE MÚSICA
===================================== */

function updateMusicButton() {

    if (!musicButton || !music) {

        return;

    }


    if (music.paused) {

        musicButton.classList.remove(
            "is-playing"
        );

        musicButton.classList.add(
            "is-paused"
        );


        musicButton.setAttribute(
            "aria-label",
            "Activar música"
        );


        musicButton.setAttribute(
            "title",
            "Activar música"
        );


        musicButton.setAttribute(
            "aria-pressed",
            "false"
        );

    } else {

        musicButton.classList.remove(
            "is-paused"
        );

        musicButton.classList.add(
            "is-playing"
        );


        musicButton.setAttribute(
            "aria-label",
            "Silenciar música"
        );


        musicButton.setAttribute(
            "title",
            "Silenciar música"
        );


        musicButton.setAttribute(
            "aria-pressed",
            "true"
        );

    }

}


/* =====================================
   CUENTA REGRESIVA
   10 OCTUBRE 2026 - 4:00 PM
===================================== */

const weddingDate =
    new Date(
        "2026-10-10T16:00:00"
    ).getTime();


function updateCountdown() {

    const now =
        new Date().getTime();


    const distance =
        weddingDate - now;


    /* =============================
       FECHA TERMINADA
    ============================= */

    if (distance <= 0) {

        setCountdownValue(
            "days",
            0
        );

        setCountdownValue(
            "hours",
            0
        );

        setCountdownValue(
            "minutes",
            0
        );

        setCountdownValue(
            "seconds",
            0
        );

        return;

    }


    /* =============================
       DÍAS
    ============================= */

    const days =
        Math.floor(
            distance /
            (1000 * 60 * 60 * 24)
        );


    /* =============================
       HORAS
    ============================= */

    const hours =
        Math.floor(
            (
                distance %
                (1000 * 60 * 60 * 24)
            ) /
            (1000 * 60 * 60)
        );


    /* =============================
       MINUTOS
    ============================= */

    const minutes =
        Math.floor(
            (
                distance %
                (1000 * 60 * 60)
            ) /
            (1000 * 60)
        );


    /* =============================
       SEGUNDOS
    ============================= */

    const seconds =
        Math.floor(
            (
                distance %
                (1000 * 60)
            ) /
            1000
        );


    /* =============================
       MOSTRAR CONTADOR
    ============================= */

    setCountdownValue(
        "days",
        days
    );

    setCountdownValue(
        "hours",
        hours
    );

    setCountdownValue(
        "minutes",
        minutes
    );

    setCountdownValue(
        "seconds",
        seconds
    );

}


/* =====================================
   ACTUALIZAR VALOR
===================================== */

function setCountdownValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* =====================================
   INICIAR CONTADOR
===================================== */

updateCountdown();


setInterval(
    updateCountdown,
    1000
);