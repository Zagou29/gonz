import { Affimg } from "./xfonctions/affimg.js";
import { fetchJSON } from "./xfonctions/api.js";
import { createElement } from "./xfonctions/dom.js";
import { Menubox } from "./xfonctions/menubox.js";
import { stop_fullScreen, toggle_fullScreen } from "./xfonctions/fullScreen.js";
import { navig, ordi_OS } from "./xfonctions/nav_os.js";

/* Constantes pour les valeurs utilisées dans plusieurs endroits */
const DELAI_MIN = 1000; // en millisecondes
const DELAI_MAX = 4000; // en millisecondes
const PAS_DELAI = 500; // en millisecondes
const KEY_CODES = {
  gauche: "ArrowLeft",
  droite: "ArrowRight",
  haut: "ArrowUp",
  bas: "ArrowDown",
  retour: "Enter",
  fs: "KeyF",
  bar: "Space",
  plus: "Slash",
  moins: "Equal",
  son: "KeyS",
};
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
const MENU_ACTIONS = {
  HAMBURGER: 0,
  RATIO: 1,
  ARROW_LEFT: 2,
  ARROW_RIGHT: 3,
  RETURN: 4,
  INVERT: 5,
};

const DIAPO_ACTIONS = {
  TOGGLE_DIAPO: 0,
  PLAY: 1,
  PAUSE: 2,
  SPEED_UP: 3,
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
/* Initialisation de l'audio */
const initAudio = () => {
  const rnd = (max) => Math.floor(Math.random() * max) + 1;
  stats.audio = new Audio(`./audio/audio_${rnd(11)}.mp3`);
  // Gestion propre de la boucle
  stats.audio.addEventListener("ended", () => {
    stats.audio.currentTime = 0;
    stats.audio.play();
  });
};
/* Debouncing function */
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

/* cherche l'ID venant de index et affecte le titre à */
/* insere un bouton pour safari + mobile dans photos.html */
if (navig().safari && ordi_OS().ios && !navig().chromeIos) {
  domElements.cont.insertAdjacentHTML(
    "beforebegin",
    `<button id="stopLiens" >
    <span class="material-icons-outlined">cancel</span>
    </button>`
  );
}
//parametres à stocker sur localStorage et rediriger vers photos.html
const setLocalStorageAndRedirect = (par) => {
  Object.keys(par).forEach((key) => {
    localStorage.setItem(key, par[key]);
  });
  window.location.href = "./photos.html";
};
/** switch du sens des fleches d'inversion dates */
const switchArrowDirection = () => {
  const updateArrow = document.querySelector(".update");
  const historyArrow = document.querySelector(".history");

  if (stats.sens_date === "-1") {
    updateArrow.classList.remove("eff_fl");
    historyArrow.classList.add("eff_fl");
  } else {
    updateArrow.classList.add("eff_fl");
    historyArrow.classList.remove("eff_fl");
  }
};

/** fonction de tri du json entre numb et an */
const inverser = (liste, sens) => {
  liste.sort((a, b) => {
    // Trier d'abord par année, puis src
    if (a.an !== b.an) {
      return (a.an - b.an) * +sens;
    }
    return a.src.localeCompare(b.src) * +sens;
  });
};

/* On/off de la musique et afficher les icones sons */
const play_pause = (sens) => {
  const shouldPlay = sens === 1;
  stats.audio[shouldPlay ? "play" : "pause"]();
  domElements.mute.classList.toggle("eff_fl", shouldPlay);
  domElements.son.classList.toggle("eff_fl", !shouldPlay);
  return sens;
};

/* arreter la musique  et remettre à son on*/
const clear_music = () => {
  clearInterval(stats.nId);
  stats.nId = null;
  stats.audio.currentTime = 0;
  stats.audio.pause();
  domElements.mute.classList.add("eff_fl");
  domElements.son.classList.remove("eff_fl");
  domElements.diap.classList.remove("diapo_on");
};

/* si condition= true on est au debut ou à la fin */
const toggleStop = (condition, el_stop, el_fl) => {
  el_stop.classList.toggle("eff_fl", !condition);
  el_fl.classList.toggle("eff_fl", condition);
  if (condition && el_stop === domElements.stop_fin) {
    clear_music();
  }
};

/* montre l'icone stop debut ou l'icone stop fin ou efface */
const showStop = () => {
  toggleStop(
    domElements.boiteImg.scrollLeft === 0,
    domElements.stop_debut,
    domElements.left
  );
  toggleStop(
    domElements.boiteImg.scrollLeft ===
      domElements.boiteImg.scrollWidth - domElements.boiteImg.offsetWidth,
    domElements.stop_fin,
    domElements.right
  );
};
/* positionner l'image à la position récupérée par getBoudingClient Rect().top*/
const posit_image = (pos) => {
  window.scrollTo({
    top: pos,
    behavior: "instant",
  });
};

/* deplacement relatif horiz ou vertical des images */
const dep_hor = (box, sens) => {
  box.scrollBy({
    left: box.offsetWidth * sens,
    behavior: "instant",
  });
  stats.k++;
};
/* deplacement relatif vertical des images */
const dep_vert = (sens) => {
  window.scrollBy({
    top: stats.list_img[0].getBoundingClientRect().height * sens,
    behavior: "instant",
  });
};
/* toggle lancer / arreter diapos et icone diapo si l'image n'est pas la dernière*/
const toggleDiapo = (image) => {
  if (
    stats.list_img.length - 1 >
    -stats.list_img[0].getBoundingClientRect().x / image.offsetWidth
  ) {
    domElements.diap.classList.toggle("diapo_on");
    if (!stats.nId && stats.zoome) {
      stats.nId = setInterval(() => {
        dep_hor(image, 1);
      }, stats.delai);
      stats.audio.play();
    } else {
      clear_music();
    }
  }
};
/* gestion des diapo par icones */
const diaporama = (image, diap_ic) => {
  diap_ic.querySelectorAll("*").forEach((el, index) => {
    el.addEventListener("click", (e) => {
      // e.preventDefault();
      switch (index) {
        case DIAPO_ACTIONS.TOGGLE_DIAPO:
          toggleDiapo(image);
          break;
        case DIAPO_ACTIONS.PLAY:
          if (stats.nId === null) break;
          play_pause(1);
          break;
        case DIAPO_ACTIONS.PAUSE:
          if (stats.nId === null) break;
          play_pause(0);
          break;
        case DIAPO_ACTIONS.SPEED_UP:
          stats.delai = delaiChange(stats.delai, +1);
          break;
      }
    });
  });
};

/* ---utilisation des icones menu, ratio, retour, et inverser image*/
const av_ar = (image, fl) => {
  fl.forEach((el, index) => {
    el.addEventListener("click", (e) => {
      // e.preventDefault();
      switch (index) {
        /** hamburger boxes dates */
        case MENU_ACTIONS.HAMBURGER:
          domElements.hamb.classList.toggle("open");
          domElements.menu.classList.toggle("open");
          break;
        case MENU_ACTIONS.RATIO:
          // inverser l'aspect, puis capturer la situation verticale des images
          stats.asp = stats.asp === "show" ? "show show_mod" : "show";
          setLocalStorageAndRedirect({
            asp_images: stats.asp,
            delai: stats.delai,
            pos_img: -domElements.boiteImg.getBoundingClientRect().top,
          });
          break;
        /* fleche gauche*/
        case MENU_ACTIONS.ARROW_LEFT:
          clear_music();
          dep_hor(image, -1);
          break;
        /* fleche droite */
        case MENU_ACTIONS.ARROW_RIGHT:
          clear_music();
          dep_hor(image, 1);
          break;
        /* retour*/
        case MENU_ACTIONS.RETURN:
          localStorage.clear();
          window.location = "./index.html";
          break;
        /** inverser le sens des images */
        case MENU_ACTIONS.INVERT:
          setLocalStorageAndRedirect({
            delai: stats.delai,
            sens_dates: stats.sens_date === "1" ? "-1" : "1",
            pos_img: 0,
          });
          break;
      }
    });
  });
};
/* augmenter, diminuer le delai */
const delaiChange = (del, sens) => {
  if (!stats.zoome) return del;
  del === DELAI_MAX ? (del = DELAI_MIN) : (del = del + PAS_DELAI * sens);
  del = Math.max(DELAI_MIN, del);
  del = Math.min(DELAI_MAX, del);
  domElements.duree.textContent = `${del / 1000} sec`;
  return del;
};

/* gestion des touches de direction, retour et "F"pour fullscreen */
const drGa = (
  image,
  { gauche, droite, haut, bas, retour, fs, bar, plus, moins, son }
) => {
  document.addEventListener("keydown", (e) => {
    // e.preventDefault();
    /* image de droite ou image de gauche */
    switch (e.code) {
      /* aller à position gauche de l'image- largeur de l'image*/
      case gauche:
        clear_music();
        dep_hor(image, -1);
        break;
      case droite:
        clear_music();
        dep_hor(image, 1);
        break;
      case haut:
        dep_vert(-1);
        break;
      case bas:
        dep_vert(1);
        break;
      /* retour à Index.html ou au mur d'images*/
      case retour:
        if (stats.zoome) {
          zoom(e);
        } else {
          localStorage.clear();
          window.location = "./index.html";
        }
        break;
      /* Toggle Fullscreen */
      case fs:
        toggle_fullScreen(document.querySelector(".envel_mod"));
        break;
      /* barre d'espace => Diaporama */

      case bar:
        toggleDiapo(image);
        break;
      case plus:
        stats.delai = delaiChange(stats.delai, +1);
        break;
      case moins:
        stats.delai = delaiChange(stats.delai, -1);
        break;
      case son:
        if (stats.nId) stats.sensSon = toggleSon(stats.sensSon);
    }
  });
};

const alert = () => domElements.full.classList.remove("showfl");

/* Zoom quand on clicke sur une image en changeant les classes */
/* quand on arrive sur l'ecran Photo, */
const zoom = (e) => {
  if (shouldExitZoom(e)) return;
  stats.zoome = !stats.zoome;
  //zoome=true
  handleZoomToggle(e);
  updateZoomUI(e);
};

const shouldExitZoom = (e) => {
  return e.target.matches(".bloc") || e.target.matches(".image");
};

const handleZoomToggle = (e) => {
  stop_fullScreen();
  clear_music();
  alert();
  if (stats.zoome) {
    // Zoom activé;
    stats.yimg = e.target.getBoundingClientRect().top;
    clearInterval(stats.nId);
    stats.nId = null;
  }
};

const updateZoomUI = (e) => {
  domElements.boiteImg.classList.toggle("image_mod");
  domElements.fix_fond.classList.toggle("envel_mod");
  domElements.fleches.forEach((fl) => fl.classList.toggle("show_grid"));
  domElements.diap.classList.toggle("show_grid");
  domElements.hamb.classList.toggle("invis");
  domElements.showMod.classList.toggle("invis");
  domElements.fl_foot.forEach((fl) => fl.classList.toggle("eff_fl"));

  if (stats.zoome) {
    handleZoomIn(e);
  } else {
    handleZoomOut(e);
  }
};

const handleZoomIn = (e) => {
  domElements.boiteImg.scrollTo({ left: e.target.offsetLeft });
  domElements.hamb.classList.remove("open");
  domElements.menu.classList.remove("open");
  domElements.diap.classList.remove("diapo_on");
  domElements.full.classList.add("showfl");
  setTimeout(alert, 4000);
  domElements.boiteImg.addEventListener("wheel", stopDiapo);
};

const handleZoomOut = (e) => {
  domElements.full.classList.remove("showfl");
  domElements.boiteImg.removeEventListener("wheel", stopDiapo);
  window.scrollTo({
    top: e.target.offsetTop - stats.yimg,
    behavior: "instant",
  });
};
const stopDiapo = (e) => {
  clear_music();
};
/* afficher les années dans box-années et dans le titre année */
const affiche_date = (entries) => {
  entries.forEach((ent) => {
    const dataNum = ent.target.dataset.num;
    const dateElement = domElements.cont.querySelector(
      `[data-num="${dataNum}"]`
    );
    if (!dateElement) return;

    dateElement.classList.toggle("show-an", ent.isIntersecting);

    if (ent.isIntersecting) {
      domElements.aff_an.textContent = ent.target.dataset.an;
    }
  });
};

/*  fonction pour placer l'image verticalement selon l'année*/
const scrollImg = (e) => {
  window.scrollTo({
    top: stats.list_img[e.target.dataset.num].offsetTop,
    behavior: "instant",
  });
  domElements.aff_an.textContent =
    stats.list_img[e.target.dataset.num].dataset.an;
};

const posit_annee = () => {
  domElements.cont.addEventListener("click", scrollImg);
};

/* si toggle son on/off avec icone */
const toggleSon = (sens) => (sens === 1 ? play_pause(0) : play_pause(1));

/* affichage de la colonne timer au scroll---- */
let lastscroll = 0;
const handleScroll = () => {
  const currentscroll = window.scrollY;
  const cont = domElements.cont;
  const isScrolling = Math.abs(lastscroll - currentscroll) > 1;
  const isAtExtreme =
    currentscroll === 0 ||
    currentscroll >=
      domElements.boiteImg.clientHeight - window.innerHeight - 10 ||
    lastscroll === 0;
  cont.classList.toggle("show_box", isScrolling && !isAtExtreme);

  lastscroll = currentscroll;
};
const debouncedHandleScroll = debounce(handleScroll, 10); //delai à vérifier

/* ecouter le menu principal de gauche ------------------------------- */
const handleMenuClick = (e) => {
  const target = e.target;
  if (!target.dataset.idmenu) {
    domElements.menu.classList.remove("open");
    domElements.hamb.classList.remove("open");
    return;
  }
  // choisir le idmenu et positionner à l'image 0
  setLocalStorageAndRedirect({
    val_trans: target.dataset.idmenu,
    sens_dates: "1",
    pos_img: 0,
  });
};
const initEventListeners = () => {
  initScrollListeners();
  initMenuListeners();
  initImageListeners();
  initKeyboardListeners();
};

const initScrollListeners = () => {
  window.addEventListener("scroll", debouncedHandleScroll);
  domElements.boiteImg.addEventListener("scroll", showStop);
};

const initMenuListeners = () => {
  domElements.menu.addEventListener("click", handleMenuClick);
};

const initImageListeners = () => {
  domElements.boiteImg.addEventListener("click", zoom);
};

const initKeyboardListeners = () => {
  av_ar(domElements.boiteImg, domElements.ret_fl);
  diaporama(domElements.boiteImg, domElements.diap);
  drGa(domElements.boiteImg, KEY_CODES);
};
/* Initialisation ----------------------------*/
(async () => {
  switchArrowDirection();
  initAudio();
  try {
    /** creation des lien_menu et du tableau des ph/spText */
    const [menuBoxes, listImages] = await Promise.all([
      fetchJSON("./xjson/box.json"),
      fetchJSON("./xjson/photoImg.json"),
    ]);
    const boxes = new Menubox(menuBoxes.filter((obj) => obj.menu === "ph"));
    boxes.apLienMenu(domElements.menu, "-1"); //toujours sens chronologique
    stats.tab_titre = boxes.returnBoxes;

    /** 1 recent vers vieux, -1 le contraire */
    inverser(listImages, stats.sens_date);
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
  } catch (e) {
    const alertEl = createElement("div", {
      class: "alert alert-danger m-2",
      role: "alert",
    });
    alertEl.innerText = "impossible de charger les elements";
    document.body.prepend(alertEl);
    console.error(e);
  }
  domElements.mute.classList.add("eff_fl");
  domElements.son.classList.remove("eff_fl");
  domElements.aff_an.textContent = stats.list_img[0].dataset.an;

  /* un observer pour afficher les dates dans la timeline verticale */
  let options = {
    root: null,
    rootMargin: "0% -2% -100% -98%",
    threshold: 0,
  };
  const guette = new IntersectionObserver(affiche_date, options);
  stats.list_img.forEach((img) => guette.observe(img));

  /* positionner à l'année choisie sur le coté droit------------------- */
  posit_annee();
  domElements.menu
    .querySelector(`[data-idmenu="${stats.val_trans}"`)
    .classList.add("active");
  posit_image(stats.pos_img);
  domElements.duree.textContent = `${stats.delai / 1000} sec`;
  initEventListeners();
})();
