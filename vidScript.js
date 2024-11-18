import { mob } from "./xfonctions/nav_os.js";
import { fetchJSON } from "./xfonctions/api.js";
import { createElement } from "./xfonctions/dom.js";
import { Menubox } from "./xfonctions/menubox.js";
import { MenuVid } from "./xfonctions/menuVid.js";
import { Affvid } from "./xfonctions/affvid.js";
try {
  /** Charger les menuboxes */
  const menuBoxes = await fetchJSON("./xjson/box.json");
  const boxes = new Menubox(menuBoxes);
  /**crée les boxes de Photos puis Blogs */
  boxes.apBox_Ph(document.querySelector(".ePhotos"), "ph", "1");
  boxes.apBox_Ph(document.querySelector(".eBlogs"), "bl", "1");
} catch (e) {
  const alertEl = createElement("div", {
    class: "alert alert-danger m-2",
    role: "alert",
  });
  alertEl.innerText = "impossible de charger les elements";
  document.body.prepend(alertEl);
  console.error(e);
}
/* supprimer les barres de defilement */
const drop = [...document.querySelectorAll(".dropdown")];
drop.forEach((dr) => dr.classList.add("scrbar"));
document.querySelector(".ecranVideos").classList.add("scrbar");

/**Charger la liste globale des videos */
const vidList = await fetchJSON("./xjson/indexVid.json");
const menuList = await fetchJSON("./xjson/menusVideos.json");
/** trier les videos selon l'année old-> new */
vidList.sort((a, b) => (a.annee > b.annee ? 1 : a.annee < b.annee ? -1 : 0));
const list_menus = vidList.map((item) => {
  const { clas, text } = item;
  const lien = menuList.filter((li) => li.clas === clas)[0];
  const { groupe, src, detail } = lien;
  return { clas, groupe, text, src, detail };
});
/* Charger la classe videos*/
const vidClass = new Affvid(vidList);
/* Afficher le menu années */
vidClass.aff_ans(document.querySelector(".years"));
/* Charger la classe menus fam voy pll */
const vidMenu = new MenuVid(list_menus);
/* Afficher les menus videos */
vidMenu.affBoxes(document.querySelector(".menu_famille"), ".fam");
vidMenu.affBoxes(document.querySelector(".menu_voyage"), ".voy");
vidMenu.affBoxes(document.querySelector(".menu_playlist"), ".pll");
/* -----------------les fonctions--------------------- */
function toTop() {
  ecVideos.scrollTo({ top: 0, behavior: "smooth" });
}
/**
 * definir la class .dia, .vid, tout, ou rien
 * @param {element} box1
 * @param {element} box2
 * @returns {string} ['non','', .dia, .vid]
 */
function typeb(box1, box2) {
  switch (box1.checked + box2.checked) {
    case 0:
      return "non";
    case 1:
      return box1.checked ? box1.value : box2.value;
    case 2:
      return "";
  }
}
/* Renvoyer 'non' ou .dia ou .vid ou "" selon chechbox video/diapo */
/**
 * choix des videos ou diapos ou rien de Voy et Pll
 * @param {element} el menu Voy ou Pll
 * @returns {fn} typeb(box1;box2)
 */
function typeVid(el) {
  const adiapo = el.querySelector("#adiapo");
  const avideo = el.querySelector("#avideo");

  return adiapo ? typeb(adiapo, avideo) : "";
}
/**
 * Afficher le bouton Retour au debut de page des iframes
 * @param {string} sens (+ affiche, - efface)
 */
function affEffRetour(sens) {
  const retour = document.querySelector(".retour");
  if (sens === "+") {
    retour.classList.add("show");
    retour.addEventListener("click", toTop);
  } else {
    retour.classList.remove("show");
    retour.removeEventListener("click", toTop);
  }
}
/* fermer les Iframes YT si ouvertes et afficher les YT visibles */
function ferme_videos(entries) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting && entry.intersectionRatio) {
      document
        .querySelector(`.barBox [data-num = "${entry.target.dataset.num}"]`)
        ?.classList.remove("peint");
      entry.target.src = entry.target.src.replace(
        entry.target.src,
        entry.target.src
      );
    } else {
      if (entry.isIntersecting) {
        document
          .querySelector(`.barBox [data-num = "${entry.target.dataset.num}"]`)
          ?.classList.add("peint");
      }
    }
  });
}
/**
 * Afficher les Iframes YT choisis par param
 * @param {string} param class des liens videos
 * @returns {number} le nombre de iframes
 */
