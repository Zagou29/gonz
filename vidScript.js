import { mob } from "./xfonctions/nav_os.js";
import { fetchJSON } from "./xfonctions/api.js";
import { createElement } from "./xfonctions/dom.js";
import { Menubox } from "./xfonctions/menubox.js";
import { MenuVid } from "./xfonctions/menuVid.js";
import { Affvid } from "./xfonctions/affvid_refact.js";
// Constantes globales pour améliorer la lisibilité
const IGNORE_TAGS = ["LABEL", "INPUT"];
const DROP_INCLUDE_CLASSES = ["menu", "ecranVideos"];
const SELECTORS = {
  adiapo: "#adiapo",
  avideo: "#avideo",
  ePhotos: ".ePhotos",
  eBlogs: ".eBlogs",
  blocLinks: ".bloc-links",
};
// Cache des éléments DOM principaux
const dom = {
  menu: document.querySelector(".menu"),
  barBox: document.querySelector(".menu .barBox"),
  titre: document.querySelector(".menu .titre"),
  retour: document.querySelector(".menu .retour"),
  ecVideos: document.querySelector(".ecranVideos"),
  body: document.querySelector("body"),
  years: document.querySelector(".years"),
  ePhotos: document.querySelector(".ePhotos"),
  eBlogs: document.querySelector(".eBlogs"),
};
// État de l'application
const state = {
  blockLinks_open: false,
  videoObserver: null,
  vidClass: null,
  vidMenu: null,
};
// --------- Fonctions utilitaires ---------
// Gestion du scroll
const scrollModule = (() => {
  const scrollToTop = () =>
    dom.ecVideos.scrollTo({ top: 0, behavior: "smooth" });
  return { scrollToTop };
})();
// Régler la hauteur d'un bloc
const setHeight = (element, height) => {
  element.style.height = height;
};

/**
 * Afficher ou masquer le bouton "Retour au début de page"
 * @param {string} sens '+' pour afficher, '-' pour masquer
 */
const affEffRetour = (sens) => {
  if (sens === "+") {
    dom.retour.classList.add("show");
    dom.retour.addEventListener("click", scrollModule.scrollToTop);
  } else {
    dom.retour.classList.remove("show");
    dom.retour.removeEventListener("click", scrollModule.scrollToTop);
  }
};

/**
 * Callback pour l'IntersectionObserver : arrête la vidéo sortante.
 * @param {IntersectionObserverEntry[]} entries
 */
const ferme_videos = (entries) => {
  entries.forEach((entry) => {
    const { target, isIntersecting } = entry;
    const dataNum = target.dataset.num;
    const barItem = dom.barBox.querySelector(`[data-num="${dataNum}"]`);
    if (!barItem) return;
    if (!isIntersecting) {
      barItem.classList.remove("peint");
      const videoImg = target.querySelector(".vidImg");
      // Arrêter la vidéo en désactivant l'autoplay
      videoImg.src = videoImg.src.replace("autoplay=1", "autoplay=0");
    } else {
      barItem.classList.add("peint");
    }
  });
};

/**
 * Remplacer l'image par la vidéo YouTube lors d'un clic.
 * @param {Event} e
 */
const click_img = (e) => {
  const { target } = e;
  if (target.classList.contains("vidImg")) {
    const divImg = target.parentElement;
    target.remove();
    state.vidClass.aff_ytFrameR(divImg, target.dataset.id);
  }
};

/**
 * Ramener la vidéo sélectionnée dans barBox.
 * @param {Event} e
 */
const ecoute_barre = (e) => {
  const targetNum = e.target.dataset.num;
  dom.ecVideos.querySelector(`[data-num='${targetNum}']`)?.scrollIntoView();
};

/**
 * Affiche les vidéos selon les paramètres et les années.
 * @param {string} classe Classe combinée et type (vidéo/diapo)
 * @param {string} year Année (optionnel)
 * @param {string} tempId Identifiant pour iframe ou miniature
 * @returns {number} Nombre de vidéos affichées
 */
const afficheLiens = (classe, year, tempId) => {
  if (!classe || !state.vidClass) return 0;
  dom.ecVideos.replaceChildren();
  state.vidClass.affVideos(dom.ecVideos, classe, year, tempId);
  //si une seule video, on ne fait rien
  const nbVideos = state.vidClass.retourVideo.length || 0;
  state.videoObserver.disconnect();
  if (dom.ecVideos.innerHTML && nbVideos > 1) {
    state.vidClass.affBar(dom.barBox);
    affEffRetour("+");
    const lect = dom.ecVideos.querySelectorAll(".lect");
    lect.forEach((lecteur) => state.videoObserver.observe(lecteur));
  }
  return nbVideos;
};

/**
 * Gère l'affichage des vidéos et des titres lors d'un clic sur un élément de la liste.
 * @param {Event} e
 */
const aff_Videos = (e) => {
  const activeMenu = dom.menu.querySelector(".activeMenu");
  if (!activeMenu) return;
  const spanChoisi = e.target;
  //videotype = .voy.amer.usa ou .ann
  const videoType = `${spanChoisi.dataset.select}`;
  //year = 2020
  const year = spanChoisi.dataset.year ? `${spanChoisi.dataset.year}` : "";
  const tempId =
    mob().mob || videoType.includes(".pll") ? "ytFrame" : "ytThumb";
  // ferme les menus, sauf quand on choisi Vieos ou Diapos and Années
  if (!IGNORE_TAGS.includes(spanChoisi.tagName)) {
    setHeight(
      activeMenu.parentElement.querySelector(SELECTORS.blocLinks),
      "0px"
    );
  }
  const nbVideos = afficheLiens(videoType, year, tempId);
  dom.titre.textContent = nbVideos ? spanChoisi.textContent : "";
  state.blockLinks_open = false;
};

