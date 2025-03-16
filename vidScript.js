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
  vidMenu.affBoxes(document.querySelector(".menu_fam"));
  vidMenu.affBoxes(document.querySelector(".menu_voy"));
  vidMenu.affBoxes(document.querySelector(".menu_pll"));

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
    const dia_vid = `${typeVid(activeMenu.parentElement)}${
      e.target.dataset.select
    }`;
    const year = e.target.dataset.year ? `${e.target.dataset.year}` : "";
    const tempId = mob().mob
      ? "ytFrame"
      : !dia_vid.search(".pll")
      ? "ytFrame"
      : "ytThumb";
    const aff = afficheLiens(dia_vid, year, tempId);
    if (e.target.tagName !== "LABEL" && e.target.tagName !== "INPUT") {
      activeMenu.parentElement.querySelector(".bloc-links").style.height =
        "0px";
    }
    titre.textContent = aff ? e.target.textContent : "";
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

  /**
   * Ferme le menu dropdown si le clic se fait hors du menu principal.
   * @param {Event} e
   */
  const dropclose = (e) => {
    const activeMenu = menu.querySelector(".activeMenu");
    if (
      (e.target === ecVideos || e.target === menu) &&
      !ecVideos.innerHTML &&
      activeMenu
    ) {
      activeMenu.parentElement.querySelector(".bloc-links").style.height =
        "0px";
      activeMenu.classList.remove("activeMenu");
    }
  };

  /**
   * Active le menu sélectionné en mettant à jour les classes.
   * @param {HTMLElement} spanChoisi
   */
  const activerMenu = (spanChoisi) => {
    menu.querySelectorAll(".titMenu").forEach((sp) => {
      sp.classList.add("nonActif");
      sp.classList.remove("activeMenu");
    });
    spanChoisi.classList.add("activeMenu");
    spanChoisi.classList.remove("nonActif");
  };

  // ----------- Gestion des événements -----------

  // Écoute du clic sur les menus pour ouvrir/fermer les dropdowns
  menu.addEventListener("click", (e) => {
    const spanChoisi = e.target;
    if (spanChoisi.classList.contains("titMenu")) {
      activerMenu(spanChoisi);
      menu.querySelectorAll(".nonActif").forEach((sp) => {
        sp.parentElement.querySelector(".bloc-links").style.height = "0px";
      });
      const dropCour = spanChoisi.parentElement.querySelector(".bloc-links");
      if (!dropCour.style.height || dropCour.style.height === "0px") {
        dropCour.style.height = dropCour.scrollHeight + "px";
        // Réinitialisation de l'affichage
        ecVideos.innerHTML = "";
        barBox.innerHTML = "";
        titre.textContent = "";
        affEffRetour("-");
        dropCour.addEventListener("click", aff_Videos);
        ecVideos.removeEventListener("click", click_img);
        dropCour.addEventListener("click", trans);
      } else {
        dropCour.style.height = "0px";
        spanChoisi.classList.remove("activeMenu");
      }
    }
  });
  document.querySelector("body").addEventListener("click", dropclose);
})();
