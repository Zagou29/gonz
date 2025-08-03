/* Module pour la gestion des événements */
import { toggle_fullScreen } from "./fullScreen.js";

export class EventManager {
  constructor(domElements, stats, managers) {
    this.domElements = domElements;
    this.stats = stats;
    this.audioManager = managers.audioManager;
    this.navigationManager = managers.navigationManager;
    this.diaporamaManager = managers.diaporamaManager;
    this.uiManager = managers.uiManager;
    this.zoomManager = managers.zoomManager;
  }

  /* utilisation des icones menu, ratio, retour, et inverser image */
  setupMenuActions(image) {
    const MENU_ACTIONS = {
      HAMBURGER: 0,
      RATIO: 1,
      ARROW_LEFT: 2,
      ARROW_RIGHT: 3,
      RETURN: 4,
      INVERT: 5,
    };

    this.domElements.ret_fl.forEach((el, index) => {
      el.addEventListener("click", (e) => {
        switch (index) {
          case MENU_ACTIONS.HAMBURGER:
            this.domElements.hamb.classList.toggle("open");
            this.domElements.menu.classList.toggle("open");
            break;
          case MENU_ACTIONS.RATIO:
            this.stats.asp =
              this.stats.asp === "show" ? "show show_mod" : "show";
            this.uiManager.setLocalStorageAndRedirect({
              asp_images: this.stats.asp,
              delai: this.stats.delai,
              pos_img: -this.domElements.boiteImg.getBoundingClientRect().top,
            });
            break;
          case MENU_ACTIONS.ARROW_LEFT:
            this.diaporamaManager.clearMusic();
            this.navigationManager.depHor(image, -1);
            break;
          case MENU_ACTIONS.ARROW_RIGHT:
            this.diaporamaManager.clearMusic();
            this.navigationManager.depHor(image, 1);
            break;
          case MENU_ACTIONS.RETURN:
            localStorage.clear();
            window.location = "./index.html";
            break;
          case MENU_ACTIONS.INVERT:
            this.uiManager.setLocalStorageAndRedirect({
              delai: this.stats.delai,
              sens_dates: this.stats.sens_date === "1" ? "-1" : "1",
              pos_img: 0,
            });
            break;
        }
      });
    });
  }

  /* gestion des touches de direction, retour et "F"pour fullscreen */
  setupKeyboardEvents(image) {
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

    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case KEY_CODES.gauche:
          e.preventDefault();
          this.diaporamaManager.clearMusic();
          this.navigationManager.depHor(image, -1);
          break;
        case KEY_CODES.droite:
          e.preventDefault(); 
          this.diaporamaManager.clearMusic();
          this.navigationManager.depHor(image, 1);
          break;
        case KEY_CODES.haut:
          this.navigationManager.depVert(-1);
          break;
        case KEY_CODES.bas:
          this.navigationManager.depVert(1);
          break;
        case KEY_CODES.retour:
          if (this.stats.zoome) {
            this.zoomManager.zoom(e);
          } else {
            localStorage.clear();
            window.location = "./index.html";
          }
          break;
        case KEY_CODES.fs:
          toggle_fullScreen(document.querySelector(".envel_mod"));
          break;
        case KEY_CODES.bar:
          this.diaporamaManager.toggleDiapo(image);
          break;
        case KEY_CODES.plus:
          this.stats.delai = this.diaporamaManager.delaiChange(
            this.stats.delai,
            +1
          );
          break;
        case KEY_CODES.moins:
          this.stats.delai = this.diaporamaManager.delaiChange(
            this.stats.delai,
            -1
          );
          break;
        case KEY_CODES.son:
          if (this.stats.nId)
            this.stats.sensSon = this.audioManager.toggleSon(
              this.stats.sensSon
            );
      }
    });
  }

  /* ecouter le menu principal de gauche */
  handleMenuClick(e) {
    const target = e.target;
    if (!target.dataset.idmenu) {
      this.domElements.menu.classList.remove("open");
      this.domElements.hamb.classList.remove("open");
      return;
    }
    this.uiManager.setLocalStorageAndRedirect({
      val_trans: target.dataset.idmenu,
      sens_dates: "1",
      pos_img: 0,
    });
  }

  initEventListeners() {
    let lastscroll = 0;
    let isManualScroll = false;
    const debouncedHandleScroll = this.uiManager.debounce(() => {
      lastscroll = this.uiManager.handleScroll(lastscroll);
    }, 10);

    window.addEventListener("scroll", debouncedHandleScroll);

    // Détecter le début d'un scroll manuel (touchstart/mousedown)
    this.domElements.boiteImg.addEventListener("touchstart", () => {
      isManualScroll = true;
    });
    this.domElements.boiteImg.addEventListener("mousedown", () => {
      isManualScroll = true;
    });

    this.domElements.boiteImg.addEventListener("scroll", () => {
      this.navigationManager.showStop();
      // Arrêter le diaporama seulement si c'est un scroll manuel
      if (isManualScroll && this.stats.nId) {
        this.diaporamaManager.clearMusic();
      }
    });

    // Réinitialiser le flag après un délai
    this.domElements.boiteImg.addEventListener("touchend", () => {
      setTimeout(() => {
        isManualScroll = false;
      }, 100);
    });
    this.domElements.boiteImg.addEventListener("mouseup", () => {
      setTimeout(() => {
        isManualScroll = false;
      }, 100);
    });

    this.domElements.menu.addEventListener("click", (e) =>
      this.handleMenuClick(e)
    );
    this.domElements.boiteImg.addEventListener("click", (e) =>
      this.zoomManager.zoom(e)
    );
    this.domElements.cont.addEventListener("click", (e) =>
      this.navigationManager.scrollImg(e)
    );

    this.setupMenuActions(this.domElements.boiteImg);
    this.diaporamaManager.setupDiaporama(this.domElements.boiteImg);
    this.setupKeyboardEvents(this.domElements.boiteImg);
  }
}
