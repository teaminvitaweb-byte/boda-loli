/* =========================================================
   ADMINISTRADOR
   ELIZABETH & CARLOS
   SUPABASE + DASHBOARD
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://svoxekwjzuljcgouzdbl.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_GKcvLn_dwuD8rWvyN1yZSw_-vR-5F5r";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const INVITATION_URL =
    "https://teaminvitaweb-byte.github.io/boda-loli/";


/* =========================================================
   DATOS
========================================================= */

let invitations = [];

let guests = [];


/* =========================================================
   FILTRO ACTUAL
========================================================= */

let currentFilter =
    "all-invitations";


/* =========================================================
   DATOS MOSTRADOS
========================================================= */

let currentRecords = [];


/* =========================================================
   ELEMENTOS
========================================================= */

let searchInput;

let tableBody;

let tableHead;

let tableFooterText;

let listEyebrow;

let listTitle;

let listDescription;


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "===================================="
        );

        console.log(
            "✓ ADMINISTRADOR INICIANDO"
        );

        console.log(
            "===================================="
        );


        cacheElements();


        setupSummaryFilters();


        setupTableActions();


        setupSearch();


        try {

            await loadAdminData();

            updateSummary();

            setFilter(
                "all-invitations"
            );


            console.log(
                "✓ ADMINISTRADOR LISTO"
            );

        } catch (error) {

            console.error(
                "❌ Error:",
                error
            );


            showAdminError(
                "No se pudieron cargar los datos."
            );

        }

    }
);


/* =========================================================
   ELEMENTOS
========================================================= */

function cacheElements() {

    searchInput =
        document.getElementById(
            "searchInput"
        );


    tableBody =
        document.getElementById(
            "tableBody"
        );


    tableHead =
        document.getElementById(
            "tableHead"
        );


    tableFooterText =
        document.getElementById(
            "tableFooterText"
        );


    listEyebrow =
        document.getElementById(
            "listEyebrow"
        );


    listTitle =
        document.getElementById(
            "listTitle"
        );


    listDescription =
        document.getElementById(
            "listDescription"
        );

}


/* =========================================================
   CARGAR DATOS
========================================================= */

async function loadAdminData() {

    console.log(
        "⏳ Cargando invitaciones..."
    );


    const {
        data: invitationData,
        error: invitationError
    } =
        await supabaseClient
            .from("invitaciones")
            .select(`
                id,
                codigo,
                nombre,
                telefono,
                tipo,
                created_at,
                respondido_at,
                whatsapp_enviado_at
            `)
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (invitationError) {

        throw invitationError;

    }


    invitations =
        Array.isArray(
            invitationData
        )
            ? invitationData
            : [];


    console.log(
        `✓ ${invitations.length} invitaciones`
    );


    console.log(
        "⏳ Cargando invitados..."
    );


    const {
        data: guestData,
        error: guestError
    } =
        await supabaseClient
            .from("invitados")
            .select(`
                id,
                invitacion_id,
                nombre,
                asistencia,
                created_at,
                respondido_at
            `)
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (guestError) {

        throw guestError;

    }


    guests =
        Array.isArray(
            guestData
        )
            ? guestData
            : [];


    console.log(
        `✓ ${guests.length} invitados`
    );

}


/* =========================================================
   RESUMEN
========================================================= */

function updateSummary() {

    const totalInvitations =
        invitations.length;


    let respondedInvitations = 0;

    let pendingInvitations = 0;


    invitations.forEach(
        invitation => {

            const invitationGuests =
                getInvitationGuests(
                    invitation.id
                );


            if (
                isInvitationResponded(
                    invitationGuests
                )
            ) {

                respondedInvitations++;

            } else {

                pendingInvitations++;

            }

        }
    );


    const totalGuests =
        guests.length;


    const attendingGuests =
        guests.filter(
            guest =>
                guest.asistencia === "si"
        ).length;


    const declinedGuests =
        guests.filter(
            guest =>
                guest.asistencia === "no"
        ).length;


    setText(
        "totalInvitations",
        totalInvitations
    );


    setText(
        "respondedInvitations",
        respondedInvitations
    );


    setText(
        "pendingInvitations",
        pendingInvitations
    );


    setText(
        "totalGuests",
        totalGuests
    );


    setText(
        "attendingGuests",
        attendingGuests
    );


    setText(
        "declinedGuests",
        declinedGuests
    );


    console.log(
        "📊 RESUMEN",
        {
            totalInvitations,
            respondedInvitations,
            pendingInvitations,
            totalGuests,
            attendingGuests,
            declinedGuests
        }
    );

}


