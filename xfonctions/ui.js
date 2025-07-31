/* Module pour les utilitaires UI et zoom */
import { stop_fullScreen, toggle_fullScreen } from "./fullScreen.js";

export class UIManager {
  constructor(domElements, stats) {
    this.domElements = domElements;
    this.stats = stats;
  }

  /* Debouncing function */
  debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      const context = this;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, delay);
    };
  }

  /* fonction de tri du json entre numb et an */
  inverser(liste, sens) {
    liste.sort((a, b) => {
      if (a.an !== b.an) {
        return (a.an - b.an) * +sens;
      }
      return a.src.localeCompare(b.src) * +sens;
    });
  }

  /* switch du sens des fleches d'inversion dates */
  switchArrowDirection() {
    const updateArrow = document.querySelector(".update");
    const historyArrow = document.querySelector(".history");

    if (this.stats.sens_date === "-1") {
      updateArrow.classList.remove("eff_fl");
      historyArrow.classList.add("eff_fl");
    } else {
      updateArrow.classList.add("eff_fl");
      historyArrow.classList.remove("eff_fl");
    }
  }

  /* parametres à stocker sur localStorage et rediriger */
  setLocalStorageAndRedirect(par) {
    Object.keys(par).forEach((key) => {
      localStorage.setItem(key, par[key]);
    });
    window.location.href = "./photos.html";
  }

  /* Gestion du scroll avec affichage colonne timer */
  handleScroll(lastscroll) {
    const currentscroll = window.scrollY;
    const cont = this.domElements.cont;
    const isScrolling = Math.abs(lastscroll - currentscroll) > 1;
    const isAtExtreme =
      currentscroll === 0 ||
      currentscroll >=
        this.domElements.boiteImg.clientHeight - window.innerHeight - 10 ||
      lastscroll === 0;
    cont.classList.toggle("show_box", isScrolling && !isAtExtreme);
    return currentscroll;
  }

  alert() {
    this.domElements.full.classList.remove("showfl");
  }
}
