/* =========================================================
   ÁLBUM — ELIZABETH & CARLOS
   SUPABASE + CARGA DINÁMICA + INTERACCIONES + LIGHTBOX
   CARRUSEL + SWIPE MÓVIL
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

const SUPABASE_BUCKET =
    "fotos-boda";


console.log(
    "✓ Supabase cargado:",
    !!window.supabase
);

console.log(
    "✓ Bucket:",
    SUPABASE_BUCKET
);


/* =========================================================
   CONFIGURACIÓN DE FOTOS
========================================================= */

const MAX_FILE_SIZE =
    10 * 1024 * 1024; // 10 MB por fotografía


const ALLOWED_MIME_TYPES = [

    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"

];


const ALLOWED_EXTENSIONS = [

    "jpg",
    "jpeg",
    "png",
    "webp",
    "heic",
    "heif"

];


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {


        /* =================================================
           CARGAR HTML DEL ÁLBUM
        ================================================== */

        const albumContainer =
            document.getElementById(
                "albumContainer"
            );


        if (!albumContainer) {

            console.error(
                "❌ No existe #albumContainer en el HTML principal."
            );

            return;

        }


        try {

            console.log(
                "⏳ Cargando sección Álbum..."
            );


            const response =
                await fetch(
                    "album/album.html"
                );


            if (!response.ok) {

                throw new Error(
                    `Error HTTP ${response.status}`
                );

            }


            const albumHTML =
                await response.text();


            albumContainer.innerHTML =
                albumHTML;


            console.log(
                "✓ HTML del álbum cargado"
            );


        } catch (error) {

            console.error(
                "❌ No se pudo cargar album.html:",
                error
            );


            albumContainer.innerHTML = `

                <div
                    style="
                        padding:40px 20px;
                        text-align:center;
                        font-family:Georgia,serif;
                    "
                >

                    <p>
                        No se pudo cargar el álbum.
                    </p>

                </div>

            `;


            return;

        }


        /* =================================================
           ELEMENTOS
        ================================================== */

        const sharePhotoButton =
            document.getElementById(
                "sharePhotoButton"
            );


        const viewMemoriesButton =
            document.getElementById(
                "viewMemoriesButton"
            );


        const shareModal =
            document.getElementById(
                "shareModal"
            );


        const closeShareModal =
            document.getElementById(
                "closeShareModal"
            );


        const modalBackdrop =
            document.querySelector(
                ".modal-backdrop"
            );


        const photoInput =
            document.getElementById(
                "photoInput"
            );


        const previewContainer =
            document.getElementById(
                "previewContainer"
            );


        const guestName =
            document.getElementById(
                "guestName"
            );


        const shareSubmit =
            document.getElementById(
                "shareSubmit"
            );


        const lightbox =
            document.getElementById(
                "lightbox"
            );


        const lightboxImage =
            document.getElementById(
                "lightboxImage"
            );


        const lightboxCaption =
            document.getElementById(
                "lightboxCaption"
            );


        const closeLightbox =
            document.getElementById(
                "closeLightbox"
            );


        const albumGallery =
            document.getElementById(
                "albumGallery"
            );


        const photoCounter =
            document.getElementById(
                "photoCounter"
            );


        /* =================================================
           VARIABLES
        ================================================== */

        let selectedFiles = [];

        let currentPhotoIndex = 0;

        let galleryPhotos = [];

        /*
         * NUEVO:
         *
         * Aquí se almacenan TODOS los recuerdos
         * recuperados desde Supabase.
         *
         * No se limita a 4.
         *
         * Esto permite que el carrusel conozca
         * tanto las fotografías antiguas como
         * las nuevas.
         */

        let allMemories = [];

        let touchStartX = 0;

        let touchEndX = 0;


        /* =================================================
           ESTILOS DEL CARRUSEL
        ================================================== */

        const carouselStyles =
            document.createElement(
                "style"
            );


        carouselStyles.textContent = `

            .lightbox-nav {

                position: absolute;

                top: 50%;

                transform:
                    translateY(-50%);

                z-index: 5;

                width: 54px;

                height: 54px;

                display: flex;

                align-items: center;

                justify-content: center;

                border: 1px solid
                    rgba(255,255,255,0.35);

                border-radius: 50%;

                background:
                    rgba(250,248,243,0.14);

                color: #FFFFFF;

                font-family:
                    Georgia,
                    serif;

                font-size: 34px;

                font-weight: 300;

                line-height: 1;

                cursor: pointer;

                backdrop-filter:
                    blur(5px);

                -webkit-backdrop-filter:
                    blur(5px);

                transition:
                    background 0.25s ease,
                    border-color 0.25s ease,
                    transform 0.25s ease,
                    opacity 0.25s ease;

            }


            .lightbox-nav:hover {

                background:
                    rgba(250,248,243,0.28);

                border-color:
                    rgba(255,255,255,0.65);

            }


            .lightbox-nav:active {

                transform:
                    translateY(-50%)
                    scale(0.94);

            }


            .lightbox-prev {
                left: 25px;
            }


            .lightbox-next {
                right: 25px;
            }


            .lightbox-counter {

                position: absolute;

                left: 50%;

                bottom: 48px;

                transform:
                    translateX(-50%);

                z-index: 5;

                padding:
                    5px 13px;

                border:
                    1px solid
                    rgba(255,255,255,0.22);

                border-radius: 30px;

                background:
                    rgba(20,27,21,0.38);

                color:
                    rgba(255,255,255,0.92);

                font-family:
                    'Cormorant Garamond',
                    Georgia,
                    serif;

                font-size: 16px;

                letter-spacing: 1px;

                backdrop-filter:
                    blur(5px);

                -webkit-backdrop-filter:
                    blur(5px);

            }


            .lightbox-image-changing {

                opacity: 0;

                transform:
                    scale(0.985);

            }


            #lightboxImage {

                transition:
                    opacity 0.18s ease,
                    transform 0.18s ease;

            }


            /*
             * Se conserva por compatibilidad
             * con versiones anteriores.
             */

            .album-dynamic-memories {

                display: contents;

            }


            .memory-guest {

                position: relative;

            }


            @media (max-width: 850px) {

                .lightbox-nav {

                    width: 48px;

                    height: 48px;

                    font-size: 30px;

                }


                .lightbox-prev {
                    left: 14px;
                }


                .lightbox-next {
                    right: 14px;
                }

            }


            @media (max-width: 600px) {

                .lightbox {

                    padding: 10px;

                }


                .lightbox-nav {

                    width: 42px;

                    height: 42px;

                    font-size: 27px;

                    background:
                        rgba(20,27,21,0.35);

                }


                .lightbox-prev {
                    left: 8px;
                }


                .lightbox-next {
                    right: 8px;
                }


                .lightbox-counter {

                    bottom: 45px;

                    font-size: 14px;

                    padding:
                        4px 11px;

                }


                .lightbox-caption {

                    bottom: 14px;

                    padding:
                        0 55px;

                }

            }


            @media (max-width: 380px) {

                .lightbox-nav {

                    width: 38px;

                    height: 38px;

                    font-size: 24px;

                }


                .lightbox-prev {
                    left: 5px;
                }


                .lightbox-next {
                    right: 5px;
                }

            }

        `;


        document.head.appendChild(
            carouselStyles
        );


        /* =================================================
           CONTROLES LIGHTBOX
        ================================================== */

        let previousButton = null;

        let nextButton = null;

        let lightboxCounter = null;


        function createLightboxControls() {

            if (!lightbox) {

                return;

            }


            previousButton =
                document.createElement(
                    "button"
                );


            previousButton.type =
                "button";


            previousButton.className =
                "lightbox-nav lightbox-prev";


            previousButton.setAttribute(
                "aria-label",
                "Fotografía anterior"
            );


            previousButton.innerHTML =
                "‹";


            nextButton =
                document.createElement(
                    "button"
                );


            nextButton.type =
                "button";


            nextButton.className =
                "lightbox-nav lightbox-next";


            nextButton.setAttribute(
                "aria-label",
                "Fotografía siguiente"
            );


            nextButton.innerHTML =
                "›";


            lightboxCounter =
                document.createElement(
                    "div"
                );


            lightboxCounter.className =
                "lightbox-counter";


            lightboxCounter.setAttribute(
                "aria-live",
                "polite"
            );


            lightbox.appendChild(
                previousButton
            );


            lightbox.appendChild(
                nextButton
            );


            lightbox.appendChild(
                lightboxCounter
            );


            previousButton.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    showPreviousPhoto();

                }
            );


            nextButton.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    showNextPhoto();

                }
            );

        }


        createLightboxControls();


        /* =================================================
           MODAL COMPARTIR
        ================================================== */

        function openShareModal() {

            if (!shareModal) {

                return;

            }


            shareModal.classList.add(
                "is-open"
            );


            shareModal.setAttribute(
                "aria-hidden",
                "false"
            );


            document.body.style.overflow =
                "hidden";

        }


        function closeShare() {

            if (!shareModal) {

                return;

            }


            shareModal.classList.remove(
                "is-open"
            );


            shareModal.setAttribute(
                "aria-hidden",
                "true"
            );


            document.body.style.overflow =
                "";

        }


        if (sharePhotoButton) {

            sharePhotoButton.addEventListener(
                "click",
                openShareModal
            );

        }


        if (closeShareModal) {

            closeShareModal.addEventListener(
                "click",
                closeShare
            );

        }


        if (modalBackdrop) {

            modalBackdrop.addEventListener(
                "click",
                closeShare
            );

        }


        /* =================================================
           VALIDAR ARCHIVO
        ================================================== */

        function validatePhotoFile(file) {

            if (!file) {

                return {
                    valid: false,
                    message:
                        "Archivo no válido."
                };

            }


            const extension =
                file.name.includes(".")
                    ? file.name
                        .split(".")
                        .pop()
                        .toLowerCase()
                    : "";


            const mime =
                (file.type || "")
                    .toLowerCase();


            const validMime =
                ALLOWED_MIME_TYPES.includes(
                    mime
                );


            const validExtension =
                ALLOWED_EXTENSIONS.includes(
                    extension
                );


            const isHeic =
                extension === "heic" ||
                extension === "heif";


            if (
                !validMime &&
                !validExtension &&
                !isHeic
            ) {

                return {

                    valid: false,

                    message:
                        `"${file.name}" no es una fotografía válida.`

                };

            }


            if (
                file.size >
                MAX_FILE_SIZE
            ) {

                return {

                    valid: false,

                    message:
                        `"${file.name}" supera el límite de 10 MB.`

                };

            }


            return {

                valid: true,

                message: ""

            };

        }


        /* =================================================
           SELECCIONAR FOTOS
        ================================================== */

        if (photoInput) {

            photoInput.addEventListener(
                "change",
                (event) => {

                    const files =
                        Array.from(
                            event.target.files ||
                            []
                        );


                    if (!files.length) {

                        return;

                    }


                    let addedCount =
                        0;


                    files.forEach(
                        (file) => {

                            const validation =
                                validatePhotoFile(
                                    file
                                );


                            if (
                                !validation.valid
                            ) {

                                alert(
                                    validation.message
                                );

                                return;

                            }


                            const duplicate =
                                selectedFiles.some(
                                    (existingFile) =>
                                        existingFile.name ===
                                            file.name &&
                                        existingFile.size ===
                                            file.size &&
                                        existingFile.lastModified ===
                                            file.lastModified
                                );


                            if (duplicate) {

                                return;

                            }


                            selectedFiles.push(
                                file
                            );


                            addedCount++;

                        }
                    );


                    if (addedCount > 0) {

                        renderPreviews();

                    }


                    photoInput.value =
                        "";

                }
            );

        }


        /* =================================================
           PREVISUALIZACIONES
        ================================================== */

        function renderPreviews() {

            if (!previewContainer) {

                return;

            }


            previewContainer.innerHTML =
                "";


            selectedFiles.forEach(
                (file, index) => {

                    const reader =
                        new FileReader();


                    reader.onload =
                        (event) => {

                            const item =
                                document.createElement(
                                    "div"
                                );


                            item.className =
                                "preview-item";


                            const image =
                                document.createElement(
                                    "img"
                                );


                            image.src =
                                event.target.result;


                            image.alt =
                                "Vista previa";


                            const removeButton =
                                document.createElement(
                                    "button"
                                );


                            removeButton.type =
                                "button";


                            removeButton.className =
                                "preview-remove";


                            removeButton.dataset.index =
                                index;


                            removeButton.setAttribute(
                                "aria-label",
                                "Eliminar fotografía"
                            );


                            removeButton.textContent =
                                "×";


                            item.appendChild(
                                image
                            );


                            item.appendChild(
                                removeButton
                            );


                            previewContainer.appendChild(
                                item
                            );

                        };


                    reader.onerror =
                        () => {

                            console.warn(
                                "⚠️ No se pudo generar vista previa:",
                                file.name
                            );

                        };


                    reader.readAsDataURL(
                        file
                    );

                }
            );

        }


        /* =================================================
           ELIMINAR PREVISUALIZACIÓN
        ================================================== */

        if (previewContainer) {

            previewContainer.addEventListener(
                "click",
                (event) => {

                    const button =
                        event.target.closest(
                            ".preview-remove"
                        );


                    if (!button) {

                        return;

                    }


                    const index =
                        Number(
                            button.dataset.index
                        );


                    if (
                        Number.isNaN(index)
                    ) {

                        return;

                    }


                    selectedFiles.splice(
                        index,
                        1
                    );


                    renderPreviews();

                }
            );

        }


        /* =================================================
           SUBIR FOTOS A SUPABASE
           STORAGE + TABLA MEMORIES
        ================================================== */

        async function uploadPhotosToSupabase(
            files,
            name
        ) {

            const uploadedPhotos = [];


            for (
                const file of files
            ) {


                const validation =
                    validatePhotoFile(
                        file
                    );


                if (
                    !validation.valid
                ) {

                    throw new Error(
                        validation.message
                    );

                }


                const extension =
                    file.name.includes(".")
                        ? file.name
                            .split(".")
                            .pop()
                            .toLowerCase()
                        : "jpg";


                const uniqueName =
                    `${Date.now()}-${crypto.randomUUID()}.${extension}`;


                const filePath =
                    `invitados/${uniqueName}`;


                console.log(
                    "⏳ Subiendo:",
                    file.name
                );


                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .storage
                        .from(
                            SUPABASE_BUCKET
                        )
                        .upload(
                            filePath,
                            file,
                            {

                                cacheControl:
                                    "3600",

                                upsert:
                                    false,

                                contentType:
                                    file.type ||
                                    undefined

                            }
                        );


                if (error) {

                    console.error(
                        "❌ Error subiendo archivo:",
                        file.name,
                        error
                    );


                    throw error;

                }


                console.log(
                    "✓ Archivo subido:",
                    data.path
                );


                const {
                    data:
                        publicUrlData
                } =
                    supabaseClient
                        .storage
                        .from(
                            SUPABASE_BUCKET
                        )
                        .getPublicUrl(
                            filePath
                        );


                const publicUrl =
                    publicUrlData.publicUrl;


                console.log(
                    "✓ URL pública:",
                    publicUrl
                );


                const {
                    data:
                        memoryData,
                    error:
                        memoryError
                } =
                    await supabaseClient
                        .from(
                            "memories"
                        )
                        .insert({

                            guest_name:
                                name,

                            file_name:
                                file.name,

                            file_path:
                                filePath,

                            public_url:
                                publicUrl

                        })
                        .select()
                        .single();


                if (memoryError) {

                    console.error(
                        "❌ Error guardando memoria:",
                        memoryError
                    );


                    const {
                        error:
                            removeError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                SUPABASE_BUCKET
                            )
                            .remove([
                                filePath
                            ]);


                    if (removeError) {

                        console.warn(
                            "⚠️ No se pudo eliminar el archivo huérfano:",
                            removeError
                        );

                    }


                    throw memoryError;

                }


                console.log(
                    "✓ Recuerdo registrado:",
                    memoryData
                );


                uploadedPhotos.push({

                    id:
                        memoryData.id,

                    name:
                        name,

                    originalName:
                        file.name,

                    path:
                        filePath,

                    url:
                        publicUrl,

                    createdAt:
                        memoryData.created_at

                });

            }


            return uploadedPhotos;

        }


        /* =================================================
           RENDERIZAR UNA FOTO EN UNA POSICIÓN
           DE LAS 4 POSICIONES EXISTENTES
        ================================================== */

        function renderMemoryInSlot(
            slot,
            memory
        ) {

            if (!slot || !memory) {

                return;

            }


            const button =
                slot.querySelector(
                    ".memory-photo"
                );


            if (!button) {

                return;

            }


            /*
             * Marcar la tarjeta como recuerdo
             * dinámico visible.
             */

            slot.dataset.memory =
                "true";


            slot.dataset.memoryId =
                memory.id;


            slot.classList.add(
                "memory-guest"
            );


            /*
             * Datos utilizados por el
             * lightbox.
             */

            button.dataset.image =
                memory.public_url;


            button.dataset.name =
                memory.guest_name ||
                "Un invitado";


            button.classList.remove(
                "placeholder-photo"
            );


            /*
             * Buscar imagen existente.
             */

            let image =
                button.querySelector(
                    "img"
                );


            /*
             * Si la tarjeta era placeholder,
             * crear la imagen.
             */

            if (!image) {

                image =
                    document.createElement(
                        "img"
                    );

                button.prepend(
                    image
                );

            }


            image.src =
                memory.public_url;


            image.alt =
                `Recuerdo compartido por ${
                    memory.guest_name ||
                    "un invitado"
                }`;


            image.loading =
                "lazy";


            /*
             * Eliminar placeholder
             * si existía.
             */

            const placeholder =
                button.querySelector(
                    ".placeholder-content"
                );


            if (placeholder) {

                placeholder.remove();

            }


            /*
             * Mantener / crear overlay.
             */

            let overlay =
                button.querySelector(
                    ".memory-overlay"
                );


            if (!overlay) {

                overlay =
                    document.createElement(
                        "span"
                    );


                overlay.className =
                    "memory-overlay";


                overlay.innerHTML = `

                    <span>

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <path d="M8 4H4v4"></path>

                            <path d="M4 4l6 6"></path>

                            <path d="M16 20h4v-4"></path>

                            <path d="M20 20l-6-6"></path>

                        </svg>

                    </span>

                `;


                button.appendChild(
                    overlay
                );

            }


            /*
             * Información inferior.
             */

            const info =
                slot.querySelector(
                    ".memory-info"
                );


            if (info) {

                const strong =
                    info.querySelector(
                        "strong"
                    );


                const small =
                    info.querySelector(
                        "small"
                    );


                if (strong) {

                    strong.textContent =
                        memory.guest_name ||
                        "Un invitado";

                }


                if (small) {

                    small.textContent =
                        "Recuerdo compartido";

                }

            }

        }


        /* =================================================
           CARGAR RECUERDOS DESDE SUPABASE
        ================================================== */

        async function loadMemories() {

            if (!albumGallery) {

                console.error(
                    "❌ No existe #albumGallery."
                );

                return;

            }


            console.log(
                "⏳ Cargando recuerdos desde Supabase..."
            );


            const {
                data: memories,
                error
            } =
                await supabaseClient
                    .from("memories")
                    .select(`
                        id,
                        guest_name,
                        file_name,
                        file_path,
                        public_url,
                        created_at
                    `)
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (error) {

                console.error(
                    "❌ Error cargando recuerdos:",
                    error
                );

                return;

            }


            /*
             * =================================================
             * GUARDAR TODOS LOS RECUERDOS
             * =================================================
             *
             * NO usamos limit(4).
             *
             * Supabase conserva y entrega todos.
             *
             * Esto permite que el carrusel conozca
             * las fotos antiguas y las nuevas.
             */

            allMemories =
                Array.isArray(memories)
                    ? memories
                    : [];


            console.log(
                `✓ ${allMemories.length} recuerdos encontrados`
            );


            /*
             * =================================================
             * SOLO 4 PARA LA VISTA PRINCIPAL
             * =================================================
             */

            const visibleMemories =
                allMemories.slice(
                    0,
                    4
                );


            /*
             * =================================================
             * LAS 4 POSICIONES EXISTENTES
             * =================================================
             */

            const slots = [

                albumGallery.querySelector(
                    ".memory-1"
                ),

                albumGallery.querySelector(
                    ".memory-2"
                ),

                albumGallery.querySelector(
                    ".memory-3"
                ),

                albumGallery.querySelector(
                    ".memory-4"
                )

            ];


            /*
             * =================================================
             * RENDERIZAR LAS 4 MÁS RECIENTES
             * =================================================
             */

            visibleMemories.forEach(
                (memory, index) => {

                    const slot =
                        slots[index];


                    if (!slot) {

                        return;

                    }


                    renderMemoryInSlot(
                        slot,
                        memory
                    );

                }
            );


            /*
             * =================================================
             * POSICIONES QUE YA NO TIENEN FOTO
             * =================================================
             *
             * Si antes había 4 fotos y después
             * se ejecuta nuevamente la función,
             * limpiamos solamente las posiciones
             * dinámicas que ya no correspondan.
             */

            slots.forEach(
                (slot, index) => {

                    if (!slot) {

                        return;

                    }


                    if (
                        visibleMemories[index]
                    ) {

                        return;

                    }


                    if (
                        slot.dataset.memory ===
                        "true"
                    ) {

                        slot.removeAttribute(
                            "data-memory"
                        );


                        slot.removeAttribute(
                            "data-memory-id"
                        );


                        slot.classList.remove(
                            "memory-guest"
                        );


                        const button =
                            slot.querySelector(
                                ".memory-photo"
                            );


                        if (button) {

                            delete button.dataset.image;

                        }

                    }

                }
            );


            /*
             * =================================================
             * ACTUALIZAR CONTADOR
             * =================================================
             *
             * Muestra el total almacenado.
             */

            updateCounter();


            console.log(
                "✓ Las 4 posiciones principales fueron actualizadas"
            );


            console.log(
                "✓ Todas las fotos quedan disponibles para el carrusel"
            );

        }


        /* =================================================
           ENVIAR RECUERDOS
        ================================================== */

        if (shareSubmit) {

            shareSubmit.addEventListener(
                "click",
                async () => {


                    if (
                        selectedFiles.length === 0
                    ) {

                        alert(
                            "Primero selecciona al menos una fotografía."
                        );

                        return;

                    }


                    const name =
                        guestName
                            ? guestName.value.trim()
                            : "";


                    if (!name) {

                        alert(
                            "Escribe tu nombre para aparecer en el álbum."
                        );


                        if (guestName) {

                            guestName.focus();

                        }


                        return;

                    }


                    if (
                        name.length > 40
                    ) {

                        alert(
                            "El nombre no puede superar los 40 caracteres."
                        );

                        return;

                    }


                    for (
                        const file of selectedFiles
                    ) {

                        const validation =
                            validatePhotoFile(
                                file
                            );


                        if (
                            !validation.valid
                        ) {

                            alert(
                                validation.message
                            );

                            return;

                        }

                    }


                    try {

                        shareSubmit.disabled =
                            true;


                        shareSubmit.innerHTML = `
                            Subiendo recuerdos...
                        `;


                        console.log(
                            "⏳ Iniciando subida de fotografías..."
                        );


                        const uploadedPhotos =
                            await uploadPhotosToSupabase(
                                selectedFiles,
                                name
                            );


                        console.log(
                            "✓ Fotografías subidas correctamente:",
                            uploadedPhotos
                        );


                        /*
                         * Recargar:
                         *
                         * - todas las fotos desde Supabase
                         * - las 4 más recientes en pantalla
                         * - todas disponibles en el carrusel
                         */

                        await loadMemories();


                        updateCounter();


                        alert(
                            `¡Gracias, ${name}! ❤️\n\n` +
                            `${uploadedPhotos.length} fotografía(s) ` +
                            `se compartieron correctamente.`
                        );


                        selectedFiles =
                            [];


                        if (photoInput) {

                            photoInput.value =
                                "";

                        }


                        if (
                            previewContainer
                        ) {

                            previewContainer.innerHTML =
                                "";

                        }


                        if (guestName) {

                            guestName.value =
                                "";

                        }


                        closeShare();


                    } catch (error) {

                        console.error(
                            "❌ No se pudieron subir las fotografías:",
                            error
                        );


                        alert(
                            "No pudimos subir las fotografías.\n\n" +
                            "Por favor, inténtalo nuevamente."
                        );


                    } finally {

                        shareSubmit.disabled =
                            false;


                        shareSubmit.innerHTML = `

                            Compartir recuerdos

                            <span>

                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >

                                    <path d="M12 4v12"></path>

                                    <path d="M7 11l5 5 5-5"></path>

                                    <path d="M5 20h14"></path>

                                </svg>

                            </span>

                        `;

                    }

                }
            );

        }


        /* =================================================
           VER RECUERDOS
        ================================================== */

        if (viewMemoriesButton) {

            viewMemoriesButton.addEventListener(
                "click",
                () => {

                    if (!albumGallery) {

                        return;

                    }


                    albumGallery.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                }
            );

        }


        /* =================================================
           OBTENER FOTOS PARA EL CARRUSEL
        ================================================== */

        function getGalleryPhotos() {

            const photos = [];


            /*
             * =================================================
             * 1. FOTOGRAFÍAS ORIGINALES DEL DISEÑO
             * =================================================
             *
             * Las dos fotos originales de album.html
             * siguen disponibles en el carrusel.
             */

            if (albumGallery) {

                const buttons =
                    albumGallery.querySelectorAll(
                        ".memory-photo"
                    );


                buttons.forEach(
                    (photo) => {

                        /*
                         * Si esta tarjeta tiene una
                         * fotografía de invitado,
                         * NO la agregamos aquí todavía.
                         *
                         * Se agregará desde allMemories
                         * para mantener todas las fotos.
                         */

                        const memoryId =
                            photo.closest(
                                ".memory"
                            )?.dataset.memoryId;


                        if (memoryId) {

                            return;

                        }


                        const image =
                            photo.dataset.image;


                        if (!image) {

                            return;

                        }


                        const name =
                            photo.dataset.name ||
                            "Un recuerdo especial";


                        const img =
                            photo.querySelector(
                                "img"
                            );


                        const alt =
                            img?.getAttribute(
                                "alt"
                            ) ||
                            name;


                        photos.push({

                            element:
                                photo,

                            image:
                                image,

                            name:
                                name,

                            alt:
                                alt,

                            memoryId:
                                null

                        });

                    }
                );

            }


            /*
             * =================================================
             * 2. TODAS LAS FOTOS DE SUPABASE
             * =================================================
             *
             * Aquí entran:
             *
             * - antiguas
             * - nuevas
             * - las 4 visibles
             *
             * TODAS.
             */

            allMemories.forEach(
                (memory) => {

                    if (!memory.public_url) {

                        return;

                    }


                    const visibleSlot =
                        albumGallery?.querySelector(
                            `[data-memory-id="${CSS.escape(String(memory.id))}"]`
                        );


                    const visibleButton =
                        visibleSlot?.querySelector(
                            ".memory-photo"
                        );


                    photos.push({

                        element:
                            visibleButton || null,

                        image:
                            memory.public_url,

                        name:
                            memory.guest_name ||
                            "Un invitado",

                        alt:
                            `Recuerdo compartido por ${
                                memory.guest_name ||
                                "un invitado"
                            }`,

                        memoryId:
                            memory.id

                    });

                }
            );


            return photos;

        }


        /* =================================================
           ACTUALIZAR CONTROLES
        ================================================== */

        function updateCarouselControls() {

            if (
                !lightboxCounter ||
                galleryPhotos.length === 0
            ) {

                return;

            }


            lightboxCounter.textContent =
                `${currentPhotoIndex + 1} / ${galleryPhotos.length}`;


            const showNavigation =
                galleryPhotos.length > 1;


            if (previousButton) {

                previousButton.style.display =
                    showNavigation
                        ? "flex"
                        : "none";

            }


            if (nextButton) {

                nextButton.style.display =
                    showNavigation
                        ? "flex"
                        : "none";

            }

        }


        /* =================================================
           MOSTRAR FOTO
        ================================================== */

        function showPhoto(
            index,
            animate = true
        ) {

            const updatedPhotos =
                getGalleryPhotos();


            if (
                updatedPhotos.length === 0
            ) {

                return;

            }


            galleryPhotos =
                updatedPhotos;


            if (
                index < 0
            ) {

                index =
                    galleryPhotos.length - 1;

            }


            if (
                index >=
                galleryPhotos.length
            ) {

                index =
                    0;

            }


            currentPhotoIndex =
                index;


            const photo =
                galleryPhotos[
                    currentPhotoIndex
                ];


            if (!photo) {

                return;

            }


            if (
                animate &&
                lightboxImage
            ) {

                lightboxImage.classList.add(
                    "lightbox-image-changing"
                );


                setTimeout(
                    () => {

                        updateLightboxImage(
                            photo
                        );

                    },
                    100
                );

            } else {

                updateLightboxImage(
                    photo
                );

            }

        }


        /* =================================================
           ACTUALIZAR LIGHTBOX
        ================================================== */

        function updateLightboxImage(
            photo
        ) {

            if (!lightboxImage) {

                return;

            }


            lightboxImage.src =
                photo.image;


            lightboxImage.alt =
                photo.alt;


            if (lightboxCaption) {

                lightboxCaption.textContent =
                    photo.name;

            }


            updateCarouselControls();


            requestAnimationFrame(
                () => {

                    lightboxImage.classList.remove(
                        "lightbox-image-changing"
                    );

                }
            );

        }


        /* =================================================
           FOTO ANTERIOR
        ================================================== */

        function showPreviousPhoto() {

            galleryPhotos =
                getGalleryPhotos();


            if (
                galleryPhotos.length <= 1
            ) {

                return;

            }


            currentPhotoIndex =
                currentPhotoIndex - 1;


            if (
                currentPhotoIndex < 0
            ) {

                currentPhotoIndex =
                    galleryPhotos.length - 1;

            }


            showPhoto(
                currentPhotoIndex
            );

        }


        /* =================================================
           FOTO SIGUIENTE
        ================================================== */

        function showNextPhoto() {

            galleryPhotos =
                getGalleryPhotos();


            if (
                galleryPhotos.length <= 1
            ) {

                return;

            }


            currentPhotoIndex =
                currentPhotoIndex + 1;


            if (
                currentPhotoIndex >=
                galleryPhotos.length
            ) {

                currentPhotoIndex =
                    0;

            }


            showPhoto(
                currentPhotoIndex
            );

        }


        /* =================================================
           ABRIR LIGHTBOX
        ================================================== */

        if (albumGallery) {

            albumGallery.addEventListener(
                "click",
                (event) => {

                    const photoButton =
                        event.target.closest(
                            ".memory-photo"
                        );


                    if (!photoButton) {

                        return;

                    }


                    const image =
                        photoButton.dataset.image;


                    /*
                     * Placeholder:
                     * no abrir.
                     */

                    if (!image) {

                        return;

                    }


                    galleryPhotos =
                        getGalleryPhotos();


                    /*
                     * Buscar primero por el elemento
                     * visible.
                     */

                    let clickedIndex =
                        galleryPhotos.findIndex(
                            (photo) =>
                                photo.element ===
                                photoButton
                        );


                    /*
                     * Si es una fotografía de invitado,
                     * buscar también por su ID.
                     */

                    if (
                        clickedIndex === -1
                    ) {

                        const memoryId =
                            photoButton.closest(
                                ".memory"
                            )?.dataset.memoryId;


                        if (memoryId) {

                            clickedIndex =
                                galleryPhotos.findIndex(
                                    (photo) =>
                                        String(
                                            photo.memoryId
                                        ) ===
                                        String(
                                            memoryId
                                        )
                                );

                        }

                    }


                    if (
                        clickedIndex === -1
                    ) {

                        return;

                    }


                    currentPhotoIndex =
                        clickedIndex;


                    showPhoto(
                        currentPhotoIndex,
                        false
                    );


                    if (lightbox) {

                        lightbox.classList.add(
                            "is-open"
                        );


                        lightbox.setAttribute(
                            "aria-hidden",
                            "false"
                        );

                    }


                    document.body.style.overflow =
                        "hidden";

                }
            );

        }


        /* =================================================
           CERRAR LIGHTBOX
        ================================================== */

        function closeLightboxModal() {

            if (!lightbox) {

                return;

            }


            lightbox.classList.remove(
                "is-open"
            );


            lightbox.setAttribute(
                "aria-hidden",
                "true"
            );


            if (lightboxImage) {

                lightboxImage.src =
                    "";


                lightboxImage.classList.remove(
                    "lightbox-image-changing"
                );

            }


            if (lightboxCaption) {

                lightboxCaption.textContent =
                    "";

            }


            document.body.style.overflow =
                "";

        }


        if (closeLightbox) {

            closeLightbox.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    closeLightboxModal();

                }
            );

        }


        /* =================================================
           FONDO LIGHTBOX
        ================================================== */

        if (lightbox) {

            lightbox.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target ===
                        lightbox
                    ) {

                        closeLightboxModal();

                    }

                }
            );

        }


        /* =================================================
           TECLADO
        ================================================== */

        document.addEventListener(
            "keydown",
            (event) => {

                /*
                 * ESC
                 */

                if (
                    event.key ===
                    "Escape"
                ) {

                    if (
                        shareModal &&
                        shareModal.classList.contains(
                            "is-open"
                        )
                    ) {

                        closeShare();

                    }


                    if (
                        lightbox &&
                        lightbox.classList.contains(
                            "is-open"
                        )
                    ) {

                        closeLightboxModal();

                    }


                    return;

                }


                /*
                 * Si lightbox no está abierto,
                 * no procesar flechas.
                 */

                if (
                    !lightbox ||
                    !lightbox.classList.contains(
                        "is-open"
                    )
                ) {

                    return;

                }


                /*
                 * IZQUIERDA
                 */

                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    event.preventDefault();

                    showPreviousPhoto();

                }


                /*
                 * DERECHA
                 */

                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    event.preventDefault();

                    showNextPhoto();

                }

            }
        );


        /* =================================================
           SWIPE MÓVIL
        ================================================== */

        if (lightbox) {

            lightbox.addEventListener(
                "touchstart",
                (event) => {

                    if (
                        event.touches.length !== 1
                    ) {

                        return;

                    }


                    touchStartX =
                        event.touches[0]
                            .clientX;


                    touchEndX =
                        touchStartX;

                },
                {
                    passive: true
                }
            );


            lightbox.addEventListener(
                "touchmove",
                (event) => {

                    if (
                        event.touches.length !== 1
                    ) {

                        return;

                    }


                    touchEndX =
                        event.touches[0]
                            .clientX;

                },
                {
                    passive: true
                }
            );


            lightbox.addEventListener(
                "touchend",
                () => {

                    const difference =
                        touchStartX -
                        touchEndX;


                    const minimumSwipe =
                        50;


                    if (
                        Math.abs(
                            difference
                        ) <
                        minimumSwipe
                    ) {

                        return;

                    }


                    if (
                        difference > 0
                    ) {

                        showNextPhoto();

                    } else {

                        showPreviousPhoto();

                    }

                },
                {
                    passive: true
                }
            );

        }


        /* =================================================
           CONTADOR PRINCIPAL
        ================================================== */

        function updateCounter() {

            if (!photoCounter) {

                return;

            }


            /*
             * El contador representa el total
             * de fotografías de invitados
             * almacenadas en Supabase.
             *
             * NO representa solamente las 4
             * visibles.
             */

            photoCounter.textContent =
                allMemories.length;

        }


        /* =================================================
           CARGA INICIAL DE RECUERDOS
        ================================================== */

        await loadMemories();


        /* =================================================
           ACTUALIZAR CONTADOR
        ================================================== */

        updateCounter();


        /* =================================================
           FINAL
        ================================================== */

        console.log(
            "✓ Álbum inicializado correctamente"
        );


    }
);