/* =========================================================
   FILTROS
========================================================= */

function setupSummaryFilters() {

    const buttons =
        document.querySelectorAll(
            ".summary-card[data-filter]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setFilter(
                        button.dataset.filter
                    );

                }
            );

        }
    );

}


/* =========================================================
   CAMBIAR FILTRO
========================================================= */

function setFilter(
    filter
) {

    currentFilter =
        filter;


    document
        .querySelectorAll(
            ".summary-card[data-filter]"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter === filter
                );

            }
        );


    updateListHeader();


    applyCurrentFilter();

}


/* =========================================================
   APLICAR FILTRO
========================================================= */

function applyCurrentFilter() {

    const search =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    let records = [];


    /* =====================================================
       INVITACIONES
    ===================================================== */

    if (
        currentFilter ===
            "all-invitations" ||

        currentFilter ===
            "responded-invitations" ||

        currentFilter ===
            "pending-invitations"
    ) {

        records =
            getFilteredInvitations(
                currentFilter
            );


        if (search) {

            records =
                records.filter(
                    invitation => {

                        const name =
                            String(
                                invitation.nombre || ""
                            )
                            .toLowerCase();


                        const phone =
                            String(
                                invitation.telefono || ""
                            )
                            .toLowerCase();


                        const code =
                            String(
                                invitation.codigo || ""
                            )
                            .toLowerCase();


                        return (
                            name.includes(search) ||
                            phone.includes(search) ||
                            code.includes(search)
                        );

                    }
                );

        }


        currentRecords =
            records;


        renderInvitationTable(
            records
        );


        return;

    }


    /* =====================================================
       INVITADOS
    ===================================================== */

    records =
        getFilteredGuests(
            currentFilter
        );


    if (search) {

        records =
            records.filter(
                guest => {

                    const name =
                        String(
                            guest.nombre || ""
                        )
                        .toLowerCase();


                    const invitation =
                        getInvitationById(
                            guest.invitacion_id
                        );


                    const invitationName =
                        String(
                            invitation?.nombre || ""
                        )
                        .toLowerCase();


                    return (
                        name.includes(search) ||
                        invitationName.includes(search)
                    );

                }
            );

    }


    currentRecords =
        records;


    renderGuestTable(
        records
    );

}


/* =========================================================
   FILTROS DE INVITACIONES
========================================================= */

function getFilteredInvitations(
    filter
) {

    if (
        filter ===
        "all-invitations"
    ) {

        return [
            ...invitations
        ];

    }


    return invitations.filter(
        invitation => {

            const invitationGuests =
                getInvitationGuests(
                    invitation.id
                );


            const responded =
                isInvitationResponded(
                    invitationGuests
                );


            if (
                filter ===
                "responded-invitations"
            ) {

                return responded;

            }


            if (
                filter ===
                "pending-invitations"
            ) {

                return !responded;

            }


            return true;

        }
    );

}


/* =========================================================
   FILTROS DE INVITADOS
========================================================= */

function getFilteredGuests(
    filter
) {

    if (
        filter ===
        "all-guests"
    ) {

        return [
            ...guests
        ];

    }


    if (
        filter ===
        "attending-guests"
    ) {

        return guests.filter(
            guest =>
                guest.asistencia ===
                "si"
        );

    }


    if (
        filter ===
        "declined-guests"
    ) {

        return guests.filter(
            guest =>
                guest.asistencia ===
                "no"
        );

    }


    return [];

}


/* =========================================================
   ESTADO DE INVITACIÓN
========================================================= */

function isInvitationResponded(
    invitationGuests
) {

    /*
     * Si no tiene invitados,
     * permanece pendiente.
     */

    if (
        invitationGuests.length === 0
    ) {

        return false;

    }


    /*
     * Una invitación está respondida
     * solamente cuando TODOS sus invitados
     * tienen si o no.
     */

    return invitationGuests.every(
        guest =>
            guest.asistencia === "si" ||
            guest.asistencia === "no"
    );

}


