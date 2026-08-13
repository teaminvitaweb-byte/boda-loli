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


/* =====================================
   ABRIR INVITACIÓN
===================================== */

if (openButton) {

    openButton.addEventListener("click", () => {

        console.log("💌 Abriendo invitación");


        /* =============================
           ABRIR SOBRE
        ============================= */

        if (envelope) {

            envelope.classList.add("open");

        }


        /* =============================
           MÚSICA
        ============================= */

        if (music) {

            music.play().catch(() => {

                console.log(
                    "El navegador bloqueó el audio"
                );

            });

        }


        /* =============================
           MOSTRAR INVITACIÓN
        ============================= */

        setTimeout(() => {

            if (envelopeScreen) {

                envelopeScreen.style.display =
                    "none";

            }


            if (invitation) {

                invitation.classList.remove(
                    "hidden"
                );

                invitation.classList.add(
                    "show"
                );

            }


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }, 1500);

    });

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

            (distance %
                (1000 * 60 * 60 * 24))
            /
            (1000 * 60 * 60)

        );


    /* =============================
       MINUTOS
    ============================= */

    const minutes =
        Math.floor(

            (distance %
                (1000 * 60 * 60))
            /
            (1000 * 60)

        );


    /* =============================
       SEGUNDOS
    ============================= */

    const seconds =
        Math.floor(

            (distance %
                (1000 * 60))
            /
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