function afficheLiens(param, year) {
  /* supprime des ecrans YT */
  ecVideos.innerHTML = "";
  /**affiche les videos  selctionnées par Param et Year*/
  vidClass.affVideos(ecVideos, param, year);

  if (!mob().mob) {
    /** ecoute les barres de videos et va les montrer si pas mobile */
    vidClass.affBar(document.querySelector(".menu"));
    const ecoute_barre = (e) => {
      ecVideos
        .querySelector(`[data-num = '${e.target.dataset.num}']`)
        .scrollIntoView();
    };
    document.querySelector(".barBox")?.addEventListener("click", ecoute_barre);
  }

  /* rajoute la fleche de retour Home  si plus d'une vidéo affichée */
  const nbVideos = vidClass.retourVideo.length;
  if (ecVideos.innerHTML && nbVideos > 1) affEffRetour("+");
  /**
   * selectionne les iframes
   */
  const lect = ecVideos.querySelectorAll(".lect");
  /** */
  const options = {
    root: ecVideos,
    rootMargin: "0px",
    threshold: 1,
  };
  /**
   * quand un iframe sort de Ecvideos,arrete la video et affiche la barre en bleu
   * @param {*} entries
   * @return stoppe la video
   */
  const guetteYT = new IntersectionObserver(ferme_videos, options);
  //observer tous les lecteurs ".lect"
  lect.forEach((ecr) => guetteYT.observe(ecr));
  return nbVideos;
}
/**
 * afficher les videos à partir de la classe ou la date choisie
 * @param {element} e li cliqué dans la liste des videos
 * @return {fn} affiche iframes  et titres des videos
 */
function aff_Videos(e) {
  if (!document.querySelector(".activeMenu")) return;
  /* pour années : dia_vid = .ann*/
  let dia_vid =
    `${typeVid(document.querySelector(".activeMenu").parentElement)}` +
    e.target.dataset.select;
  let year = e.target.dataset.year ? `${e.target.dataset.year}` : "";
  /* afficher les videos selon class et/ou annee */
  const aff = afficheLiens(dia_vid, year);
  titre.textContent = aff ? e.target.textContent : "";
}
/**
 * transférer le dataset.ph vers photo.html
 * @param {element} e li cliqué dans les menus blogs et photos
 */
function trans(e) {
  if (!e.target.dataset.ph) return;
  localStorage.setItem("data", e.target.dataset.ph);
  localStorage.setItem("sens_dates", "-1");
  localStorage.setItem("asp_images", "show");

  window.location.href = "./photos.html";
}
/* ferme les menus au listener sur ecvideos */
function dropclose(e) {
  if (
    (e.target === ecVideos || e.target === document.querySelector(".menu")) &&
    !ecVideos.innerHTML &&
    document.querySelector(".activeMenu")
  ) {
    /* met height du menu à zero et supprime la barre activeMenu */
    document
      .querySelector(".activeMenu")
      .parentElement.querySelector(".bloc-links").style.height = `0px`;
    document
      .querySelector(".titMenu.activeMenu")
      .classList.remove("activeMenu");
  }
}
/* -----------le programme------------------------- */

/* ========cliquer sur les menus ouvre les dropdown========= */
const menus = [...document.querySelectorAll(".btn-top")];
const titre = document.querySelector(".titre");
const ecVideos = document.querySelector(".ecranVideos");
/* ecouter les clicks sur les menus btn-top */
let menuIndex = 0;
menus.forEach((men, index) => {
  men.addEventListener("click", (e) => {
    /* supprimer la barre de menu active precedente et refermer le dropmenu*/
    menus[menuIndex].querySelector(".titMenu").classList.remove("activeMenu");
    /* activer le menu choisi */
    men.querySelector(".titMenu").classList.add("activeMenu");
    const dropCour = men.querySelector(".bloc-links");
    //si on clique et que le menu est fermé ou nul" => Ouvrir
    if (dropCour.style.height === `0px` || !dropCour.style.height) {
      dropCour.style.height = dropCour.scrollHeight + "px";
      /* effacer les videos, le titre global et la fleche retour */
      ecVideos.innerHTML = "";
      document.querySelector(".menu .barBox")?.remove();
      titre.textContent = "";
      affEffRetour("-");
      /* lancer les ecouteurs pour chaque li et les bloc_img */
      if (index < 4) {
        men.querySelector(".bloc-links").addEventListener("click", aff_Videos);
      }
      if (index === 4) {
        men.querySelector(".bloc-links").addEventListener("click", trans);
      }
      /* si index= 4, la page des blogs s'affiche */
    } else dropCour.style.height = `0px`;

    /* fermer le dropbox d'avant */
    if (menuIndex !== index) {
      menus[menuIndex].querySelector(".bloc-links").style.height = `0px`;
      document.querySelector(".menu .barBox")?.remove();
    }
    /* si on clique deux fois sur un menu sans choisir un sous menu, enlever le soulignement */
    if (
      menuIndex === index &&
      men.querySelector(".bloc-links").style.height === `0px` &&
      !ecVideos.innerHTML
    ) {
      men.querySelector(".titMenu").classList.remove("activeMenu");
    }
    /* remettre l'index courant */
    menuIndex = index;
  });
});
/* ecouter les clicks hors le menu principal et fermer le dropmenu */
document.querySelector("body").addEventListener("click", dropclose);
