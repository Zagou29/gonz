import { cloneTemplate } from "./dom.js";
/**
 * @typedef {object} boxes
 * @property {string} ec
 * @property {string} id
 * @property {string} class
 * @property {string} text
 */
export class Affvid {
  /**
   * @type {array}vidlist avec ec,id,class,text
   *  */
  #vidlist = [];
  #vidSelect = [];
  #listElement;
  #listElem;
  #container;
  #classe = "";
  #menu;
  #barre;
  #liste = [];
  #ul_Years;
  #an_Select;
  #li_Annee;
  #an;
  #v_t;
  #vidId;
  #tempId;
  /**
   * tableau des videos objets
   * @param {vidlist[]} vidlist
   */
  constructor(vidlist) {
    this.#vidlist = vidlist;
  }
  /**
   * @param {HTMLElement} element (ecVideos)
   * @param {string} clas (classes selectionné via le lien menu Li)
   */
  // charger les Thumbs dans ecVideos
  affVideos(container, classe, an) {
    this.#container = container;
    this.#classe = classe;
    this.#an = an;
    this.#listElement = new DocumentFragment();
    /* préparer vidSelect selon la classe ou l'année */
    if (this.#an) {
      /* si on déselectionne video ou diapo dans onglet annee*/
      if (this.#classe.length > 4) {
        this.#classe = this.#classe.slice(0, 4);
      } else {
        this.#classe = "";
      }
      /* si this.#clas="", le filtre prend tout */
      /* ne prend pas les playlist */
      this.#vidSelect = this.#vidlist
        .filter((obj) => obj.annee === an)
        .filter((obj) => obj.clas.includes(this.#classe))
        .filter((obj) => obj.id.length < 12);
    } else {
      this.#vidSelect = this.#vidlist.filter((obj) =>
        obj.clas.includes(this.#classe)
      );
    }
    this.#liste = [
      ...this.#vidSelect.filter((item) => item.clas.includes(".vid")),
      ...this.#vidSelect.filter((item) => item.clas.includes(".dia")),
    ];
    this.#liste.forEach((obj, index) => {
      // toujours thumnail pour l'affichage de depart des videos
      const video = new VidItem(obj, "ytThumb");
      video.retourItem
        .querySelector(".vidImg")
        .setAttribute("width", this.#setDim(this.#container, obj)[0]);
      video.retourItem
        .querySelector(".vidImg")
        .setAttribute("height", this.#setDim(this.#container, obj)[1]);
      video.retourItem.querySelector(".lect").dataset.num = index;
      video.retourItem.querySelector(".vidTitre").dataset.numt = index;
      this.#listElement.append(video.retourItem);
    });
    
    this.#container.append(this.#listElement);
  }
  // charger une video ou un Thumb après un titre VidTitre
  affVidUnique(container, vidId, tempId) {
    this.#tempId = tempId;
    this.#container = container;
    this.#vidId = vidId;
    // this.#listElement = new DocumentFragment();
    this.#vidSelect = this.#vidlist.find((item) => item.id === this.#vidId);
    const video = new VidItem(this.#vidSelect, this.#tempId);
    video.retourItem
      .querySelector(".vidImg")
      .setAttribute("width", this.#setDim(this.#container.parentElement, this.#vidSelect)[0]);
    video.retourItem
      .querySelector(".vidImg")
      .setAttribute(
        "height",
        this.#setDim(this.#container.parentElement, this.#vidSelect)[1]
      );
    this.#container.append(video.retourItem);
  }

  // charger les barres des videos/Thumb sous le menu
  affBar(menu) {
    if (this.#liste.length > 1) {
      this.#menu = menu;
      this.#listElem = new DocumentFragment();
      this.#liste.forEach((obj, index) => {
        const barItem = new BarItem(obj);
        barItem.retourBarItem.dataset.num = index;
        this.#listElem.append(barItem.retourBarItem);
      });
      this.#barre = cloneTemplate("barContainer");
      this.#barre.querySelector(".barBox").append(this.#listElem);
      this.#menu.append(this.#barre);
    }
  }
  // pour compter le nbre de videos dans vidscript
  get retourVideo() {
    return this.#vidSelect;
  }
  aff_ans(ul_Years) {
    this.#ul_Years = ul_Years;
    this.#li_Annee = new DocumentFragment();
    this.#an_Select = new Set(
      this.#vidlist.filter((obj) => obj.id.length < 12).map((it) => it.annee)
    );
    this.#an_Select.forEach((obj) => {
      const an_Item = new AnnItem(obj);
      this.#li_Annee.append(an_Item.retourAnnItem);
    });
    this.#ul_Years.append(this.#li_Annee);
  }
  // calcul des dimensions des videos/thumbs
  #setDim(ecrans, item) {
    const wl = ecrans.clientWidth - 5;
    const wh = ecrans.clientHeight - 27;
    const ratioI = item.ec === "43" ? 4 / 3 : 16 / 9;
    const ratioW = wl / wh;
    /* si on compare les ratios,il faut inverser et definir d'abord la hauteur */
    return [
      ratioW > ratioI ? Math.floor(wh * ratioI) : wl,
      ratioW > ratioI ? wh : Math.floor(wl / ratioI),
    ];
  }
}
// création d'un Thumb ou d'un Iframe video
class VidItem {
  #tempId;
  #vidItem;
  #vidElement;
  // tempId est le template a utiliser ytThumb ou ytFrame
  constructor(vid, tempId) {
    this.#tempId = tempId;
    this.#vidItem = vid;
    this.#vidElement = cloneTemplate(this.#tempId);
    // preparer le span titre seulement pour AffVideos
    if (this.#tempId === "ytThumb" || this.#tempId === "ytFrame") {
      this.#vidElement.querySelector(".vidTitre").textContent = `${
        this.#vidItem.clas.slice(0, 4) === ".vid" ? "Video " : "Diapo "
      }${this.#vidItem.text}`;
      this.#vidElement
        .querySelector(".vidTitre")
        .classList.add(
          `${this.#vidItem.clas.slice(0, 4) === ".vid" ? "video" : "diapo"}`
        );
    }
    const video = this.#vidElement.querySelector(".vidImg");
    if (this.#tempId === "ytThumb" || this.#tempId === "ytThumbR") {
      const thumbnail = `https://img.youtube.com/vi/${this.#vidItem.id
      }/maxresdefault.jpg`;
      video.style.backgroundImage = `url(${thumbnail})`;
      video.setAttribute("data-id", this.#vidItem.id);
    } else {
      video.setAttribute("data-id", this.#vidItem.id);
      video.setAttribute("title", this.#vidItem.text);
      this.#vidItem.id.length !== 34
        ? video.setAttribute(
            "src",
            `https://www.youtube-nocookie.com/embed/${
              this.#vidItem.id
            }?rel=0&amp&autoplay=1;modestbranding=1`
          )
        : video.setAttribute(
            "src",
            `https://www.youtube-nocookie.com/embed/videoseries?list=${
              this.#vidItem.id
            }&amp;rel=0&amp&autoplay=1;modestbranding=1`
          );
    }
  }
  get retourItem() {
    return this.#vidElement;
  }
}
class BarItem {
  #vidObj;
  #barElement;
  constructor(vid) {
    this.#vidObj = vid;
    this.#barElement = cloneTemplate("itemYT").firstElementChild;
    this.#barElement.textContent = this.#vidObj.text;
    this.#barElement.classList.add(this.#vidObj.clas.slice(1, 4));
  }

  get retourBarItem() {
    return this.#barElement;
  }
}
class AnnItem {
  #vidObj;
  #annElement;
  constructor(vid) {
    this.#vidObj = vid;
    this.#annElement = cloneTemplate("itemAn").firstElementChild;
    this.#annElement.textContent = this.#vidObj;
    this.#annElement.dataset.year = this.#vidObj;
    this.#annElement.dataset.select = ".ann";
  }

  get retourAnnItem() {
    return this.#annElement;
  }
}
