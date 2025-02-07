import { Affimg } from "./xfonctions/affimg.js";
import { fetchJSON } from "./xfonctions/api.js";
import { createElement } from "./xfonctions/dom.js";
import { Menubox } from "./xfonctions/menubox.js";
import { go_fullScreen, stop_fullScreen } from "./xfonctions/fullScreen.js";
import { navig, ordi_OS } from "./xfonctions/nav_os.js";
/* Si l'OS est windows, supprimer les barres de defilement */
// if (ordi_OS().win || ordi_OS().ios) {
  // document.querySelector(".image").classList.add("scrbar");
// }
/*  prendre en charge les boxes de VidCript et le sens des dates */
const val_trans = localStorage.getItem("data"); /* classList venant de Index */
let sens_date = localStorage.getItem("sens_dates"); /* sens dates */
let asp = localStorage.getItem("asp_images"); /* sens dates */

const hamb = document.querySelector(".hamburger"); /* le bouton de menu droit */
const showMod =
  document.querySelector(".ratio"); /* bouton de chgt ratio image */
const val = document.querySelector(".transval"); /* titre de l'ecran */
const aff_an = document.querySelector(".annee"); /* affichage annees */
const fix_fond = document.querySelector(".envel"); /* enveloppe principale */
const ret_fl = document.querySelectorAll(".ret_fl"); /* icones fleches */
const diap = document.querySelector(".diapo");
const fl_foot = document.querySelector(".pied").querySelectorAll(".ret_fl");
const cont = document.querySelector(".box_annees"); /* pour les liens années */
const menu = document.querySelector(".menu"); /** menu boxes */
const boiteImg = fix_fond.querySelector(".image");
const full = fix_fond.querySelector(".fullscreen"); /* icone "f" en bas */
const fleches = fix_fond.querySelectorAll(".fleches"); /* fleches g & d */
const right = fix_fond.querySelector(".right"); /*  fleche droite*/
const left = fix_fond.querySelector(".left"); /*  fleche gauche*/
const stop_debut = fix_fond.querySelector(".debut"); /*  stop gauche*/
const stop_fin = fix_fond.querySelector(".fin"); /* stop droit */
let tab_titre = [];
//---------préparation des liens pour le timer de droite-------------
/* cherche l'ID venant de index et affecte le titre à */
/* insere un bouton pour safari + mobile dans photos.html */
if (navig().safari && ordi_OS().ios && !navig().chromeIos) {
  cont.insertAdjacentHTML(
    "beforebegin",
    `<button id="stopLiens" >
    <span class="material-icons-outlined">cancel</span>
    </button>`
  );
}
/** switch du sens des fleches d'inversion dates */
if (sens_date === "1") {
  document.querySelector(".up").classList.add("eff_fl");
  document.querySelector(".down").classList.remove("eff_fl");
} else {
  document.querySelector(".up").classList.remove("eff_fl");
  document.querySelector(".down").classList.add("eff_fl");
}
/** fonction de tri du json entre numb et an */
const inverser = (liste, sens) => {
  liste.sort((a, b) =>
    a.src > b.src ? sens * -1 : a.src < b.src ? sens * 1 : 0
  );
  liste.sort((a, b) => (a.an > b.an ? sens * -1 : a.an < b.an ? sens * 1 : 0));
};
try {
  /** creation des lien_menu et du tableau des ph/spText */
  const menuBoxes = await fetchJSON("./xjson/box.json");
  const boxes = new Menubox(menuBoxes.filter((obj) => obj.menu === "ph"));
  boxes.apLienMenu(menu, sens_date);
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
  images.creeimages(boiteImg);
  images.creedates(cont);
} catch (e) {
  const alertEl = createElement("div", {
    class: "alert alert-danger m-2",
    role: "alert",
  });
  alertEl.innerText = "impossible de charger les elements";
  document.body.prepend(alertEl);
  console.error(e);
}
/** titre de la page vient du tableau des titres*/
val.textContent = tab_titre.find((val) => val.ph === val_trans).spText;
/** charger les images choisies et les liens de boxAnnées */
const list_img = [...boiteImg.querySelectorAll(".show")];
const lien_an = [...cont.querySelectorAll(".liens")];
/** ne faire apparaitre qu'une date sur 4 pour "photo" */
if (val_trans === "photo") {
  lien_an.forEach((dat, index) => {
    if (index % 3 !== 0) dat.setAttribute("data-seuil", "");
  });
}
/* --------------------------------------------- */
/*  fonction pour placer l'image verticalement selon l'année*/

const scrollImg = (e) => {
  window.scrollTo({
    top: list_img[e.target.dataset.num].offsetTop,
    behavior: "instant",
  });
  aff_an.textContent = list_img[e.target.dataset.num].dataset.an;
  // pos = true;
};
const posit_annee = () => {
  cont.addEventListener("click", scrollImg);
};

