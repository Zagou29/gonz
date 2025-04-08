import { mob } from "./xfonctions/nav_os.js";
import { fetchJSON } from "./xfonctions/api.js";
import { createElement } from "./xfonctions/dom.js";
import { Menubox } from "./xfonctions/menubox.js";
import { MenuVid } from "./xfonctions/menuVid.js";
import { Affvid } from "./xfonctions/affvid.js";
// Constantes globales pour améliorer la lisibilité
const IGNORE_TAGS = ["LABEL", "INPUT"];
const DROP_IGNORE_CLASSES = [
  "imgRetour",
  "titMenu",
  "ti_blog",
  "vidImg",
  "menu",
  "lect",
];
const MENU_IGNORE_CLASSES = [
  "sousMenuBlog",
  "sousMenuAnn",
  "bloc_img",
  "envIcon",
  "a1",
];
// Cache des éléments DOM principaux
const menu = document.querySelector(".menu");
const barBox = menu.querySelector(".barBox");
const titre = menu.querySelector(".titre");
const retour = menu.querySelector(".retour");
const ecVideos = document.querySelector(".ecranVideos");
const state = {
  isBlockLinks: false,
  videoObserver: null,
  vidClass: null,
  vidMenu: null,
};
// --------- Fonctions utilitaires ---------
// Gestion du scroll
const scrollModule = (() => {
  const scrollToTop = () => ecVideos.scrollTo({ top: 0, behavior: "smooth" });
  return { scrollToTop };
})();
// Régler la hauteur d'un bloc
const setHeight = (element, height) => {
  element.style.height = height;
};

/**
 * Détermine le type (vidéo/diapo) en fonction de deux checkboxes.
 * @param {HTMLElement} box1
 * @param {HTMLElement} box2
 * @returns {string} 'non', '' ou la valeur de la case cochée
 */
const typeb = (box1, box2) => {
  switch (box1.checked + box2.checked) {
    case 0:
      return "non";
    case 1:
      return box1.checked ? box1.value : box2.value;
    case 2:
      return "";
  }
};

/**
 * Renvoie le type associé au menu (vidéo ou diapos)
 * @param {HTMLElement} el Élément de menu Voy ou Pll
 * @returns {string}
 */
const typeVid = (el) => {
  const adiapo = el.querySelector("#adiapo");
  const avideo = el.querySelector("#avideo");
  return adiapo ? typeb(adiapo, avideo) : "";
};

/**
 * Afficher ou masquer le bouton "Retour au début de page"
 * @param {string} sens '+' pour afficher, '-' pour masquer
 */
const affEffRetour = (sens) => {
  if (sens === "+") {
    retour.classList.add("show");
    retour.addEventListener("click", scrollModule.scrollToTop);
  } else {
    retour.classList.remove("show");
    retour.removeEventListener("click", scrollModule.scrollToTop);
  }
};

/**
 * Callback pour l'IntersectionObserver : arrête la vidéo sortante.
 * @param {IntersectionObserverEntry[]} entries
 */
