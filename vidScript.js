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
// const elements = [
//   ...document.querySelectorAll(".dropdown"),
//   document.querySelector(".ecranVideos"),
// ].filter(Boolean);
// elements.forEach((element) => element.classList.add("scrbar"));
/* -----------------les classes et les menus --------------------- */
/**Charger la liste globale des videos */
const vidList = await fetchJSON("./xjson/indexVid.json");
const menuList = await fetchJSON("./xjson/menusVideos.json");
/** trier les videos selon l'année old-> new */
vidList.sort((a, b) => (a.annee > b.annee ? 1 : a.annee < b.annee ? -1 : 0));
/** raccorder les videos aux menuboxes par les classes */
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
vidMenu.affBoxes(document.querySelector(".menu_fam"));
vidMenu.affBoxes(document.querySelector(".menu_voy"));
vidMenu.affBoxes(document.querySelector(".menu_pll"));
/* -----------------les fonctions--------------------- */
/* remonter au debut de la page */
function toTop() {
  ecVideos.scrollTo({ top: 0, behavior: "smooth" });
}
/**
 * definir la class .dia, .vid, tout, ou rien
 * @param {HTMLElement} box1
 * @param {HTMLElement} box2
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
 * @param {HTMLElement} el menu Voy ou Pll
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
  const retour = menu.querySelector(".retour");
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
      const videos = entry.target.querySelector(".vidImg");
      // si Frame, stoppe le son, si Thumb ne change rien au SRC
      videos.src = videos.src.replace("autoplay=1", "autoplay=0");
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
// charger la video YTFrameR a la place de l'image cliquée
function click_img(e) {
  const divImg = e.target.parentElement;
  if (e.target.className === "vidImg") {
    // supprimer le thumbnail img
    e.target.remove();
    // charger la video dans la div ".lect"
    vidClass.aff_ytFrameR(divImg, e.target.dataset.id);
  }
}
/* ramener la video selectionnée dans barBox */
const ecoute_barre = (e) => {
  ecVideos
    .querySelector(`[data-num = '${e.target.dataset.num}']`)
    .scrollIntoView();
};
// afficher les videos selon param et year et ytThumb ou ytFrame
function afficheLiens(param, year, tempId) {
  /* supprime des ecrans YT */
  ecVideos.innerHTML = "";
  /**affiche les videos  selectionnées par Param et Year*/
  vidClass.affVideos(ecVideos, param, year, tempId);
  // si on clique sur l'image, on remplace l'image par la video de meme ID
  if (tempId === "ytThumb") ecVideos.addEventListener("click", click_img);
  if (!mob().mob) {
    /** ecoute les barres de videos et ramène la video si pas mobile */
    vidClass.affBar(menu);
    document.querySelector(".barBox")?.addEventListener("click", ecoute_barre);
  }
  /* rajoute la fleche de retour Home  si plus d'une vidéo affichée */
  const nbVideos = vidClass.retourVideo.length;
  if (ecVideos.innerHTML && nbVideos > 1) affEffRetour("+");
  //  selectionne les iframes
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
 * @param {HTMLElement} e li cliqué dans la liste des videos
 * @return {fn} affiche iframes  et titres des videos
 */
function aff_Videos(e) {
  if (!menu.querySelector(".activeMenu")) return;
  /* pour années : dia_vid = .ann*/
  let dia_vid =
    `${typeVid(menu.querySelector(".activeMenu").parentElement)}` +
    e.target.dataset.select;
  let year = e.target.dataset.year ? `${e.target.dataset.year}` : "";
  /* afficher les videos selon class et/ou annee */
  const aff = afficheLiens(
    dia_vid,
    year,
    mob().mob ? "ytFrame" : dia_vid.search("pll") === 5 ? "ytFrame" : "ytThumb"
  );
  // si on ne clique pas sur 'Videos' ou 'Diapos' de "Années", refermer les boxes
  if (!(e.target.tagName === "LABEL") && !(e.target.tagName === "INPUT")) {
    menu
      .querySelector(".activeMenu")
      .parentElement.querySelector(".bloc-links").style.height = "0px";
  }

  titre.textContent = aff ? e.target.textContent : "";
}
/**
 * transférer le dataset.ph vers photo.html
 * @param {HTMLElement} e li cliqué dans les menus blogs et photos
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
    (e.target === ecVideos || e.target === menu) &&
    !ecVideos.innerHTML &&
    menu.querySelector(".activeMenu")
  ) {
    /* met height du menu à zero et supprime la barre activeMenu */
    menu
      .querySelector(".activeMenu")
      .parentElement.querySelector(".bloc-links").style.height = `0px`;
    menu.querySelector(".titMenu.activeMenu").classList.remove("activeMenu");
  }
}
/* -----------le programme------------------------- */
/* ========cliquer sur les menus ouvre les dropdown========= */
const menu = document.querySelector(".menu");
const titre = document.querySelector(".titre");
const ecVideos = document.querySelector(".ecranVideos");
/* ecouter les clicks seulement sur les menus span/titMenu */

/* Fonction pour gérer l'activation du menu */
function activerMenu(spanChoisi) {
  // Supprimer la barre de menu active précédente et refermer le dropmenu
  menu.querySelectorAll(".titMenu").forEach((sp) => {
    sp.classList.add("nonActif");
    sp.classList.remove("activeMenu");
  });
  spanChoisi.classList.add("activeMenu");
  spanChoisi.classList.remove("nonActif");
}
/* Ecouter les clicks seulement sur les menus span/titMenu */
menu.addEventListener("click", (e) => {
  const span_choisi = e.target;
  if (span_choisi.className.includes("titMenu")) {
    activerMenu(span_choisi);
    // faire disparaitre les boxes  non actives
    menu.querySelectorAll(".nonActif").forEach((sp) => {
      sp.parentElement.querySelector(".bloc-links").style.height = "0px";
    });
    const dropCour = span_choisi.parentElement.querySelector(".bloc-links");
    //si on clique et que le menu est fermé ou nul" => Ouvrir
    if (dropCour.style.height === `0px` || !dropCour.style.height) {
      dropCour.style.height = dropCour.scrollHeight + "px";
      /* effacer les videos, le titre global et la fleche retour */
      ecVideos.innerHTML = "";
      document.querySelector(".menu .barBox")?.remove();
      titre.textContent = "";
      affEffRetour("-");
      /* lancer les ecouteurs pour chaque li et les bloc_img */
      dropCour.addEventListener("click", aff_Videos);
      ecVideos.removeEventListener("click", click_img);
      dropCour.addEventListener("click", trans);
    } else {
      dropCour.style.height = `0px`;
      span_choisi.classList.remove("activeMenu");
    }
  }
});
/* ecouter les clicks hors le menu principal et fermer le dropmenu */
document.querySelector("body").addEventListener("click", dropclose);