/* On/off de la musique et afficher les icones sons */
const play_pause = (sens) => {
  if (sens === 1) {
    audio.play();
    diap.querySelector(".mute").classList.add("eff_fl");
    diap.querySelector(".son").classList.remove("eff_fl");
  } else {
    audio.pause();
    diap.querySelector(".mute").classList.remove("eff_fl");
    diap.querySelector(".son").classList.add("eff_fl");
  }
  return sens;
};
/* arreter la musique  et remettre à son on*/
const clear_music = () => {
  clearInterval(nId);
  nId = null;
  audio.currentTime = 0;
  audio.pause();
  diap.querySelector(".mute").classList.add("eff_fl");
  diap.querySelector(".son").classList.remove("eff_fl");
  diap.classList.remove("diapo_on");
};
/* toggle lancer / arreter diapos et icone diapo si l'image n'est pas la dernière*/
const toggleDiapo = (image) => {
  if (
    list_img.length - 1 >
    -list_img[0].getBoundingClientRect().x / image.offsetWidth
  ) {
    diap.classList.toggle("diapo_on");
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
/* si toggle son on/off avec icone */
const toggleSon = (sens) => {
  return sens === 1 ? play_pause(0) : play_pause(1);
};
/* si condition= true on est au debut ou à la fin */
const toggleStop = (condition, el_stop, el_fl) => {
  if (condition) {
    el_stop.classList.remove("eff_fl");
    el_fl.classList.add("eff_fl");
    el_stop === stop_fin ? clear_music() : null;
  } else {
    el_stop.classList.add("eff_fl");
    el_fl.classList.remove("eff_fl");
  }
};
/* montre l'icone stop debut ou l'icone stop fin ou efface */
const showStop = () => {
  toggleStop(boiteImg.scrollLeft === 0, stop_debut, left);
  toggleStop(
    boiteImg.scrollLeft === boiteImg.scrollWidth - boiteImg.offsetWidth,
    stop_fin,
    right
  );
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
const dep_vert = (sens) => {
  window.scrollBy({
    top: list_img[0].getBoundingClientRect().height * sens,
    behavior: "instant",
  });
};
/* gestion des diapo par icones */
const diaporama = (image, diap_ic) => {
  diap_ic.querySelectorAll("*").forEach((el, index) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      switch (index) {
        case 0: {
          toggleDiapo(image);
          break;
        }
        case 1: {
          if (nId === null) break;
          play_pause(1);
          break;
        }
        case 2: {
          if (nId === null) break;
          play_pause(0);
          break;
        }
      }
    });
  });
};

/* ---utilisation des icones fleches pour derouler les images*/
const av_ar = (image, fl) => {
  fl.forEach((el, index) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      switch (index) {
        /** hamburger boxes dates */
        case 0: {
          hamb.classList.toggle("open");
          menu.classList.toggle("open");
          break;
        }
        case 1: {
          asp = asp === "show" ? "show show_mod" : "show";
          localStorage.setItem("asp_images", asp);
          window.location.href = "./photos.html";
          break;
        }
        /* fleche gauche*/
        case 2: {
          clear_music();
          dep_hor(image, -1);
          break;
        }
        /* fleche droite */
        case 3: {
          clear_music();
          dep_hor(image, 1);
          // boiteImg.scrollTo({left: boiteImg.scrollLeft + boiteImg.offsetWidth,});
          break;
        }
        /* retour*/
        case 4: {
          localStorage.clear();
          window.location = "./index.html";
          break;
        }
        /** inverser le sens des images */
        case 5: {
          localStorage.setItem("sens_dates", sens_date === "1" ? "-1" : "1");
          window.location.href = "./photos.html";
          break;
        }
      }
    });
  });
};
/* augmenter, diminuer le delai */
const delaiChange = (del, sens) => {
  if (!zoome) return del;
  del = del + 500 * sens;
  del = del >= 1000 ? del : (del = 1000);
  del = del >= 4000 ? (del = 4000) : del;
  document.querySelector(".duree").textContent = `${del / 1000} sec`;
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
      case gauche: {
        clear_music();
        dep_hor(image, -1);
        break;
      }
      case droite: {
        clear_music();
        dep_hor(image, 1);
        break;
      }
      case haut: {
        dep_vert(-1);
        break;
      }
      case bas: {
        dep_vert(1);
        break;
      }
      /* retour à Index.html ou au mur d'images*/
      case retour: {
        if (zoome) {
          zoom(e);
        } else {
          localStorage.clear();
          window.location = "./index.html";
        }
        break;
      }
      /* Toggle Fullscreen */
      case fs: {
        go_fullScreen(document.querySelector(".envel_mod"));
        break;
      }
      /* barre d'espace => Diaporama */
      case bar: {
        toggleDiapo(image);
        break;
      }
      case plus: {
        delai = delaiChange(delai, +1);
        break;
      }
      case moins: {
        delai = delaiChange(delai, -1);
        break;
      }
      case son: {
        if (nId) sensSon = toggleSon(sensSon);
      }
    }
  });
};
const alert = () => full.classList.remove("showfl");

/* Zoom quand on clicke sur une image en changeant les classes */

