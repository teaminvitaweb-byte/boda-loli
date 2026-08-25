/* =========================================================
   CONFIRMATION — ELIZABETH & CARLOS
   SUPABASE + INVITACIONES + INVITADOS

   FUNCIONAMIENTO:

   1. Carga la invitación mediante ?codigo=
   2. Muestra únicamente el invitado principal
   3. Si no existe confirmación:
      - Individual → botón para confirmar
      - Familia → botón para confirmar
   4. Al confirmar:
      - Individual → Sí / No
      - Familia → todos los invitados Sí / No
      - El formulario aparece dentro de un modal
   5. Guarda la confirmación en Supabase
   6. Después de confirmar:
      - Muestra "Tu confirmación ya fue enviada"
      - NO muestra respuestas inicialmente
      - Muestra botón "Modificar confirmación"
   7. Al modificar:
      - Muestra listado de invitados
      - Muestra respuesta actual
      - Cada invitado tiene lápiz
      - Solo se edita el invitado seleccionado
      - Guardar cambios se habilita únicamente
        cuando existe algún cambio
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


        const confirmationStatus =
            document.getElementById(
                "confirmationStatus"
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
           ELEMENTOS DEL MODAL
        ================================================== */

        const confirmationModal =
            document.getElementById(
                "confirmationModal"
            );


        const confirmationModalContent =
            document.getElementById(
                "confirmationModalContent"
            );


        const confirmationModalCloseButtons =
            document.querySelectorAll(
                "[data-confirmation-close]"
            );


        /*
         * Contenedor original del formulario.
         */

        const confirmationFormOriginalParent =
            confirmationForm?.parentElement || null;


        /* =================================================
           VARIABLES
        ================================================== */

        let invitation =
            null;


        let guests =
            [];


        /*
         * Indica si el modal está funcionando
         * como formulario inicial o como edición.
         */

        let modificationMode =
            false;


        /*
         * Guarda las respuestas originales
         * antes de comenzar una modificación.
         */

        let originalAttendance =
            new Map();


        /*
         * Invitados que actualmente están
         * siendo editados.
         */

        let editingGuests =
            new Set();


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


            primaryGuest.textContent =
                invitation.nombre || "";

        }


        /* =================================================
           OBTENER RESPUESTA NORMALIZADA
        ================================================== */

        function getAttendanceValue(
            guest
        ) {

            return String(
                guest.asistencia ||
                ""
            )
                .trim()
                .toLowerCase();

        }


        /* =================================================
           VERIFICAR SI TODO ESTÁ CONFIRMADO
        ================================================== */

        function isInvitationFullyConfirmed() {

            if (
                guests.length ===
                0
            ) {

                return false;

            }


            return guests.every(
                (guest) =>
                    [
                        "si",
                        "no"
                    ].includes(
                        getAttendanceValue(
                            guest
                        )
                    )
            );

        }


        /* =================================================
           VERIFICAR SI EXISTEN CAMBIOS
        ================================================== */

        function hasAttendanceChanges() {

            return guests.some(
                (guest) => {

                    const original =
                        originalAttendance.get(
                            guest.id
                        );


                    const current =
                        getAttendanceValue(
                            guest
                        );


                    return (
                        original !==
                        current
                    );

                }
            );

        }


        /* =================================================
           ACTUALIZAR ESTADO DEL BOTÓN
        ================================================== */

        function updateModificationButton() {

            if (!confirmationSubmit) {

                return;

            }


            const hasChanges =
                hasAttendanceChanges();


            confirmationSubmit.disabled =
                !hasChanges;


            if (hasChanges) {

                confirmationSubmit.classList.add(
                    "has-changes"
                );

            } else {

                confirmationSubmit.classList.remove(
                    "has-changes"
                );

            }

        }


        /* =================================================
           MOSTRAR ESTADO DE CONFIRMACIÓN
        ================================================== */

        function renderConfirmationStatus() {

            if (!confirmationStatus) {

                return;

            }


            confirmationStatus.innerHTML =
                "";


            /* =============================================
               TÍTULO
            ============================================== */

            const title =
                document.createElement(
                    "h3"
                );


            title.className =
                "confirmation-status-title";


            title.textContent =
                "Tu confirmación ya fue enviada";


            confirmationStatus.appendChild(
                title
            );


            /* =============================================
               SUBTÍTULO
            ============================================== */

            const subtitle =
                document.createElement(
                    "p"
                );


            subtitle.className =
                "confirmation-status-subtitle";


            subtitle.innerHTML =
                "Gracias por confirmar.<br>¿Desea modificar su respuesta?";


            confirmationStatus.appendChild(
                subtitle
            );


            /* =============================================
               BOTÓN MODIFICAR
            ============================================== */

            const modifyButton =
                document.createElement(
                    "button"
                );


            modifyButton.type =
                "button";


            modifyButton.className =
                "confirmation-modify";


            modifyButton.innerHTML = `

                <span>
                    Modificar confirmación
                </span>

            `;


            modifyButton.addEventListener(
                "click",
                () => {

                    openModificationForm();

                }
            );


            confirmationStatus.appendChild(
                modifyButton
            );


            /* =============================================
               MOSTRAR
            ============================================== */

            confirmationStatus.hidden =
                false;


            /* =============================================
               OCULTAR BOTÓN INICIAL
            ============================================== */

            if (openFormButton) {

                openFormButton.style.display =
                    "none";

            }

        }


        /* =================================================
           CREAR BOTÓN SÍ / NO
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
                getAttendanceValue(
                    guest
                ) ===
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


                    /*
                     * Si estamos modificando,
                     * revisar si realmente cambió.
                     */

                    if (
                        modificationMode
                    ) {

                        updateModificationButton();

                    }

                }
            );


            return button;

        }


        /* =================================================
           FORMULARIO INDIVIDUAL INICIAL
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
           FORMULARIO FAMILIA INICIAL
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
           CREAR ICONO DE LÁPIZ
        ================================================== */

        function createEditIcon() {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "confirmation-edit-guest";


            button.setAttribute(
                "aria-label",
                "Modificar respuesta"
            );


            button.innerHTML = `

                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >

                    <path
                        d="
                            M4 16.5
                            V20
                            H7.5
                            L18.8 8.7
                            A2.1 2.1 0 0 0 15.8 5.7
                            L4.5 17
                        "
                    />

                    <path
                        d="
                            M14.7 6.8
                            L17.2 9.3
                        "
                    />

                </svg>

            `;


            return button;

        }


        /* =================================================
           CREAR RESPUESTA VISUAL
        ================================================== */

        function createAttendanceLabel(
            guest
        ) {

            const answer =
                document.createElement(
                    "span"
                );


            answer.className =
                "confirmation-edit-answer";


            const value =
                getAttendanceValue(
                    guest
                );


            if (
                value ===
                "si"
            ) {

                answer.textContent =
                    "✓ Asistirá";


                answer.classList.add(
                    "is-yes"
                );

            } else {

                answer.textContent =
                    "✕ No asistirá";


                answer.classList.add(
                    "is-no"
                );

            }


            return answer;

        }


        /* =================================================
           CREAR OPCIONES PARA UN INVITADO
           DURANTE MODIFICACIÓN
        ================================================== */

        function createEditOptions(
            guest,
            container
        ) {

            container.innerHTML =
                "";


            const options =
                document.createElement(
                    "div"
                );


            options.className =
                "confirmation-edit-options";


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


            container.appendChild(
                options
            );

        }


        /* =================================================
           RENDERIZAR LISTA DE MODIFICACIÓN
        ================================================== */

        function renderModificationForm() {

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
                "Selecciona el invitado cuya respuesta deseas modificar:";


            formContent.appendChild(
                question
            );


            const list =
                document.createElement(
                    "div"
                );


            list.className =
                "confirmation-edit-list";


            guests.forEach(
                (guest) => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "confirmation-edit-row";


                    row.dataset.guestId =
                        guest.id;


                    /* =====================================
                       INFORMACIÓN DEL INVITADO
                    ====================================== */

                    const info =
                        document.createElement(
                            "div"
                        );


                    info.className =
                        "confirmation-edit-info";


                    const name =
                        document.createElement(
                            "div"
                        );


                    name.className =
                        "confirmation-edit-name";


                    name.textContent =
                        guest.nombre;


                    const answer =
                        createAttendanceLabel(
                            guest
                        );


                    info.appendChild(
                        name
                    );


                    info.appendChild(
                        answer
                    );


                    /* =====================================
                       ACCIÓN
                    ====================================== */

                    const action =
                        document.createElement(
                            "div"
                        );


                    action.className =
                        "confirmation-edit-action";


                    const pencil =
                        createEditIcon();


                    action.appendChild(
                        pencil
                    );


                    row.appendChild(
                        info
                    );


                    row.appendChild(
                        action
                    );


                    /* =====================================
                       CONTENEDOR DE OPCIONES
                    ====================================== */

                    const optionsContainer =
                        document.createElement(
                            "div"
                        );


                    optionsContainer.className =
                        "confirmation-edit-options-container";


                    row.appendChild(
                        optionsContainer
                    );


                    /* =====================================
                       CLICK EN LÁPIZ
                    ====================================== */

                    pencil.addEventListener(
                        "click",
                        () => {

                            const isEditing =
                                editingGuests.has(
                                    guest.id
                                );


                            /*
                             * Si ya está editando,
                             * cerrar edición.
                             */

                            if (
                                isEditing
                            ) {

                                editingGuests.delete(
                                    guest.id
                                );


                                row.classList.remove(
                                    "is-editing"
                                );


                                optionsContainer.innerHTML =
                                    "";


                                return;

                            }


                            /*
                             * Abrir edición.
                             */

                            editingGuests.add(
                                guest.id
                            );


                            row.classList.add(
                                "is-editing"
                            );


                            createEditOptions(
                                guest,
                                optionsContainer
                            );

                        }
                    );


                    list.appendChild(
                        row
                    );

                }
            );


            formContent.appendChild(
                list
            );

        }


        /* =================================================
           ABRIR FORMULARIO INICIAL
        ================================================== */

        function openConfirmationForm() {

            if (
                !invitation ||
                guests.length ===
                0
            ) {

                return;

            }


            modificationMode =
                false;


            editingGuests.clear();


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


            if (confirmationMessage) {

                confirmationMessage.textContent =
                    "";

            }


            if (confirmationSubmit) {

                confirmationSubmit.disabled =
                    false;


                confirmationSubmit.classList.remove(
                    "has-changes"
                );


                confirmationSubmit.innerHTML = `

                    <span class="confirmation-icon">

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <circle
                                cx="12"
                                cy="12"
                                r="8.5"
                            />

                            <path
                                d="M8.5 12.2l2.3 2.3 4.8-5"
                            />

                        </svg>

                    </span>

                    <span>
                        Confirmar asistencia
                    </span>

                `;

            }


            openConfirmationModal();

        }


        /* =================================================
           ABRIR FORMULARIO DE MODIFICACIÓN
        ================================================== */

        function openModificationForm() {

            if (
                !invitation ||
                guests.length ===
                0
            ) {

                return;

            }


            modificationMode =
                true;


            editingGuests.clear();


            /*
             * Guardar las respuestas actuales
             * antes de permitir modificaciones.
             */

            originalAttendance =
                new Map();


            guests.forEach(
                (guest) => {

                    originalAttendance.set(
                        guest.id,
                        getAttendanceValue(
                            guest
                        )
                    );

                }
            );


            renderModificationForm();


            if (confirmationMessage) {

                confirmationMessage.textContent =
                    "";

            }


            if (confirmationSubmit) {

                confirmationSubmit.disabled =
                    true;


                confirmationSubmit.classList.remove(
                    "has-changes"
                );


                confirmationSubmit.innerHTML = `

                    <span>
                        Guardar cambios
                    </span>

                `;

            }


            openConfirmationModal();

        }


        /* =================================================
           ABRIR MODAL
        ================================================== */

        function openConfirmationModal() {

            if (
                !confirmationModal ||
                !confirmationModalContent ||
                !confirmationForm
            ) {

                return;

            }


            confirmationModalContent.appendChild(
                confirmationForm
            );


            confirmationForm.hidden =
                false;


            confirmationModal.classList.add(
                "is-open"
            );


            confirmationModal.setAttribute(
                "aria-hidden",
                "false"
            );


            document.body.classList.add(
                "confirmation-modal-open"
            );

        }


        /* =================================================
           CERRAR MODAL
        ================================================== */

        function closeConfirmationModal() {

            if (!confirmationModal) {

                return;

            }


            confirmationModal.classList.remove(
                "is-open"
            );


            confirmationModal.setAttribute(
                "aria-hidden",
                "true"
            );


            document.body.classList.remove(
                "confirmation-modal-open"
            );


            /*
             * Devolver formulario a su posición original.
             */

            if (
                confirmationForm &&
                confirmationFormOriginalParent
            ) {

                confirmationFormOriginalParent.appendChild(
                    confirmationForm
                );

            }


            if (confirmationForm) {

                confirmationForm.hidden =
                    true;

            }

        }


        /* =================================================
           CERRAR MODAL
        ================================================== */

        confirmationModalCloseButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    closeConfirmationModal
                );

            }
        );


        /* =================================================
           ESC PARA CERRAR
        ================================================== */

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                    "Escape" &&
                    confirmationModal?.classList.contains(
                        "is-open"
                    )
                ) {

                    closeConfirmationModal();

                }

            }
        );


        /* =================================================
           BOTÓN CONFIRMAR INICIAL
        ================================================== */

        if (openFormButton) {

            openFormButton.addEventListener(
                "click",
                () => {

                    openConfirmationForm();

                }
            );

        }


        /* =================================================
           ENVIAR / GUARDAR
        ================================================== */

        if (confirmationSubmit) {

            confirmationSubmit.addEventListener(
                "click",
                async () => {


                    /* =====================================
                       MODO MODIFICACIÓN
                    ====================================== */

                    if (
                        modificationMode
                    ) {

                        const changedGuests =
                            guests.filter(
                                (guest) => {

                                    const original =
                                        originalAttendance.get(
                                            guest.id
                                        );


                                    const current =
                                        getAttendanceValue(
                                            guest
                                        );


                                    return (
                                        original !==
                                        current
                                    );

                                }
                            );


                        /*
                         * No permitir guardar
                         * si no existen cambios.
                         */

                        if (
                            changedGuests.length ===
                            0
                        ) {

                            return;

                        }


                        confirmationSubmit.disabled =
                            true;


                        confirmationSubmit.innerHTML = `

                            <span>
                                Guardando cambios...
                            </span>

                        `;


                        if (
                            confirmationMessage
                        ) {

                            confirmationMessage.textContent =
                                "";

                        }


                        try {

                            /*
                             * Guardar únicamente
                             * los invitados modificados.
                             */

                            for (
                                const guest
                                of changedGuests
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
                                "✓ Cambios de confirmación guardados"
                            );


                            if (
                                confirmationMessage
                            ) {

                                confirmationMessage.textContent =
                                    "¡Tu confirmación fue actualizada! ❤️";

                            }


                            confirmationSubmit.innerHTML = `

                                <span>
                                    Cambios guardados
                                </span>

                            `;


                            /*
                             * Actualizar respuestas originales.
                             */

                            changedGuests.forEach(
                                (guest) => {

                                    originalAttendance.set(
                                        guest.id,
                                        getAttendanceValue(
                                            guest
                                        )
                                    );

                                }
                            );


                            setTimeout(
                                () => {

                                    closeConfirmationModal();


                                    /*
                                     * Regresar al estado
                                     * de confirmación.
                                     */

                                    renderConfirmationStatus();

                                },
                                900
                            );


                        } catch (error) {

                            console.error(
                                "❌ Error actualizando confirmación:",
                                error
                            );


                            if (
                                confirmationMessage
                            ) {

                                confirmationMessage.textContent =
                                    "No pudimos guardar los cambios. Inténtalo nuevamente.";

                            }


                            confirmationSubmit.disabled =
                                false;


                            confirmationSubmit.innerHTML = `

                                <span>
                                    Guardar cambios
                                </span>

                            `;


                            updateModificationButton();

                        }


                        return;

                    }


                    /* =====================================
                       MODO CONFIRMACIÓN INICIAL
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
                                    getAttendanceValue(
                                        guest
                                    )
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


                    confirmationSubmit.disabled =
                        true;


                    confirmationSubmit.innerHTML = `

                        <span>
                            Guardando...
                        </span>

                    `;


                    if (
                        confirmationMessage
                    ) {

                        confirmationMessage.textContent =
                            "";

                    }


                    try {

                        for (
                            const guest
                            of guests
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


                        if (
                            confirmationMessage
                        ) {

                            confirmationMessage.textContent =
                                "¡Gracias por confirmar tu asistencia! ❤️";

                        }


                        confirmationSubmit.innerHTML = `

                            <span>
                                Asistencia confirmada
                            </span>

                        `;


                        setTimeout(
                            () => {

                                closeConfirmationModal();


                                renderConfirmationStatus();

                            },
                            900
                        );


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


                        confirmationSubmit.innerHTML = `

                            <span class="confirmation-icon">

                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >

                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="8.5"
                                    />

                                    <path
                                        d="M8.5 12.2l2.3 2.3 4.8-5"
                                    />

                                </svg>

                            </span>

                            <span>
                                Confirmar asistencia
                            </span>

                        `;

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
             * Mostrar únicamente
             * el invitado principal.
             */

            renderPrimaryGuest();


            /*
             * Si todos ya confirmaron,
             * mostrar el estado.
             */

            if (
                isInvitationFullyConfirmed()
            ) {

                renderConfirmationStatus();

            }


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