const ferme_videos = (entries) => {
  entries.forEach((entry) => {
    const dataNum = entry.target.dataset.num;
    const barItem = barBox.querySelector(`[data-num="${dataNum}"]`);
    if (!barItem) return;
    if (!entry.isIntersecting) {
      barItem.classList.remove("peint");
      const videoImg = entry.target.querySelector(".vidImg");
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
  if (e.target.classList.contains("vidImg")) {
    const divImg = e.target.parentElement;
    e.target.remove();
    state.vidClass.aff_ytFrameR(divImg, e.target.dataset.id);
  }
};

/**
 * Ramener la vidéo sélectionnée dans barBox.
 * @param {Event} e
 */
const ecoute_barre = (e) => {
  const targetNum = e.target.dataset.num;
  ecVideos.querySelector(`[data-num='${targetNum}']`)?.scrollIntoView();
};

/**
 * Affiche les vidéos selon les paramètres et les années.
 * @param {string} param Classe combinée et type (vidéo/diapo)
 * @param {string} year Année (optionnel)
 * @param {string} tempId Identifiant pour iframe ou miniature
 * @returns {number} Nombre de vidéos affichées
 */
const afficheLiens = (param, year, tempId) => {
  ecVideos.innerHTML = "";
  state.vidClass.affVideos(ecVideos, param, year, tempId);
  if (tempId === "ytThumb") {
    ecVideos.addEventListener("click", click_img);
  }
  //si une seule video, on ne fait rien
  const nbVideos = state.vidClass.retourVideo.length;
  if (ecVideos.innerHTML && nbVideos > 1) {
    state.vidClass.affBar(barBox);
    barBox.addEventListener("click", ecoute_barre);
    affEffRetour("+");
    //ecouter les videos pour les arreter en dehors de l'ecran
    const options = { root: ecVideos, rootMargin: "0px", threshold: 1 };
    const videoObserver =
      state.videoObserver || new IntersectionObserver(ferme_videos, options);
    state.videoObserver = videoObserver;
    const lect = ecVideos.querySelectorAll(".lect");
    lect.forEach((lecteur) => videoObserver.observe(lecteur));
  }
  return nbVideos;
};

/**
 * Gère l'affichage des vidéos et des titres lors d'un clic sur un élément de la liste.
 * @param {Event} e
 */
const aff_Videos = (e) => {
  const activeMenu = menu.querySelector(".activeMenu");
  if (!activeMenu) return;
  const spanChoisi = e.target;
  //diavid = .voy.amer.usa ou .vid.ann ou .dia.ann ou .ann
  const dia_vid = `${typeVid(activeMenu.parentElement)}${
    spanChoisi.dataset.select
  }`;
  const year = spanChoisi.dataset.year ? `${spanChoisi.dataset.year}` : "";
  const tempId = mob().mob || dia_vid.includes(".pll") ? "ytFrame" : "ytThumb";
  // ferme les menus, sauf quand on choisi Vieos ou Diapos and Années
  if (!IGNORE_TAGS.includes(spanChoisi.tagName)) {
    setHeight(activeMenu.parentElement.querySelector(".bloc-links"), "0px");
  }
  const nbVideos = afficheLiens(dia_vid, year, tempId);
  titre.textContent = nbVideos ? spanChoisi.textContent : "";
  state.isBlockLinks = false;
};

/**
 * Transfère le dataset.ph vers photos.html.
 * @param {Event} e
 */
const trans = (e) => {
  if (!e.target.dataset.ph) return;
  localStorage.setItem("data", e.target.dataset.ph);
  localStorage.setItem("sens_dates", "-1");
  localStorage.setItem("asp_images", "show");
  window.location.href = "./photos.html";
};

const fermerBlockLinks = () => {
  menu.querySelectorAll(".titMenu").forEach((sp) => {
    const blocLinks = sp.parentElement.querySelector(".bloc-links");
    setHeight(blocLinks, "0px");
    blocLinks.querySelector(".ePhotos")
      ? blocLinks.removeEventListener("click", trans, { once: true })
      : blocLinks.removeEventListener("click", aff_Videos);
    barBox.removeEventListener("click", ecoute_barre);
    sp.classList.remove("activeMenu");
  });
  state.isBlockLinks = false;
  ecVideos.innerHTML = "";
  barBox.innerHTML = "";
  titre.textContent = "";
  affEffRetour("-");
};
/**
 * Ferme le menu dropdown si le clic se fait hors du menu principal.
 * @param {Event} e
 */
const dropClose = (e) => {
  if (!state.isBlockLinks) return; // si pas de bloc ouvert
  const cible = e.target;
  // Si clic sur un élément ignoré, on ne ferme pas le bloc
  if (
    DROP_IGNORE_CLASSES.some((cls) => cible.classList.contains(cls)) ||
    cible.dataset.select === ".ann" ||
    "num" in cible.dataset ||
    IGNORE_TAGS.includes(cible.tagName)
  ) {
    return;
  }
  fermerBlockLinks();
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
    // Créer les boxes de Photos puis Blogs
    boxes.apBox_Ph(document.querySelector(".ePhotos"), "ph", "1");
    boxes.apBox_Ph(document.querySelector(".eBlogs"), "bl", "1");

    /* Charger et trier la liste globale des vidéos */
    vidList.sort((a, b) =>
      a.annee > b.annee ? 1 : a.annee < b.annee ? -1 : 0
    );
    // Raccorder les vidéos aux menuboxes par les classes (sans le type vidéo)
    const list_menus = vidList.map((item) => {
      const { clas, text } = item;
      const lien = menuList.find((li) => li.clas === clas.slice(4));
      const { groupe = "", src = "", detail = "" } = lien;
      return { clas, groupe, text, src, detail };
    });
    /* Initialisation des classes d'affichage */
    state.vidClass = new Affvid(vidList);
    state.vidClass.aff_ans(document.querySelector(".years"));

    state.vidMenu = new MenuVid(list_menus);
    ["menu_fam", "menu_voy", "menu_pll"].forEach((selector) =>
      state.vidMenu.affBoxes(document.querySelector(`.${selector}`))
    );

    // ----------- Gestion des événements -----------

    // Écoute du clic sur les menus pour ouvrir/fermer les dropdowns
    menu.addEventListener("click", (e) => {
      const spanChoisi = e.target;
      if (
        MENU_IGNORE_CLASSES.some((cls) => spanChoisi.classList.contains(cls))
      ) {
        fermerBlockLinks();
        return;
      }
      if (!spanChoisi.classList.contains("titMenu")) return;
      fermerBlockLinks();
      const dropCour = spanChoisi.parentElement.querySelector(".bloc-links");
      setHeight(dropCour, dropCour.scrollHeight + "px");
      state.isBlockLinks = true;
      spanChoisi.classList.add("activeMenu");
      ecVideos.removeEventListener("click", click_img);
      if (dropCour.querySelector(".ePhotos")) {
        dropCour.addEventListener("click", trans, { once: true });
      } else if (!dropCour.querySelector(".eBlogs")) {
        dropCour.addEventListener("click", aff_Videos);
      }
    });
    //fermer les menus si clic en dehors
    document.querySelector("body").addEventListener("click", dropClose);
    //créer un premier et unique observer pour les vidéos
    const options = { 
      root: ecVideos,
      rootMargin: "0px",
      threshold: 1,
    };
    state.videoObserver = new IntersectionObserver(ferme_videos, options);
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