/**
 * Transfère le dataset.ph vers photos.html.
 * @param {Event} e
 */
const trans = (e) => {
  if (!e.target.dataset.ph) return;
  localStorage.setItem("val_trans", e.target.dataset.ph);
  localStorage.setItem("sens_dates", "1");
  localStorage.setItem("asp_images", "show");
  window.location.href = "./photos.html";
};
const cleanupEventListeners = (element) => {
  element.removeEventListener("click", trans);
  element.removeEventListener("click", aff_Videos);
};
const fermerBlockLinks = () => {
  if (!state.blockLinks_open && !dom.ecVideos.innerHTML) return;
  const menus = dom.menu.querySelectorAll(".titMenu");
  menus.forEach((sp) => {
    if (sp.classList.contains("activeMenu")) {
      const bloclinks = sp.parentElement.querySelector(SELECTORS.blocLinks);
      setHeight(bloclinks, "0px");
      cleanupEventListeners(bloclinks);
      dom.ecVideos.replaceChildren();
      dom.barBox.replaceChildren();

      dom.titre.textContent = "";
      affEffRetour("-");
      state.blockLinks_open = false;
      sp.classList.remove("activeMenu");
    }
  });
};
/**
 * Ferme le menu dropdown si le clic se fait hors du menu principal.
 * @param {Event} e
 */
const dropClose = (e) => {
  if (
    state.blockLinks_open &&
    DROP_INCLUDE_CLASSES.some((cls) => e.target.classList.contains(cls))
  ) {
    fermerBlockLinks();
  }
};
// Système d'événements centralisé
const setupEventListeners = () => {
  // Écouteurs principaux qui restent attachés pendant toute la durée de vie de l'application
  dom.body.addEventListener("click", dropClose);
  dom.barBox.addEventListener("click", ecoute_barre);
  dom.ecVideos.addEventListener("click", click_img);
};

// Configuration de l'observer
const setupObserver = () => {
  const options = {
    root: dom.ecVideos,
    rootMargin: "0px",
    threshold: 1,
  };
  state.videoObserver = new IntersectionObserver(ferme_videos, options);
};
// ----- IIFE principale -----
(async function init() {
  // Charger les menuboxes
  try {
    // Charger tous les fichiers JSON en parallèle
    const [menuBoxesData, vidList, menuList] = await Promise.all([
      fetchJSON("./xjson/box.json"),
      fetchJSON("./xjson/indexVid.json"),
      fetchJSON("./xjson/menusVideos.json"),
    ]);
    const boxes = new Menubox(menuBoxesData);
    // afficher les menus boxes de Photos puis Blogs
    boxes.apBox_Ph(dom.ePhotos, "ph", "-1");
    boxes.apBox_Ph(dom.eBlogs, "bl", "1");

    /* Charger et trier la liste globale des vidéos */
    vidList.sort((a, b) => a.annee - b.annee);
    // Raccorder les vidéos aux menuboxes par les classes (sans le type vidéo)
    const list_menus = vidList.map((item) => {
      const { clas, text } = item;
      const lien = menuList.find((li) => li.clas === clas.slice(4));
      const { groupe = "", src = "", detail = "" } = lien;
      return { clas, groupe, text, src, detail };
    });
    /* Initialisation des classes d'affichage */
    state.vidClass = new Affvid(vidList);
    /* afficher les boites menus fam, voy, pll */
    state.vidMenu = new MenuVid(list_menus);
    ["menu_fam", "menu_voy", "menu_pll"].forEach((selector) =>
      state.vidMenu.affBoxes(document.querySelector(`.${selector}`))
    );
    /* afficher les boites menus années */
    state.vidClass.aff_ans(dom.years);

    /* clic sur un menu: si ephotos => trans si pas eblogs => affiche videos, sinon clic sur href de blogs */
    const attachEventToDropdown = (dropCour) => {
      if (dropCour.querySelector(SELECTORS.ePhotos)) {
        dropCour.addEventListener("click", trans);
      } else if (!dropCour.querySelector(SELECTORS.eBlogs)) {
        dropCour.addEventListener("click", aff_Videos);
      }
    };
    // ----------- Gestion des événements -----------

    //Écoute du clic sur les menus pour ouvrir / fermer les dropdowns
    dom.menu.addEventListener("click", (e) => {
      const spanChoisi = e.target;
      if (spanChoisi.classList.contains("titMenu")) {
        fermerBlockLinks();
        const dropCour = spanChoisi.parentElement.querySelector(
          SELECTORS.blocLinks
        );
        setHeight(dropCour, dropCour.scrollHeight + "px");
        state.blockLinks_open = true;
        spanChoisi.classList.add("activeMenu");
        attachEventToDropdown(dropCour);
      }
    });
    // Initialiser les événements et l'observer
    setupEventListeners();
    setupObserver();
  } catch (e) {
    const alertEl = createElement("div", {
      class: "alert alert-danger m-2",
      role: "alert",
      style: "position:fixed;top:10px;left:10px;z-index:1000;width:100%;",
    });
    alertEl.innerText = "Impossible de charger les éléments";
    document.body.prepend(alertEl);
    console.error("Erreur d'initialisation:", e);
  }
})();
