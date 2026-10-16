const tiles = Array.from(document.querySelectorAll(".tile"));
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("figure img");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
const closeButton = lightbox.querySelector(".lightbox-close");
const previousButton = lightbox.querySelector(".lightbox-previous");
const nextButton = lightbox.querySelector(".lightbox-next");
const page = document.querySelector(".page-shell");
const videoFacades = document.querySelectorAll(".video-facade");

let activeIndex = -1;
let returnFocusTo = null;
let scrollPosition = 0;
let previousBodyOverflow = "";
let previousRootOverflow = "";
let touchStartX = null;

const renderImage = (index) => {
  activeIndex = (index + tiles.length) % tiles.length;
  const tile = tiles[activeIndex];
  const image = tile.querySelector("img");

  lightboxImage.src = tile.dataset.full;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = `Foto ${activeIndex + 1} de ${tiles.length}`;
};

const openLightbox = (index) => {
  returnFocusTo = tiles[index];
  renderImage(index);
  scrollPosition = window.scrollY;
  previousBodyOverflow = document.body.style.overflow;
  previousRootOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  page.inert = true;
  page.setAttribute("aria-hidden", "true");
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  lightbox.focus();
};

const closeLightbox = () => {
  if (!lightbox.classList.contains("is-open")) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  page.inert = false;
  page.removeAttribute("aria-hidden");
  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousRootOverflow;
  window.scrollTo(0, scrollPosition);
  returnFocusTo?.focus();
  returnFocusTo = null;
};

tiles.forEach((tile, index) => {
  tile.addEventListener("click", () => openLightbox(index));
});

closeButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", () => renderImage(activeIndex - 1));
nextButton.addEventListener("click", () => renderImage(activeIndex + 1));

lightbox.addEventListener("click", (event) => {
  const clickedImage = event.target.closest(".lightbox-dialog img");
  const clickedControl = event.target.closest(".lightbox-dialog button");
  if (!clickedImage && !clickedControl) closeLightbox();
});

lightbox.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener("touchend", (event) => {
  if (touchStartX === null) return;

  const distance = event.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(distance) < 50) return;

  renderImage(activeIndex + (distance < 0 ? 1 : -1));
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    renderImage(activeIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    renderImage(activeIndex + 1);
  } else if (event.key === "Tab") {
    const focusable = [closeButton, previousButton, nextButton];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && (document.activeElement === first || document.activeElement === lightbox)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

videoFacades.forEach((facade) => {
  facade.addEventListener("click", () => {
    const videoId = facade.dataset.video;
    const title = facade.dataset.title;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    iframe.title = title;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    iframe.className = "video-player";
    iframe.width = "560";
    iframe.height = "315";
    facade.replaceWith(iframe);
  }, { once: true });
});
