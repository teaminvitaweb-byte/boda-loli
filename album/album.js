/* =========================================================
   ÁLBUM — ELIZABETH & CARLOS
   INTERACCIONES + LIGHTBOX CARRUSEL
   SECCIÓN INDEPENDIENTE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const sharePhotoButton =
        document.getElementById("sharePhotoButton");

    const viewMemoriesButton =
        document.getElementById("viewMemoriesButton");

    const shareModal =
        document.getElementById("shareModal");

    const closeShareModal =
        document.getElementById("closeShareModal");

    const modalBackdrop =
        shareModal?.querySelector(".modal-backdrop");

    const photoInput =
        document.getElementById("photoInput");

    const previewContainer =
        document.getElementById("previewContainer");

    const guestName =
        document.getElementById("guestName");

    const shareSubmit =
        document.getElementById("shareSubmit");

    const lightbox =
        document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");

    const lightboxCaption =
        document.getElementById("lightboxCaption");

    const closeLightbox =
        document.getElementById("closeLightbox");

    const albumGallery =
        document.getElementById("albumGallery");

    const photoCounter =
        document.getElementById("photoCounter");


    /* =====================================================
       VARIABLES
    ====================================================== */

    let selectedFiles = [];

    let currentPhotoIndex = 0;

    let galleryPhotos = [];

    let touchStartX = 0;

    let touchEndX = 0;


    /* =====================================================
       ESTILOS DEL CARRUSEL
    ====================================================== */

    const carouselStyles =
        document.createElement("style");

    carouselStyles.textContent = `

        .lightbox-nav {

            position: absolute;

            top: 50%;

            transform: translateY(-50%);

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
                translateY(-50%) scale(0.94);

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
                5px
                13px;

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

                padding:
                    10px;

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
                    4px
                    11px;

            }

            .lightbox-caption {

                bottom: 14px;

                padding:
                    0
                    55px;

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


    /* =====================================================
       CONTROLES DEL LIGHTBOX
    ====================================================== */

    let previousButton = null;

    let nextButton = null;

    let lightboxCounter = null;


    function createLightboxControls() {

        if (!lightbox) {
            return;
        }


        previousButton =
            document.createElement("button");

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
            document.createElement("button");

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
            document.createElement("div");

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


    /* =====================================================
       MODAL — ABRIR
    ====================================================== */

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


    /* =====================================================
       MODAL — CERRAR
    ====================================================== */

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


    /* =====================================================
       BOTÓN COMPARTIR
    ====================================================== */

    if (sharePhotoButton) {

        sharePhotoButton.addEventListener(
            "click",
            openShareModal
        );

    }


    /* =====================================================
       CERRAR MODAL
    ====================================================== */

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


    /* =====================================================
       SELECCIONAR FOTOS
    ====================================================== */

    if (photoInput) {

        photoInput.addEventListener(
            "change",
            (event) => {

                const files =
                    Array.from(
                        event.target.files
                    );


                selectedFiles = [
                    ...selectedFiles,
                    ...files
                ];


                renderPreviews();

            }
        );

    }


    /* =====================================================
       PREVISUALIZACIÓN
    ====================================================== */

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


                        item.innerHTML = `

                            <img
                                src="${event.target.result}"
                                alt="Vista previa"
                            >

                            <button
                                type="button"
                                class="preview-remove"
                                data-index="${index}"
                                aria-label="Eliminar fotografía"
                            >
                                ×
                            </button>

                        `;


                        previewContainer.appendChild(
                            item
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    /* =====================================================
       ELIMINAR PREVISUALIZACIÓN
    ====================================================== */

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


                selectedFiles.splice(
                    index,
                    1
                );


                renderPreviews();

            }
        );

    }


    /* =====================================================
       ENVIAR
    ====================================================== */

    if (shareSubmit) {

        shareSubmit.addEventListener(
            "click",
            () => {

                if (
                    selectedFiles.length === 0
                ) {

                    alert(
                        "Primero selecciona al menos una fotografía."
                    );

                    return;

                }


                const name =
                    guestName?.value.trim() || "";


                if (!name) {

                    alert(
                        "Escribe tu nombre para aparecer en el álbum."
                    );

                    guestName?.focus();

                    return;

                }


                alert(
                    `¡Gracias, ${name}! ❤️\n\n` +
                    `Has seleccionado ${selectedFiles.length} fotografía(s).\n\n` +
                    `En la versión final, aquí se enviarán al álbum.`
                );


                selectedFiles = [];


                if (photoInput) {

                    photoInput.value =
                        "";

                }


                if (previewContainer) {

                    previewContainer.innerHTML =
                        "";

                }


                if (guestName) {

                    guestName.value =
                        "";

                }


                closeShare();

            }
        );

    }


    /* =====================================================
       VER RECUERDOS
    ====================================================== */

    if (viewMemoriesButton) {

        viewMemoriesButton.addEventListener(
            "click",
            () => {

                if (!albumGallery) {
                    return;
                }


                albumGallery.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }
        );

    }


    /* =====================================================
       OBTENER FOTOGRAFÍAS REALES
    ====================================================== */

    function getGalleryPhotos() {

        if (!albumGallery) {
            return [];
        }


        const buttons =
            albumGallery.querySelectorAll(
                ".memory-photo"
            );


        const photos = [];


        buttons.forEach(
            (photo) => {

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

                    element: photo,

                    image: image,

                    name: name,

                    alt: alt

                });

            }
        );


        return photos;

    }


    /* =====================================================
       ACTUALIZAR CONTROLES
    ====================================================== */

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


    /* =====================================================
       MOSTRAR FOTO
    ====================================================== */

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


        if (index < 0) {

            index =
                galleryPhotos.length - 1;

        }


        if (
            index >= galleryPhotos.length
        ) {

            index = 0;

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


    /* =====================================================
       ACTUALIZAR IMAGEN
    ====================================================== */

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


    /* =====================================================
       ANTERIOR
    ====================================================== */

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


    /* =====================================================
       SIGUIENTE
    ====================================================== */

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

            currentPhotoIndex = 0;

        }


        showPhoto(
            currentPhotoIndex
        );

    }


    /* =====================================================
       ABRIR LIGHTBOX
    ====================================================== */

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


                if (!image) {
                    return;
                }


                galleryPhotos =
                    getGalleryPhotos();


                const clickedIndex =
                    galleryPhotos.findIndex(
                        (photo) =>
                            photo.element ===
                            photoButton
                    );


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


    /* =====================================================
       CERRAR LIGHTBOX
    ====================================================== */

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


    /* =====================================================
       FONDO LIGHTBOX
    ====================================================== */

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


    /* =====================================================
       TECLADO
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

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


            if (
                !lightbox ||
                !lightbox.classList.contains(
                    "is-open"
                )
            ) {

                return;

            }


            if (
                event.key ===
                "ArrowLeft"
            ) {

                event.preventDefault();

                showPreviousPhoto();

            }


            if (
                event.key ===
                "ArrowRight"
            ) {

                event.preventDefault();

                showNextPhoto();

            }

        }
    );


    /* =====================================================
       TOUCH / SWIPE
    ====================================================== */

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
                    event.touches[0].clientX;

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
                    event.touches[0].clientX;

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
                    Math.abs(difference) <
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


    /* =====================================================
       CONTADOR PRINCIPAL
    ====================================================== */

    function updateCounter() {

        if (!photoCounter) {
            return;
        }


        const photos =
            document.querySelectorAll(
                ".album-page .memory"
            );


        photoCounter.textContent =
            photos.length;

    }


    updateCounter();

});