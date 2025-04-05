import { Affimg } from "./xfonctions/affimg.js";
import { fetchJSON } from "./xfonctions/api.js";
import { createElement } from "./xfonctions/dom.js";
import { Menubox } from "./xfonctions/menubox.js";
import { go_fullScreen, stop_fullScreen } from "./xfonctions/fullScreen.js";
import { navig, ordi_OS } from "./xfonctions/nav_os.js";

/* Constantes pour les valeurs utilisées dans plusieurs endroits */
const DELAI_MIN = 1000; // en millisecondes
const DELAI_MAX = 4000; // en millisecondes
const PAS_DELAI = 500; // en millisecondes

/*  prendre en charge les boxes de VidCript et le sens des dates */
const val_trans = localStorage.getItem("data"); /* classList venant de Index */
const sens_date = localStorage.getItem("sens_dates"); /* sens dates */
let asp = localStorage.getItem("asp_images"); /* sens dates */
let tab_titre = [];
let list_img = [];
let lien_an = [];
let delai = 1500; /* durée base des diapos */
let sensSon = 1; /* son "on" au départ des diapos*/
let zoome = false; /* mode 'image' au départ */
let yimg = 0; /* position depart des images */
let nId; /* initialiser setInterval ->deplac hor du diapor */
let k = 1; /* k images deroulées par le diaporama */
let pos_img = localStorage.getItem("pos_img");
// choisir le son des diaporamas
let audio;

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
  audio = new Audio(`./audio/audio_${rnd(11)}.mp3`);
};
/* Debouncing function */
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
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

/** switch du sens des fleches d'inversion dates */
const switchArrowDirection = () => {
  const updateArrow = document.querySelector(".update");
  const historyArrow = document.querySelector(".history");

  if (sens_date === "-1") {
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
    // Trier d'abord par année
    if (a.an !== b.an) {
      return a.an > b.an ? sens * -1 : sens * 1;
    }
    // Puis par source si les années sont identiques
    return a.src > b.src ? sens * -1 : a.src < b.src ? sens * 1 : 0;
  });
};

/* On/off de la musique et afficher les icones sons */
const play_pause = (sens) => {
  const shouldPlay = sens === 1;
  audio[shouldPlay ? "play" : "pause"]();
  domElements.mute.classList.toggle("eff_fl", shouldPlay);
  domElements.son.classList.toggle("eff_fl", !shouldPlay);
  return sens;
};

/* arreter la musique  et remettre à son on*/
const clear_music = () => {
  clearInterval(nId);
  nId = null;
  audio.currentTime = 0;
  audio.pause();
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
  k++;
  /* boucle audio */
  if (k % Math.floor(audio.duration / 1.5) === 0) {
    audio.currentTime = 0;
  }
};
/* deplacement relatif vertical des images */
const dep_vert = (sens) => {
  window.scrollBy({
    top: list_img[0].getBoundingClientRect().height * sens,
    behavior: "instant",
  });
};
/* toggle lancer / arreter diapos et icone diapo si l'image n'est pas la dernière*/
const toggleDiapo = (image) => {
  if (
    list_img.length - 1 >
    -list_img[0].getBoundingClientRect().x / image.offsetWidth
  ) {
    domElements.diap.classList.toggle("diapo_on");
    if (!nId && zoome) {
      nId = setInterval(() => {
        dep_hor(image, 1);
      }, delai);
      audio.play();
    } else {
      clear_music();
    }
  }
};
/* gestion des diapo par icones */
const diaporama = (image, diap_ic) => {
  diap_ic.querySelectorAll("*").forEach((el, index) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      switch (index) {
        case 0:
          toggleDiapo(image);
          break;
        case 1:
          if (nId === null) break;
          play_pause(1);
          break;
        case 2:
          if (nId === null) break;
          play_pause(0);
          break;
        case 3:
          delai = delaiChange(delai, +1);
          break;
      }
    });
  });
};

