
/* =========================================================
   CONFIRMATION — ELIZABETH & CARLOS
   SUPABASE + INVITACIONES + INVITADOS

   FUNCIONAMIENTO:

   1. Carga la invitación mediante ?codigo=
   2. Muestra únicamente el invitado principal
   3. NO muestra Sí / No inicialmente
   4. Al presionar "Confirmar asistencia":
      - Individual → muestra pregunta Sí / No
      - Familia → muestra todos los invitados Sí / No
   5. "Enviar confirmación" guarda en Supabase
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    async () => {


        /* =================================================
           CARGAR HTML
        ================================================== */

        const confirmationContainer =
            document.getElementById(
                "confirmationContainer"
            );


        if (!confirmationContainer) {

            console.error(
                "❌ No existe #confirmationContainer"
            );

            return;

        }


        try {

            const response =
                await fetch(
                    "confirmation/confirmation.html"
                );


            if (!response.ok) {

                throw new Error(
                    `Error HTTP ${response.status}`
                );

            }


            const confirmationHTML =
                await response.text();


            confirmationContainer.innerHTML =
                confirmationHTML;


            console.log(
                "✓ HTML de Confirmation cargado"
            );


        } catch (error) {

            console.error(
                "❌ Error cargando confirmation.html:",
                error
            );

            confirmationContainer.innerHTML = `

                <div
                    style="
                        padding:40px 20px;
                        text-align:center;
                    "
                >

                    <p>
                        No se pudo cargar la sección
                        de confirmación.
                    </p>

                </div>

            `;

            return;

        }


        /* =================================================
           ELEMENTOS
        ================================================== */

        const primaryGuest =
            document.getElementById(
                "confirmationPrimaryGuest"
            );


        const openFormButton =
            document.getElementById(
                "confirmationOpenForm"
            );


        const confirmationForm =
            document.getElementById(
                "confirmationForm"
            );


        const formContent =
            document.getElementById(
                "confirmationFormContent"
            );


        const confirmationSubmit =
            document.getElementById(
                "confirmationSubmit"
            );


        const confirmationMessage =
            document.getElementById(
                "confirmationMessage"
            );


        /* =================================================
           VERIFICAR SUPABASE
        ================================================== */

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "❌ supabaseClient no está disponible."
            );

            return;

        }


        /* =================================================
           OBTENER CÓDIGO
        ================================================== */

        const urlParams =
            new URLSearchParams(
                window.location.search
            );


        const invitationCode =
            (
                urlParams.get("codigo") ||
                ""
            )
                .trim()
                .toUpperCase();


        if (!invitationCode) {

            if (primaryGuest) {

                primaryGuest.textContent =
                    "No se encontró el código de invitación.";

            }

            if (openFormButton) {

                openFormButton.disabled =
                    true;

            }

            return;

        }


        /* =================================================
           VARIABLES
        ================================================== */

        let invitation =
            null;


        let guests =
            [];


        /* =================================================
           CARGAR INVITACIÓN
        ================================================== */

        async function loadInvitation() {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("invitaciones")
                    .select(`
                        id,
                        codigo,
                        nombre,
                        telefono,
                        tipo
                    `)
                    .eq(
                        "codigo",
                        invitationCode
                    )
                    .maybeSingle();


            if (error) {

                throw error;

            }


            return data;

        }


        /* =================================================
           CARGAR INVITADOS
        ================================================== */

        async function loadGuests(
            invitationId
        ) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("invitados")
                    .select(`
                        id,
                        invitacion_id,
                        nombre,
                        asistencia,
                        created_at
                    `)
                    .eq(
                        "invitacion_id",
                        invitationId
                    )
                    .order(
                        "id",
                        {
                            ascending: true
                        }
                    );


            if (error) {

                throw error;

            }


            guests =
                Array.isArray(data)
                    ? data
                    : [];

        }


        /* =================================================
           MOSTRAR INVITADO PRINCIPAL
        ================================================== */

        function renderPrimaryGuest() {

            if (!primaryGuest) {

                return;

            }


            /*
             * Para individual:
             *   invitacion.nombre
             *
             * Para familia:
             *   también mostramos únicamente
             *   el nombre principal de la invitación.
             */

            primaryGuest.textContent =
                invitation.nombre || "";

        }


        /* =================================================
           CREAR BOTÓN DE OPCIÓN
        ================================================== */

        function createOptionButton(
            text,
            value,
            guest
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.textContent =
                text;


            button.dataset.value =
                value;


            if (
                guest.asistencia ===
                value
            ) {

                button.classList.add(
                    "is-selected"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    guest.asistencia =
                        value;


                    const parent =
                        button.parentElement;


                    if (parent) {

                        parent
                            .querySelectorAll(
                                "button"
                            )
                            .forEach(
                                (item) => {

                                    item.classList.remove(
                                        "is-selected"
                                    );

                                }
                            );

                    }


                    button.classList.add(
                        "is-selected"
                    );

                }
            );


            return button;

        }


        /* =================================================
           FORMULARIO INDIVIDUAL
        ================================================== */

        function renderIndividualForm() {

            if (!formContent) {

                return;

            }


            formContent.innerHTML =
                "";


            const guest =
                guests[0];


            if (!guest) {

                formContent.innerHTML = `

                    <p class="confirmation-question">
                        No encontramos un invitado
                        para esta invitación.
                    </p>

                `;

                return;

            }


            const guestName =
                document.createElement(
                    "div"
                );


            guestName.className =
                "confirmation-single-guest";


            guestName.textContent =
                guest.nombre;


            const question =
                document.createElement(
                    "p"
                );


            question.className =
                "confirmation-question";


            question.textContent =
                "¿Asistirás a nuestra boda?";


            const options =
                document.createElement(
                    "div"
                );


            options.className =
                "confirmation-options";


            const yes =
                createOptionButton(
                    "Sí",
                    "si",
                    guest
                );


            const no =
                createOptionButton(
                    "No",
                    "no",
                    guest
                );


            options.appendChild(
                yes
            );


            options.appendChild(
                no
            );


            formContent.appendChild(
                guestName
            );


            formContent.appendChild(
                question
            );


            formContent.appendChild(
                options
            );

        }


        /* =================================================
           FORMULARIO FAMILIA
        ================================================== */

        function renderFamilyForm() {

            if (!formContent) {

                return;

            }


            formContent.innerHTML =
                "";


            const question =
                document.createElement(
                    "p"
                );


            question.className =
                "confirmation-question";


            question.textContent =
                "¿Quiénes nos acompañarán en este día tan especial?";


            formContent.appendChild(
                question
            );


            const family =
                document.createElement(
                    "div"
                );


            family.className =
                "confirmation-family";


            /* =============================================
               ENCABEZADO
            ============================================== */

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "confirmation-family-header";


            header.innerHTML = `

                <span>
                    Invitado
                </span>

                <span>
                    Sí
                </span>

                <span>
                    No
                </span>

            `;


            family.appendChild(
                header
            );


            /* =============================================
               INVITADOS
            ============================================== */

            guests.forEach(
                (guest) => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "confirmation-family-row";


                    const name =
                        document.createElement(
                            "div"
                        );


                    name.className =
                        "confirmation-family-name";


                    name.textContent =
                        guest.nombre;


                    const yesContainer =
                        document.createElement(
                            "div"
                        );


                    yesContainer.className =
                        "confirmation-family-option";


                    const noContainer =
                        document.createElement(
                            "div"
                        );


                    noContainer.className =
                        "confirmation-family-option";


                    const yes =
                        createOptionButton(
                            "Sí",
                            "si",
                            guest
                        );


                    const no =
                        createOptionButton(
                            "No",
                            "no",
                            guest
                        );


                    yesContainer.appendChild(
                        yes
                    );


                    noContainer.appendChild(
                        no
                    );


                    row.appendChild(
                        name
                    );


                    row.appendChild(
                        yesContainer
                    );


                    row.appendChild(
                        noContainer
                    );


                    family.appendChild(
                        row
                    );

                }
            );


            formContent.appendChild(
                family
            );

        }


        /* =================================================
           ABRIR FORMULARIO
        ================================================== */

        if (openFormButton) {

            openFormButton.addEventListener(
                "click",
                () => {

                    if (!invitation) {

                        return;

                    }


                    if (
                        guests.length ===
                        0
                    ) {

                        return;

                    }


                    /*
                     * Mostrar formulario
                     */

                    if (confirmationForm) {

                        confirmationForm.hidden =
                            false;

                    }


                    /*
                     * Ocultar botón inicial
                     */

                    openFormButton.style.display =
                        "none";


                    /*
                     * Dependiendo del tipo
                     */

                    const type =
                        String(
                            invitation.tipo ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    if (
                        type ===
                        "familia"
                    ) {

                        renderFamilyForm();

                    } else {

                        renderIndividualForm();

                    }


                    /*
                     * Llevar suavemente
                     * al formulario
                     */

                    setTimeout(
                        () => {

                            confirmationForm?.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "center"
                            });

                        },
                        100
                    );

                }
            );

        }


        /* =================================================
           ENVIAR CONFIRMACIÓN
        ================================================== */

        if (confirmationSubmit) {

            confirmationSubmit.addEventListener(
                "click",
                async () => {


                    /* =====================================
                       VERIFICAR
                    ====================================== */

                    if (
                        guests.length ===
                        0
                    ) {

                        return;

                    }


                    const pendingGuests =
                        guests.filter(
                            (guest) =>
                                ![
                                    "si",
                                    "no"
                                ].includes(
                                    guest.asistencia
                                )
                        );


                    if (
                        pendingGuests.length >
                        0
                    ) {

                        if (
                            confirmationMessage
                        ) {

                            confirmationMessage.textContent =
                                "Por favor, indica la asistencia antes de continuar.";

                        }


                        return;

                    }


                    /* =====================================
                       DESACTIVAR
                    ====================================== */

                    confirmationSubmit.disabled =
                        true;


                    confirmationSubmit.textContent =
                        "Guardando...";


                    if (
                        confirmationMessage
                    ) {

                        confirmationMessage.textContent =
                            "";

                    }


                    try {


                        /* =================================
                           GUARDAR CADA INVITADO
                        ================================== */

                        for (
                            const guest of guests
                        ) {

                            const {
                                error
                            } =
                                await supabaseClient
                                    .from(
                                        "invitados"
                                    )
                                    .update({

                                        asistencia:
                                            guest.asistencia

                                    })
                                    .eq(
                                        "id",
                                        guest.id
                                    )
                                    .eq(
                                        "invitacion_id",
                                        invitation.id
                                    );


                            if (error) {

                                throw error;

                            }

                        }


                        console.log(
                            "✓ Confirmación guardada"
                        );


                        /* =================================
                           MENSAJE FINAL
                        ================================== */

                        if (
                            confirmationMessage
                        ) {

                            confirmationMessage.textContent =
                                "¡Gracias por confirmar su asistencia! ❤️";

                        }


                        confirmationSubmit.textContent =
                            "Asistencia confirmada";


                    } catch (error) {

                        console.error(
                            "❌ Error guardando confirmación:",
                            error
                        );


                        if (
                            confirmationMessage
                        ) {

                            confirmationMessage.textContent =
                                "No pudimos guardar la confirmación. Inténtalo nuevamente.";

                        }


                        confirmationSubmit.disabled =
                            false;


                        confirmationSubmit.textContent =
                            "Enviar confirmación";

                    }

                }
            );

        }


        /* =================================================
           INICIALIZAR
        ================================================== */

        try {

            invitation =
                await loadInvitation();


            if (!invitation) {

                if (primaryGuest) {

                    primaryGuest.textContent =
                        "No encontramos esta invitación.";

                }


                if (openFormButton) {

                    openFormButton.disabled =
                        true;

                }


                return;

            }


            await loadGuests(
                invitation.id
            );


            /*
             * Mostrar SOLO el invitado principal
             */

            renderPrimaryGuest();


            console.log(
                "✓ Invitación:",
                invitation.codigo
            );


            console.log(
                "✓ Tipo:",
                invitation.tipo
            );


            console.log(
                "✓ Invitados:",
                guests
            );


        } catch (error) {

            console.error(
                "❌ Error inicializando Confirmation:",
                error
            );


            if (primaryGuest) {

                primaryGuest.textContent =
                    "No pudimos cargar los datos de la invitación.";

            }


            if (openFormButton) {

                openFormButton.disabled =
                    true;

            }

        }

    }
);
