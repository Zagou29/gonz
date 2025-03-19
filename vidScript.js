
import { mob } from "./xfonctions/nav_os.js";
import { fetchJSON } from "./xfonctions/api.js";
import { createElement } from "./xfonctions/dom.js";
import { Menubox } from "./xfonctions/menubox.js";
import { MenuVid } from "./xfonctions/menuVid.js";
import { Affvid } from "./xfonctions/affvid.js";

// Cache des éléments DOM principaux
const menu = document.querySelector(".menu");
const barBox = menu.querySelector(".barBox");
const titre = menu.querySelector(".titre");
const ecVideos = document.querySelector(".ecranVideos");
const ignoreTags = ["LABEL", "INPUT"];
let isBlockLinks = false;

// Module pour la gestion du scroll
const scrollModule = (() => {
  // Fonction fléchée pour remonter en douceur vers le haut
  const scrollToTop = () => ecVideos.scrollTo({ top: 0, behavior: "smooth" });
  return { scrollToTop };
})();

(async function init() {
  // Charger les menuboxes
  try {
    const menuBoxesData = await fetchJSON("./xjson/box.json");
    const boxes = new Menubox(menuBoxesData);
    // Créer les boxes de Photos puis Blogs
    boxes.apBox_Ph(document.querySelector(".ePhotos"), "ph", "1");
    boxes.apBox_Ph(document.querySelector(".eBlogs"), "bl", "1");
  } catch (e) {
    const alertEl = createElement("div", {
      class: "alert alert-danger m-2",
      role: "alert",
    });
    alertEl.innerText = "Impossible de charger les éléments";
    document.body.prepend(alertEl);
    console.error(e);
  }

  /* Charger et trier la liste globale des vidéos */
  const vidList = await fetchJSON("./xjson/indexVid.json");
  const menuList = await fetchJSON("./xjson/menusVideos.json");
  vidList.sort((a, b) => (a.annee > b.annee ? 1 : a.annee < b.annee ? -1 : 0));

  // Raccorder les vidéos aux menuboxes par les classes (sans le type vidéo)
  const list_menus = vidList.map((item) => {
    const { clas, text } = item;
    const lien = menuList.find((li) => li.clas === clas.slice(4));
    const { groupe, src, detail } = lien;
    return { clas, groupe, text, src, detail };
  });

  /* Initialisation des classes d'affichage */
  const vidClass = new Affvid(vidList);
  vidClass.aff_ans(document.querySelector(".years"));

  const vidMenu = new MenuVid(list_menus);
  ["menu_fam", "menu_voy", "menu_pll"].forEach((selector) =>
    vidMenu.affBoxes(document.querySelector(`.${selector}`))
  );
  // --------- Fonctions utilitaires ---------

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
    const retour = menu.querySelector(".retour");
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
      if (!entry.isIntersecting && entry.intersectionRatio) {
        barItem?.classList.remove("peint");
        const videoImg = entry.target.querySelector(".vidImg");
        // Arrêter la vidéo en désactivant l'autoplay
        videoImg.src = videoImg.src.replace("autoplay=1", "autoplay=0");
      } else if (entry.isIntersecting) {
        barItem?.classList.add("peint");
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
      vidClass.aff_ytFrameR(divImg, e.target.dataset.id);
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
    vidClass.affVideos(ecVideos, param, year, tempId);
    if (tempId === "ytThumb") {
      ecVideos.addEventListener("click", click_img);
    }
    vidClass.affBar(barBox);
    barBox.addEventListener("click", ecoute_barre);

    const nbVideos = vidClass.retourVideo.length;
    if (ecVideos.innerHTML && nbVideos > 1) affEffRetour("+");

    const lect = ecVideos.querySelectorAll(".lect");
    const options = { root: ecVideos, rootMargin: "0px", threshold: 1 };
    const observer = new IntersectionObserver(ferme_videos, options);
    lect.forEach((lecteur) => observer.observe(lecteur));
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
    const dia_vid = `${typeVid(activeMenu.parentElement)}${
      spanChoisi.dataset.select
    }`;
    const year = spanChoisi.dataset.year ? `${spanChoisi.dataset.year}` : "";
    const tempId = mob().mob
      ? "ytFrame"
      : !dia_vid.search(".pll")
      ? "ytFrame"
      : "ytThumb";
    if (!ignoreTags.includes(spanChoisi.tagName)) {
      activeMenu.parentElement.querySelector(".bloc-links").style.height =
        "0px";
    } //
    const aff = afficheLiens(dia_vid, year, tempId);
    titre.textContent = aff ? spanChoisi.textContent : "";
    isBlockLinks = false;
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
      blocLinks.style.height = "0px";
      blocLinks.removeEventListener("click", aff_Videos);
      blocLinks.removeEventListener("click", trans);
      sp.classList.remove("activeMenu");
    });
    isBlockLinks = false;
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
    if (!isBlockLinks) return; // si pas de bloc ouvert
    const cible = e.target;
    const ignoreClasses = ["imgRetour","titMenu" ,"vidImg", "lect", "ti_blog","menu"];
    // Si clic sur un élément ignoré, on ne ferme pas le bloc
    if (
      ignoreClasses.some((cls) => cible.classList.contains(cls)) ||
      cible.dataset.select === ".ann" ||
      "num" in cible.dataset ||
      ignoreTags.includes(cible.tagName)
    )
      return;
    fermerBlockLinks();
  };

  // ----------- Gestion des événements -----------

  // Écoute du clic sur les menus pour ouvrir/fermer les dropdowns
  menu.addEventListener("click", (e) => {
    const spanChoisi = e.target;
     const ignoreClasses = [ "envIcon","bloc_img","a1","sousMenuAnn"];
     if (ignoreClasses.some((cls) => spanChoisi.classList.contains(cls))) {
       fermerBlockLinks();
       return;
     }
    if (!spanChoisi.classList.contains("titMenu")) return;
    const activeMenu = menu.querySelector(".activeMenu");
    const ec_videos = ecVideos.innerHTML;
    fermerBlockLinks();
    if (activeMenu === spanChoisi && !ec_videos) return; // si pas de videos et même menu
    const dropCour = spanChoisi.parentElement.querySelector(".bloc-links");
    dropCour.style.height = dropCour.scrollHeight + "px";
    isBlockLinks = true;
    spanChoisi.classList.add("activeMenu");
    ecVideos.removeEventListener("click", click_img);

    dropCour.addEventListener("click", aff_Videos, { once: false });
    dropCour.addEventListener("click", trans, { once: true });
  });
  document.querySelector("body").addEventListener("click", dropClose);
})();