/* ---utilisation des icones menu, ratio, retour, et inverser image*/
const av_ar = (image, fl) => {
  fl.forEach((el, index) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      switch (index) {
        /** hamburger boxes dates */
        case 0:
          domElements.hamb.classList.toggle("open");
          domElements.menu.classList.toggle("open");
          break;
        case 1:
          // inverser l'aspect, puis capturer la situation verticale des images
          asp = asp === "show" ? "show show_mod" : "show";
          const pos_img = -domElements.boiteImg.getBoundingClientRect().top;
          localStorage.setItem("asp_images", asp);
          localStorage.setItem("pos_img", pos_img);
          window.location.href = "./photos.html";
          break;
        /* fleche gauche*/
        case 2:
          clear_music();
          dep_hor(image, -1);
          break;
        /* fleche droite */
        case 3:
          clear_music();
          dep_hor(image, 1);
          break;
        /* retour*/
        case 4:
          localStorage.clear();
          window.location = "./index.html";
          break;
        /** inverser le sens des images */
        case 5:
          localStorage.setItem("sens_dates", sens_date === "1" ? "-1" : "1");
          localStorage.setItem("pos_img", 0);
          window.location.href = "./photos.html";
          break;
      }
    });
  });
};

/* augmenter, diminuer le delai */
const delaiChange = (del, sens) => {
  if (!zoome) return del;
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
    e.preventDefault();
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
        if (zoome) {
          zoom(e);
        } else {
          localStorage.clear();
          window.location = "./index.html";
        }
        break;
      /* Toggle Fullscreen */
      case fs:
        go_fullScreen(document.querySelector(".envel_mod"));
        break;
      /* barre d'espace => Diaporama */

      case bar:
        toggleDiapo(image);
        break;
      case plus:
        delai = delaiChange(delai, +1);
        break;
      case moins:
        delai = delaiChange(delai, -1);
        break;
      case son:
        if (nId) sensSon = toggleSon(sensSon);
    }
  });
};

const alert = () => domElements.full.classList.remove("showfl");

/* Zoom quand on clicke sur une image en changeant les classes */
/* quand on arrive sur l'ecran Photo, */
const zoom = (e) => {
  /** si on clique sur une des icones fleches, ou image vide sort de cet ecouteur */
  if (e.target.matches(".bloc") || e.target.matches(".image")) return;

  zoome = !zoome;
  /* sortir de fullscreen et arreter la musique*/
  stop_fullScreen();
  clear_music();
  alert(); /* supprime le "f" si 'lon revient dans la galerie d'image immediatement*/
  /* capter la hauteur de l'image dans le viewport  avant de cliquer*/
  if (zoome) yimg = e.target.getBoundingClientRect().top;
  clearInterval(nId);
  nId = null;
  /* ramener toutes les images en plein ecran et defilement horizontal */
  domElements.boiteImg.classList.toggle("image_mod");
  domElements.fix_fond.classList.toggle("envel_mod");
  /* montrer les fleches droite et gauche et diapo/son si zoome = true*/
  domElements.fleches.forEach((fl) => fl.classList.toggle("show_grid"));
  domElements.diap.classList.toggle("show_grid");
  /* effacer hamb &, retour & inverser*/
  domElements.hamb.classList.toggle("invis");
  domElements.showMod.classList.toggle("invis");
  domElements.fl_foot.forEach((fl) => fl.classList.toggle("eff_fl"));
  /* ------ gestion du cas ou l'ecran est en class "".image_mod" */
  if (zoome) {
    /* aller sur l'image sur laquelle on a cliqué */
    domElements.boiteImg.scrollTo({ left: e.target.offsetLeft });
    /* refermer hamb et menu de gauche */
    domElements.hamb.classList.remove("open");
    domElements.menu.classList.remove("open");
    domElements.diap.classList.remove("diapo_on");
    /* montrer la fleche f pour fullscreen , puis effacer en 4s*/
    domElements.full.classList.add("showfl");
    setTimeout(alert, 4000);
  } else {
    domElements.full.classList.remove("showfl");
    window.scrollTo({
      top: e.target.offsetTop - yimg,
      behavior: "instant",
    });
  }
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
    top: list_img[e.target.dataset.num].offsetTop,
    behavior: "instant",
  });
  domElements.aff_an.textContent = list_img[e.target.dataset.num].dataset.an;
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
  const isScrolling = Math.abs(lastscroll - currentscroll) > 1;
  const isAtExtreme =
    currentscroll === 0 ||
    currentscroll >=
      domElements.boiteImg.clientHeight - window.innerHeight - 10 ||
    lastscroll === 0;
  domElements.cont.classList.toggle("show_box", isScrolling && !isAtExtreme);

  lastscroll = currentscroll;
};
const debouncedHandleScroll = debounce(handleScroll, 8); //delai à vérifier

