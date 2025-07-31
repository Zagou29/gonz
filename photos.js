import { Affimg } from "./xfonctions/affimg.js";
import { fetchJSON } from "./xfonctions/api.js";
import { createElement } from "./xfonctions/dom.js";
import { Menubox } from "./xfonctions/menubox.js";
import { navig, ordi_OS } from "./xfonctions/nav_os.js";
import {
  AudioManager,
  NavigationManager,
  DiaporamaManager,
  UIManager,
  ZoomManager,
  EventManager,
} from "./xfonctions/managers.js";

const stats = {
  val_trans: localStorage.getItem("val_trans") || "photo",
  delai: localStorage.getItem("delai") || 1500,
  asp: localStorage.getItem("asp_images"),
  pos_img: localStorage.getItem("pos_img"),
  sens_date: localStorage.getItem("sens_dates"),
  tab_titre: [],
  list_img: [],
  lien_an: [],
  sensSon: 1,
  zoome: false,
  yimg: 0,
  nId: null,
  k: 1,
  audio: null,
  skip_img: null,
};

/* Selecteurs DOM */
const domElements = {
  hamb: document.querySelector(".hamburger"),
  showMod: document.querySelector(".ratio"),
  val: document.querySelector(".transval"),
  aff_an: document.querySelector(".annee"),
  fix_fond: document.querySelector(".envel"),
  ret_fl: document.querySelectorAll(".ret_fl"),
  diap: document.querySelector(".diapo"),
  fl_foot: document.querySelector(".pied").querySelectorAll(".ret_fl"),
  cont: document.querySelector(".box_annees"),
  menu: document.querySelector(".menu"),
  boiteImg: document.querySelector(".envel").querySelector(".image"),
  full: document.querySelector(".envel").querySelector(".fullscreen"),
  fleches: document.querySelectorAll(".fleches"),
  right: document.querySelector(".envel").querySelector(".right"),
  left: document.querySelector(".envel").querySelector(".left"),
  stop_debut: document.querySelector(".envel").querySelector(".debut"),
  stop_fin: document.querySelector(".envel").querySelector(".fin"),
  mute: document.querySelector(".diapo").querySelector(".mute"),
  son: document.querySelector(".diapo").querySelector(".son"),
  duree: document.querySelector(".duree"),
};

/* insere un bouton pour safari + mobile dans photos.html */
if (navig().safari && ordi_OS().ios && !navig().chromeIos) {
  domElements.cont.insertAdjacentHTML(
    "beforebegin",
    `<button id="stopLiens" >
    <span class="material-icons-outlined">cancel</span>
    </button>`
  );
}
/* Initialisation ----------------------------*/
(async () => {
  try {
    // Initialisation des managers
    const audioManager = new AudioManager(domElements);
    stats.audio = audioManager.audio;

    const uiManager = new UIManager(domElements, stats);
    uiManager.switchArrowDirection();

    const navigationManager = new NavigationManager(domElements, stats);
    const diaporamaManager = new DiaporamaManager(
      domElements,
      stats,
      audioManager,
      navigationManager
    );
    const zoomManager = new ZoomManager(
      domElements,
      stats,
      diaporamaManager,
      uiManager
    );

    const managers = {
      audioManager,
      navigationManager,
      diaporamaManager,
      uiManager,
      zoomManager,
    };
    const eventManager = new EventManager(domElements, stats, managers);

    /** creation des lien_menu et du tableau des ph/spText */
    const [menuBoxes, listImages] = await Promise.all([
      fetchJSON("./xjson/box.json"),
      fetchJSON("./xjson/photoImg.json"),
    ]);

    const boxes = new Menubox(menuBoxes.filter((obj) => obj.menu === "ph"));
    boxes.apLienMenu(domElements.menu, "-1");
    stats.tab_titre = boxes.returnBoxes;

    /** 1 recent vers vieux, -1 le contraire */
    uiManager.inverser(listImages, stats.sens_date);

    /** si pas le json total, filtrer par val_trans */
    const listchoisie =
      stats.val_trans !== "photo"
        ? listImages.filter((obj) => obj.class === stats.val_trans)
        : listImages;

    /** charger dans la classe, créer les liens img et les liens dates */
    const images = new Affimg(listchoisie, stats.val_trans, stats.asp);
    images.creeimages(domElements.boiteImg);
    images.creedates(domElements.cont);
    stats.list_img = [...domElements.boiteImg.querySelectorAll(".show")];

    /** ne faire apparaitre qu'une date sur 4 pour "photo" et sur 3 pour les autres */
    stats.lien_an = [...domElements.cont.querySelectorAll(".liens")];
    stats.val_trans === "photo" ? (stats.skip_img = 3) : (stats.skip_img = 2);
    stats.lien_an.forEach((dat, index) => {
      if (index % stats.skip_img !== 0) dat.setAttribute("data-seuil", "");
    });

    /** titre de la page vient du tableau des titres*/
    domElements.val.textContent = stats.tab_titre.find(
      (val) => val.ph === stats.val_trans
    ).spText;

    domElements.mute.classList.add("eff_fl");
    domElements.son.classList.remove("eff_fl");
    domElements.aff_an.textContent = stats.list_img[0].dataset.an;

    /* un observer pour afficher les dates dans la timeline verticale */
    const options = {
      root: null,
      rootMargin: "0% -2% -100% -98%",
      threshold: 0,
    };
    const guette = new IntersectionObserver(
      (entries) => navigationManager.afficheDate(entries),
      options
    );
    stats.list_img.forEach((img) => guette.observe(img));

    /* positionner à l'année choisie sur le coté droit */
    domElements.menu
      .querySelector(`[data-idmenu="${stats.val_trans}"`)
      .classList.add("active");
    navigationManager.positImage(stats.pos_img);
    domElements.duree.textContent = `${stats.delai / 1000} sec`;

    // Initialiser tous les événements
    eventManager.initEventListeners();
  } catch (e) {
    const alertEl = createElement("div", {
      class: "alert alert-danger m-2",
      role: "alert",
    });
    alertEl.innerText = "impossible de charger les elements";
    document.body.prepend(alertEl);
    console.error(e);
  }
})();