/* =========================================================
   OBTENER INVITADOS
========================================================= */

function getInvitationGuests(
    invitationId
) {

    return guests.filter(
        guest =>
            Number(
                guest.invitacion_id
            ) ===
            Number(
                invitationId
            )
    );

}


/* =========================================================
   OBTENER INVITACIÓN
========================================================= */

function getInvitationById(
    invitationId
) {

    return invitations.find(
        invitation =>
            Number(
                invitation.id
            ) ===
            Number(
                invitationId
            )
    );

}


/* =========================================================
   ESTADO PARA TABLA
========================================================= */

function getInvitationStatus(
    invitation
) {

    const invitationGuests =
        getInvitationGuests(
            invitation.id
        );


    if (
        isInvitationResponded(
            invitationGuests
        )
    ) {

        const allAttend =
            invitationGuests.every(
                guest =>
                    guest.asistencia === "si"
            );


        const allDecline =
            invitationGuests.every(
                guest =>
                    guest.asistencia === "no"
            );


        if (allAttend) {

            return {
                className: "confirmed",
                text: "Respondida"
            };

        }


        if (allDecline) {

            return {
                className: "declined",
                text: "Respondida"
            };

        }


        return {
            className: "confirmed",
            text: "Respondida"
        };

    }


    return {
        className: "pending",
        text: "Pendiente"
    };

}


/* =========================================================
   WHATSAPP - ESTADO
========================================================= */

function getWhatsAppStatus(
    invitation
) {

    if (
        invitation.whatsapp_enviado_at
    ) {

        return {

            className:
                "confirmed",

            text:
                "Enviada",

            date:
                formatDateTime(
                    invitation.whatsapp_enviado_at
                )

        };

    }


    return {

        className:
            "pending",

        text:
            "No enviada",

        date:
            ""

    };

}


/* =========================================================
   FORMATEAR FECHA Y HORA
========================================================= */