/* ecouter le menu principal de gauche ------------------------------- */
const handleMenuClick = (e) => {
  const target = e.target;
  if (!target.dataset.idmenu) {
    domElements.menu.classList.remove("open");
    domElements.hamb.classList.remove("open");
    return;
  }
  // choisir le idmenu et positionner à l'image 0
  localStorage.setItem("data", target.dataset.idmenu);
  localStorage.setItem("pos_img", 0);
  window.location.href = "./photos.html";
};

/* Initialisation ----------------------------*/
(async () => {
  switchArrowDirection();
  initAudio();
  try {
    /** creation des lien_menu et du tableau des ph/spText */
    const menuBoxes = await fetchJSON("./xjson/box.json");
    const boxes = new Menubox(menuBoxes.filter((obj) => obj.menu === "ph"));
    boxes.apLienMenu(domElements.menu, "-1"); //toujours sens chronologique
    tab_titre = boxes.returnBoxes;

    /** va charger les objets img */
    const listImages = await fetchJSON("./xjson/photoImg.json");
    /** 1 recent vers vieux, -1 le contraire */
    inverser(listImages, Math.floor(sens_date));

    /** si pas le json total, filtrer par val_trans */
    const listchoisie =
      val_trans !== "photo"
        ? listImages.filter((obj) => obj.class === val_trans)
        : listImages;

    /** charger dans la classe, créer les liens img et les liens dates */
    const images = new Affimg(listchoisie, val_trans, asp);
    images.creeimages(domElements.boiteImg);
    images.creedates(domElements.cont);
    list_img = [...domElements.boiteImg.querySelectorAll(".show")];
    /** ne faire apparaitre qu'une date sur 4 pour "photo" */
    if (val_trans === "photo") {
      lien_an = [...domElements.cont.querySelectorAll(".liens")];
      lien_an.forEach((dat, index) => {
        if (index % 3 !== 0) dat.setAttribute("data-seuil", "");
      });
    }
    /** titre de la page vient du tableau des titres*/
    domElements.val.textContent = tab_titre.find(
      (val) => val.ph === val_trans
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
  domElements.aff_an.textContent = list_img[0].dataset.an;

  /* un observer pour afficher les dates dans la timeline verticale */
  let options = {
    root: null,
    rootMargin: "0% -2% -100% -98%",
    threshold: 0,
  };
  const guette = new IntersectionObserver(affiche_date, options);
  list_img.forEach((img) => guette.observe(img));

  /* positionner à l'année choisie sur le coté droit------------------- */
  posit_annee();
  domElements.menu
    .querySelector(`[data-idmenu="${val_trans}"`)
    .classList.add("active");
  posit_image(pos_img);

  /* ecouter les fleches clavier  de direction et  Retour , F et Space */
  const touches = {
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
  drGa(domElements.boiteImg, touches);
  /** ecouter le hamburger, retour, inverser(image), gauche, doite,(image_mod)*/
  av_ar(domElements.boiteImg, domElements.ret_fl);
  /* afficher les icones stop en debut ou fin de image_mod */
  domElements.boiteImg.addEventListener("scroll", showStop);
  /* ecouter les icones diapo et son */
  diaporama(domElements.boiteImg, domElements.diap);
  domElements.duree.textContent = `${delai / 1000} sec`;

  /* cliquer sur les images pour les zoomer en horizontal et vice versa */
  domElements.boiteImg.addEventListener("click", zoom);
  /* ecouter le menu principal de gauche ------------------------------- */
  domElements.menu.addEventListener("click", handleMenuClick);
  /* affichage de la colonne timer au scroll------------------------ */
  window.addEventListener("scroll", debouncedHandleScroll);
})();