/* quand on arrive sur l'ecran Photo, */
const zoom = (e) => {
  /** si on clique sur une des icones fleches, ou image vide sort de cet ecouteur */
  if (e.target.matches(".bloc") || e.target.matches(".image")) return;
  zoome = zoome === true ? false : true;
  /* sortir de fullscreen et arreter la musique*/
  stop_fullScreen();
  clear_music();
  alert; /* supprime le "f" si 'lon revient dans la galerie d'image immediatement*/
  /* capter la hauteur de l'image dans le viewport  avant de cliquer*/
  if (zoome) yimg = e.target.getBoundingClientRect().top;
  clearInterval(nId);
  nId = null;
  /* ramener toutes les images en plein ecran et defilement horizontal */
  boiteImg.classList.toggle("image_mod");
  fix_fond.classList.toggle("envel_mod");
  /* montrer les fleches droite et gauche et diapo/son si zoome = true*/
  fleches.forEach((fl) => fl.classList.toggle("show_grid"));
  diap.classList.toggle("show_grid");
  /* effacer hamb &, retour & inverser*/
  hamb.classList.toggle("invis");
  showMod.classList.toggle("invis");
  fl_foot.forEach((fl) => fl.classList.toggle("eff_fl"));
  /* ------ gestion du cas ou l'ecran est en class "".image_mod" */
  if (zoome) {
    /* aller sur l'image sur laquelle on a cliqué */
    boiteImg.scrollTo({ left: e.target.offsetLeft });
    /* refermer hamb et menu de gauche */
    hamb.classList.remove("open");
    menu.classList.remove("open");
    diap.classList.remove("diapo_on");
    /* montrer la fleche f pour fullscreen , puis effacer en 4s*/
    full.classList.add("showfl");
    setTimeout(alert, 4000);
    /* rajouter le stop au debut et la la fin des images au depart, puis au scroll */
    // showStop();
  } else {
    full.classList.remove("showfl");
    window.scrollTo({
      top: e.target.offsetTop - yimg,
      behavior: "instant",
    });
  }
};
/* afficher les années dans box-années et dans le titre année */
const affiche_date = (entries) => {
  entries.forEach((ent) => {
    if (ent.isIntersecting) {
      cont
        .querySelector(`[data-num = "${ent.target.dataset.num}"]`)
        .classList.add("show-an");
      aff_an.textContent = ent.target.dataset.an;
    } else {
      cont
        .querySelector(`[data-num = "${ent.target.dataset.num}"]`)
        ?.classList.remove("show-an");
    }
  });
};

/* -----------programme------------------------------- */
const rnd = (max) => Math.floor(Math.random() * max) + 1;
let delai = 1500; /* durée base des diapos */
let sensSon = 1; /* son "on" au départ des diapos*/
let zoome = false; /* mode 'image' au départ */
let yimg = 0; /* position depart des images */
// let pos = false;
let audio = new Audio(`./audio/audio_${rnd(5)}.mp3`); /* audio */
let nId; /* initialiser le setInterval pour deplac horiz du diaporama */
let k = 1; /* k images deroulées par le diaporama */
diap.querySelector(".mute").classList.add("eff_fl");
diap.querySelector(".son").classList.remove("eff_fl");
aff_an.textContent = list_img[0].dataset.an;
/* un observer pour afficher les dates dans la timeline verticale */
let options = {
  root: null,
  rootMargin: "0% -2% -100% -98%",
  threshold: 0,
};
const guette = new IntersectionObserver(affiche_date, options);
list_img.forEach((img) => guette.observe(img));

/* affichage de la colonne timer au scroll------------------------ */
let lastscroll = 0;
window.addEventListener("scroll", () => {
  const currentscroll = window.scrollY;
  if (lastscroll - currentscroll > 1 || lastscroll - currentscroll < -1) {
    cont.classList.add("show_box");
    /* quand le curseur est tout en haut ou en bas*/
    if (
      currentscroll === 0 ||
      currentscroll >= boiteImg.clientHeight - window.innerHeight - 10 ||
      lastscroll === 0
    )
      cont.classList.remove("show_box");
  } else {
    cont.classList.remove("show_box");
  }
  lastscroll = currentscroll;
});
/* positionner à l'année choisie sur le coté droit------------------- */
posit_annee();
menu.querySelector(`[data-idmenu="${val_trans}"`).classList.add("active");
/* ecouter le menu principal de gauche ------------------------------- */
menu.addEventListener("click", (e) => {
  if (!e.target.dataset.idmenu) {
    menu.classList.remove("open");
    hamb.classList.remove("open");
    return;
  }
  localStorage.setItem("data", e.target.dataset.idmenu);
  window.location.href = "./photos.html";
});

/* cliquer sur les images pour les zoomer en horizontal et vice versa */

boiteImg.addEventListener("click", zoom);
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
drGa(boiteImg, touches);
/** ecouter le hamburger, retour, inverser(image), gauche, doite,(image_mod)*/
av_ar(boiteImg, ret_fl);
/* afficher les icones stop en debut ou fin de image_mod */
boiteImg.addEventListener("scroll", showStop);
/* ecouter les icones diapo et son */
diaporama(boiteImg, diap);
document.querySelector(".duree").textContent = `${delai / 1000} sec`;