function formatDateTime(
    value
) {

    if (!value) {
        return "";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return new Intl.DateTimeFormat(
        "es-SV",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(
        date
    );

}


/* =========================================================
   RENDER INVITACIONES
========================================================= */

function renderInvitationTable(
    records
) {

    tableHead.innerHTML = `

        <tr>

            <th>
                Invitación
            </th>

            <th>
                Teléfono
            </th>

            <th>
                Personas
            </th>

            <th>
                WhatsApp
            </th>

            <th>
                Estado
            </th>

            <th>
                Acción
            </th>

        </tr>

    `;


    if (
        records.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-row"
                >
                    No hay invitaciones que mostrar.
                </td>

            </tr>

        `;


        updateFooter(
            0,
            "invitaciones"
        );


        return;

    }


    tableBody.innerHTML =
        records
            .map(
                invitation =>
                    createInvitationRow(
                        invitation
                    )
            )
            .join("");


    updateFooter(
        records.length,
        "invitaciones"
    );

}


/* =========================================================
   FILA INVITACIÓN
========================================================= */

function createInvitationRow(
    invitation
) {

    const invitationGuests =
        getInvitationGuests(
            invitation.id
        );


    const status =
        getInvitationStatus(
            invitation
        );


    const whatsappStatus =
        getWhatsAppStatus(
            invitation
        );


    return `

        <tr>

            <td>

                <strong>
                    ${escapeHTML(
                        invitation.nombre
                    )}
                </strong>

                <span class="invitation-reference">
                    ${escapeHTML(
                        invitation.codigo || ""
                    )}
                </span>

            </td>


            <td>

                ${escapeHTML(
                    invitation.telefono ||
                    "Sin teléfono"
                )}

            </td>


            <td>

                ${invitationGuests.length}

            </td>


            <td>

                <div class="whatsapp-status">

                    <span
                        class="status ${whatsappStatus.className}"
                    >
                        ${whatsappStatus.text}
                    </span>

                    ${
                        whatsappStatus.date
                            ? `
                                <small class="whatsapp-date">
                                    ${escapeHTML(
                                        whatsappStatus.date
                                    )}
                                </small>
                              `
                            : ""
                    }

                </div>

            </td>


            <td>

                <span
                    class="status ${status.className}"
                >
                    ${status.text}
                </span>

            </td>


            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="action-button"
                        data-action="view-invitation"
                        data-invitation-id="${invitation.id}"
                    >
                        Ver
                    </button>


                    <button
                        type="button"
                        class="action-button"
                        data-action="edit-invitation"
                        data-invitation-id="${invitation.id}"
                    >
                        Editar
                    </button>


                    <button
                        type="button"
                        class="action-button"
                        data-action="whatsapp"
                        data-invitation-id="${invitation.id}"
                    >
                        WhatsApp
                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   RENDER INVITADOS
========================================================= */

function renderGuestTable(
    records
) {

    tableHead.innerHTML = `

        <tr>

            <th>
                Invitado
            </th>

            <th>
                Invitación
            </th>

            <th>
                Código
            </th>

            <th>
                Asistencia
            </th>

        </tr>

    `;


    if (
        records.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-row"
                >
                    No hay invitados que mostrar.
                </td>

            </tr>

        `;


        updateFooter(
            0,
            "invitados"
        );


        return;

    }


    tableBody.innerHTML =
        records
            .map(
                guest =>
                    createGuestRow(
                        guest
                    )
            )
            .join("");


    updateFooter(
        records.length,
        "invitados"
    );

}


/* =========================================================
   FILA INVITADO
========================================================= */

function createGuestRow(
    guest
) {

    const invitation =
        getInvitationById(
            guest.invitacion_id
        );


    let statusClass =
        "pending";


    let statusText =
        "Pendiente";


    if (
        guest.asistencia ===
        "si"
    ) {

        statusClass =
            "confirmed";

        statusText =
            "Asistirá";

    }


    if (
        guest.asistencia ===
        "no"
    ) {

        statusClass =
            "declined";

        statusText =
            "No asistirá";

    }


    return `

        <tr>

            <td>

                <strong class="guest-name-cell">
                    ${escapeHTML(
                        guest.nombre
                    )}
                </strong>

            </td>


            <td>

                ${escapeHTML(
                    invitation?.nombre ||
                    "Sin invitación"
                )}

            </td>


            <td>

                ${escapeHTML(
                    invitation?.codigo ||
                    "—"
                )}

            </td>


            <td>

                <span
                    class="status ${statusClass}"
                >
                    ${statusText}
                </span>

            </td>

        </tr>

    `;

}


/* =========================================================
   CABECERA DINÁMICA
========================================================= */

function updateListHeader() {

    const data = {

        "all-invitations": {

            eyebrow: "INVITACIONES",

            title: "Todas las invitaciones",

            description:
                "Listado completo de invitaciones registradas."

        },

        "responded-invitations": {

            eyebrow: "INVITACIONES",

            title: "Invitaciones respondidas",

            description:
                "Invitaciones donde todos sus invitados ya respondieron."

        },

        "pending-invitations": {

            eyebrow: "INVITACIONES",

            title: "Invitaciones pendientes",

            description:
                "Invitaciones donde todavía falta alguna respuesta."

        },

        "all-guests": {

            eyebrow: "INVITADOS",

            title: "Todos los invitados",

            description:
                "Listado completo de personas invitadas."

        },

        "attending-guests": {

            eyebrow: "INVITADOS",

            title: "Invitados que asistirán",

            description:
                "Personas que confirmaron su asistencia."

        },

        "declined-guests": {

            eyebrow: "INVITADOS",

            title: "Invitados que no asistirán",

            description:
                "Personas que indicaron que no asistirán."

        }

    };


    const current =
        data[currentFilter];


    if (!current) {
        return;
    }


    listEyebrow.textContent =
        current.eyebrow;


    listTitle.textContent =
        current.title;


    listDescription.textContent =
        current.description;


    if (searchInput) {

        searchInput.value = "";

        searchInput.placeholder =
            currentFilter.includes(
                "guests"
            )
                ? "Buscar invitado..."
                : "Buscar invitación...";

    }

}


/* =========================================================
   BUSCADOR
========================================================= */

function setupSearch() {

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        () => {

            applyCurrentFilter();

        }
    );

}


/* =========================================================
   ACCIONES DE TABLA
========================================================= */

function setupTableActions() {

    if (!tableBody) {
        return;
    }


    tableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            const invitationId =
                Number(
                    button.dataset.invitationId
                );


            if (
                action ===
                "view-invitation"
            ) {

                openInvitation(
                    invitationId
                );

            }


            if (
                action ===
                "edit-invitation"
            ) {

                openEditInvitationModal(
                    invitationId
                );

            }


            if (
                action ===
                "whatsapp"
            ) {

                openWhatsApp(
                    invitationId
                );

            }

        }
    );

}


/* =========================================================
   ABRIR INVITACIÓN
========================================================= */

function openInvitation(
    invitationId
) {

    const invitation =
        getInvitationById(
            invitationId
        );


    if (!invitation) {
        return;
    }


    window.open(
        getInvitationPublicUrl(
            invitation.codigo
        ),
        "_blank"
    );

}




/* =========================================================
   WHATSAPP
========================================================= */

async function openWhatsApp(
    invitationId
) {

    const invitation =
        getInvitationById(
            invitationId
        );


    if (!invitation) {
        return;
    }


    const phone =
        normalizePhone(
            invitation.telefono
        );


    if (!phone) {

        alert(
            "Esta invitación no tiene un teléfono válido."
        );

        return;

    }


    const firstName =
        String(
            invitation.nombre || ""
        )
        .trim()
        .split(/\s+/)[0];


    const invitationUrl =
        getInvitationPublicUrl(
            invitation.codigo
        );


    /*
     * Mensaje de WhatsApp.
     *
     * Los emojis se generan directamente
     * mediante Unicode para evitar problemas
     * de codificación del archivo.
     */

    const wavingHand =
        String.fromCodePoint(0x1F44B);

    const pointingRight =
        String.fromCodePoint(0x1F449);

    const winkingFace =
        String.fromCodePoint(0x1F609);


    const message =
        `¡Hola, ${firstName}! ${wavingHand}\n\n` +
        `Pasaba por aquí a dejarte un saludito y algo más...\n\n` +
        `Queremos contarte algo importante de una manera ` +
        `diferente y especial, así que te dejamos este enlace:\n\n` +
        `${pointingRight} ${invitationUrl}\n\n` +
        `¡Entra a ver la sorpresa y nos dejas tu reacción por aquí! ${winkingFace}`;


    /*
     * Verificación en consola.
     */

    console.log(
        "📱 MENSAJE WHATSAPP:"
    );

    console.log(
        message
    );


    console.log(
        "📱 CÓDIGOS UNICODE:"
    );

    for (
        const character of message
    ) {

        console.log(
            character,
            "=",
            "U+" +
            character
                .codePointAt(0)
                .toString(16)
                .toUpperCase()
        );

    }


    /*
     * Codificar el mensaje completo.
     */

    const encodedMessage =
        encodeURIComponent(
            message
        );


    const url =
        `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;


    /*
     * =====================================================
     * GUARDAR FECHA DE ENVÍO
     * =====================================================
     */

    if (
        !invitation.whatsapp_enviado_at
    ) {

        const sentAt =
            new Date().toISOString();


        console.log(
            "⏳ Guardando envío de WhatsApp..."
        );

        console.log(
            "ID:",
            invitation.id
        );

        console.log(
            "Fecha:",
            sentAt
        );


        const {
            error
        } =
            await supabaseClient
                .from("invitaciones")
                .update({

                    whatsapp_enviado_at:
                        sentAt

                })
                .eq(
                    "id",
                    invitation.id
                );


        if (error) {

            console.error(
                "❌ ERROR AL GUARDAR WHATSAPP:",
                error
            );


            alert(
                "No se pudo registrar el envío de WhatsApp."
            );


            return;

        }


        console.log(
            "✓ UPDATE DE WHATSAPP REALIZADO"
        );


        /*
         * Actualizar el registro local.
         */

        const index =
            invitations.findIndex(
                item =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        invitation.id
                    )
            );


        if (
            index !== -1
        ) {

            invitations[index].whatsapp_enviado_at =
                sentAt;

        }


        /*
         * Actualizar la tabla
         * inmediatamente.
         */

        applyCurrentFilter();

    }


    /*
     * =====================================================
     * ABRIR WHATSAPP
     * =====================================================
     */

    window.open(
        url,
        "_blank"
    );

}







/* =========================================================
   TELÉFONO
========================================================= */

function normalizePhone(
    phone
) {

    let value =
        String(
            phone || ""
        )
        .replace(
            /\D/g,
            ""
        );


    if (
        value.length === 8
    ) {

        value =
            "503" +
            value;

    }


    return value;

}


/* =========================================================
   URL
========================================================= */

function getInvitationPublicUrl(
    codigo
) {

    const url =
        new URL(
            INVITATION_URL
        );


    const normalizedCode =
        String(
            codigo || ""
        )
        .trim()
        .toUpperCase();


    url.search = "";


    if (normalizedCode) {

        url.searchParams.set(
            "codigo",
            normalizedCode
        );

    }


    return url.href;

}


/* =========================================================
   FOOTER
========================================================= */

function updateFooter(
    count,
    type
) {

    if (!tableFooterText) {
        return;
    }


    tableFooterText.textContent =
        `Mostrando ${count} ${type}`;

}


/* =========================================================
   TEXTO
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   ERROR
========================================================= */

function showAdminError(
    message
) {

    const main =
        document.querySelector(
            ".admin-main"
        );


    if (!main) {
        return;
    }


    const error =
        document.createElement(
            "div"
        );


    error.style.cssText = `

        margin-bottom:15px;

        padding:12px 14px;

        border:1px solid #D7DED2;

        border-radius:8px;

        background:#EDF2EA;

        color:#59684F;

        font-size:11px;

    `;


    error.textContent =
        message;


    main.prepend(
        error
    );

}


/* =========================================================
   EDITAR INVITACIÓN
========================================================= */

function openEditInvitationModal(
    invitationId
) {

    const invitation =
        getInvitationById(
            invitationId
        );


    if (!invitation) {
        return;
    }


    if (
        document.getElementById(
            "editInvitationModal"
        )
    ) {

        return;

    }


    const invitationGuests =
        getInvitationGuests(
            invitation.id
        );


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "editInvitationModal";


    modal.innerHTML = `

        <div class="admin-modal-backdrop"></div>


        <div
            class="admin-modal"
            role="dialog"
            aria-modal="true"
        >

            <div class="admin-modal-header">

                <div>

                    <p>
                        ${escapeHTML(
                            invitation.codigo
                        )}
                    </p>

                    <h2>
                        Editar invitación
                    </h2>

                </div>


                <button
                    type="button"
                    class="admin-modal-close"
                >
                    ×
                </button>

            </div>


            <form
                class="admin-modal-form"
                id="editInvitationForm"
            >

                <label>

                    <span>
                        Nombre de la invitación
                    </span>

                    <input
                        type="text"
                        name="nombre"
                        required
                        maxlength="100"
                        value="${escapeHTML(
                            invitation.nombre
                        )}"
                    >

                </label>


                <label>

                    <span>
                        Teléfono
                    </span>

                    <input
                        type="text"
                        name="telefono"
                        maxlength="30"
                        value="${escapeHTML(
                            invitation.telefono || ""
                        )}"
                    >

                </label>


                <label>

                    <span>
                        Tipo de invitación
                    </span>

                    <select name="tipo">

                        <option
                            value="individual"
                            ${invitation.tipo === "individual"
                                ? "selected"
                                : ""}
                        >
                            Individual
                        </option>

                        <option
                            value="familia"
                            ${invitation.tipo === "familia"
                                ? "selected"
                                : ""}
                        >
                            Familia
                        </option>

                    </select>

                </label>


                <div class="edit-guests-section">

                    <div class="edit-guests-header">

                        <div>

                            <span>
                                PERSONAS INVITADAS
                            </span>

                            <strong>
                                ${invitationGuests.length}
                            </strong>

                        </div>


                        <button
                            type="button"
                            class="edit-add-guest"
                        >
                            + Agregar persona
                        </button>

                    </div>


                    <div class="edit-guests-list">

                        ${
                            invitationGuests.length
                                ? invitationGuests
                                    .map(
                                        createEditGuestRow
                                    )
                                    .join("")
                                : `
                                    <div class="edit-no-guests">
                                        Esta invitación no tiene personas registradas.
                                    </div>
                                `
                        }

                    </div>

                </div>


                <div class="admin-modal-actions">

                    <button
                        type="button"
                        class="admin-modal-cancel"
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        class="admin-modal-submit"
                    >
                        Guardar cambios
                    </button>

                </div>

            </form>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    requestAnimationFrame(
        () => {

            modal.classList.add(
                "is-open"
            );

        }
    );


    const close =
        () => {

            modal.classList.remove(
                "is-open"
            );


            setTimeout(
                () => {

                    modal.remove();

                },
                200
            );

        };


    modal
        .querySelector(
            ".admin-modal-close"
        )
        .addEventListener(
            "click",
            close
        );


    modal
        .querySelector(
            ".admin-modal-cancel"
        )
        .addEventListener(
            "click",
            close
        );


    modal
        .querySelector(
            ".admin-modal-backdrop"
        )
        .addEventListener(
            "click",
            close
        );


    modal
        .querySelector(
            ".edit-add-guest"
        )
        .addEventListener(
            "click",
            () => {

                addNewGuestRow(
                    modal
                );

            }
        );


    const guestList =
        modal.querySelector(
            ".edit-guests-list"
        );


    guestList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-remove-guest]"
                );


            if (!button) {
                return;
            }


            const row =
                button.closest(
                    ".edit-guest-row"
                );


            if (row) {

                removeGuestRow(
                    row
                );

            }

        }
    );


    modal
        .querySelector(
            "#editInvitationForm"
        )
        .addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                await saveEditedInvitation(
                    invitation,
                    modal,
                    event.target,
                    close
                );

            }
        );

}


/* =========================================================
   FILA EDITAR PERSONA
========================================================= */

function createEditGuestRow(
    guest
) {

    const status =
        guest.asistencia ||
        "pendiente";


    return `

        <div
            class="edit-guest-row"
            data-guest-id="${guest.id}"
        >

            <div class="edit-guest-main">

                <input
                    type="text"
                    class="edit-guest-name"
                    maxlength="100"
                    value="${escapeHTML(
                        guest.nombre
                    )}"
                    placeholder="Nombre"
                >


                <select
                    class="edit-guest-status"
                >

                    <option
                        value="pendiente"
                        ${status === "pendiente"
                            ? "selected"
                            : ""}
                    >
                        Pendiente
                    </option>


                    <option
                        value="si"
                        ${status === "si"
                            ? "selected"
                            : ""}
                    >
                        Confirmado
                    </option>


                    <option
                        value="no"
                        ${status === "no"
                            ? "selected"
                            : ""}
                    >
                        No asistirá
                    </option>

                </select>

            </div>


            <button
                type="button"
                class="edit-remove-guest"
                data-remove-guest
            >
                ×
            </button>

        </div>

    `;

}


/* =========================================================
   AGREGAR PERSONA
========================================================= */

function addNewGuestRow(
    modal
) {

    const list =
        modal.querySelector(
            ".edit-guests-list"
        );


    const empty =
        list.querySelector(
            ".edit-no-guests"
        );


    if (empty) {
        empty.remove();
    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "edit-guest-row";


    row.innerHTML = `

        <div class="edit-guest-main">

            <input
                type="text"
                class="edit-guest-name"
                maxlength="100"
                placeholder="Nombre"
            >


            <select class="edit-guest-status">

                <option value="pendiente">
                    Pendiente
                </option>

                <option value="si">
                    Confirmado
                </option>

                <option value="no">
                    No asistirá
                </option>

            </select>

        </div>


        <button
            type="button"
            class="edit-remove-guest"
            data-remove-guest
        >
            ×
        </button>

    `;


    list.appendChild(
        row
    );


    updateModalGuestCount(
        modal
    );


    row
        .querySelector(
            ".edit-guest-name"
        )
        .focus();

}


/* =========================================================
   ELIMINAR PERSONA
========================================================= */

function removeGuestRow(
    row
) {

    const guestId =
        row.dataset.guestId;


    if (
        guestId &&
        !confirm(
            "¿Deseas eliminar esta persona?"
        )
    ) {

        return;

    }


    row.remove();

}


/* =========================================================
   CONTADOR MODAL
========================================================= */

function updateModalGuestCount(
    modal
) {

    const counter =
        modal.querySelector(
            ".edit-guests-header strong"
        );


    const count =
        modal.querySelectorAll(
            ".edit-guest-row"
        ).length;


    if (counter) {

        counter.textContent =
            count;

    }

}


/* =========================================================
   GUARDAR EDICIÓN
========================================================= */

async function saveEditedInvitation(
    invitation,
    modal,
    form,
    close
) {

    const submit =
        form.querySelector(
            ".admin-modal-submit"
        );


    const nombre =
        form.elements.nombre.value.trim();


    const telefono =
        form.elements.telefono.value.trim();


    const tipo =
        form.elements.tipo.value;


    if (!nombre) {

        alert(
            "El nombre es obligatorio."
        );

        return;

    }


    const rows =
        Array.from(
            modal.querySelectorAll(
                ".edit-guest-row"
            )
        );


    const changes = [];


    for (
        const row of rows
    ) {

        const name =
            row.querySelector(
                ".edit-guest-name"
            )
            .value
            .trim();


        const status =
            row.querySelector(
                ".edit-guest-status"
            )
            .value;


        if (!name) {

            alert(
                "Todas las personas deben tener nombre."
            );

            return;

        }


        changes.push({

            id:
                row.dataset.guestId
                    ? Number(
                        row.dataset.guestId
                    )
                    : null,

            nombre:
                name,

            asistencia:
                status

        });

    }


    try {

        submit.disabled =
            true;


        submit.textContent =
            "Guardando...";


        /* ================================================
           INVITACIÓN
        ================================================= */

        const {
            data: updatedInvitation,
            error: invitationError
        } =
            await supabaseClient
                .from("invitaciones")
                .update({

                    nombre,

                    telefono:
                        telefono ||
                        null,

                    tipo

                })
                .eq(
                    "id",
                    invitation.id
                )
                .select()
                .single();


        if (invitationError) {

            throw invitationError;

        }


        /* ================================================
           INVITADOS ORIGINALES
        ================================================= */

        const original =
            getInvitationGuests(
                invitation.id
            );


        const originalIds =
            original.map(
                guest =>
                    Number(
                        guest.id
                    )
            );


        const currentIds =
            changes
                .filter(
                    guest =>
                        guest.id !== null
                )
                .map(
                    guest =>
                        Number(
                            guest.id
                        )
                );


        const deletedIds =
            originalIds.filter(
                id =>
                    !currentIds.includes(
                        id
                    )
            );


        /* ================================================
           ELIMINAR
        ================================================= */

        if (
            deletedIds.length
        ) {

            const {
                error
            } =
                await supabaseClient
                    .from("invitados")
                    .delete()
                    .in(
                        "id",
                        deletedIds
                    );


            if (error) {

                throw error;

            }

        }


        /* ================================================
           ACTUALIZAR / CREAR
        ================================================= */

        for (
            const guest of changes
        ) {

            if (
                guest.id !== null
            ) {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from("invitados")
                        .update({

                            nombre:
                                guest.nombre,

                            asistencia:
                                guest.asistencia

                        })
                        .eq(
                            "id",
                            guest.id
                        )
                        .select()
                        .single();


                if (error) {

                    throw error;

                }


                const index =
                    guests.findIndex(
                        item =>
                            Number(
                                item.id
                            ) ===
                            Number(
                                guest.id
                            )
                    );


                if (
                    index !== -1
                ) {

                    guests[index] =
                        data;

                }

            } else {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from("invitados")
                        .insert({

                            invitacion_id:
                                invitation.id,

                            nombre:
                                guest.nombre,

                            asistencia:
                                guest.asistencia

                        })
                        .select()
                        .single();


                if (error) {

                    throw error;

                }


                guests.push(
                    data
                );

            }

        }


        /* ================================================
           ACTUALIZAR LOCAL
        ================================================= */

        const invitationIndex =
            invitations.findIndex(
                item =>
                    Number(
                        item.id
                    ) ===
                    Number(
                        invitation.id
                    )
            );


        if (
            invitationIndex !== -1
        ) {

            /*
             * Conservamos también
             * whatsapp_enviado_at.
             */

            invitations[
                invitationIndex
            ] = {

                ...updatedInvitation,

                whatsapp_enviado_at:
                    updatedInvitation.whatsapp_enviado_at ??
                    invitations[
                        invitationIndex
                    ].whatsapp_enviado_at

            };

        }


        updateSummary();


        applyCurrentFilter();


        close();


        alert(
            "La invitación se actualizó correctamente."
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            error.message ||
            "No se pudieron guardar los cambios."
        );


        submit.disabled =
            false;


        submit.textContent =
            "Guardar cambios";

    }

}


/* =========================================================
   FIN
========================================================= */

console.log(
    "✓ admin.js cargado"
);