import { cloneTemplate } from "./dom.js";

/**
 * @typedef {Object} VideoItem
 * @property {string} clas - Classe CSS
 * @property {string} src - Source de l'image
 * @property {string} detail - Détail de la vidéo
 * @property {string} text - Texte descriptif
 * @property {string} groupe - Groupe d'appartenance
 */

/**
 * Gestion des menus vidéo
 * @class MenuVid
 */
export class MenuVid {
  #videos;
  #boxSelect;
  #dataMenu;
  #boxElement;
  /** @type {Array<{clas: string, menu: string, id_groupe: string, typVid: string, detail: string}>} */
  #liensSelect;
  #listatrier;
  #item;
  /** @type {HTMLUListelement}li créée a partir des todos */
  #listElement = [];
  /**
   * @param {VideoItem[]} videos - Liste des vidéos
   */
  constructor(videos) {
    if (!Array.isArray(videos)) {
      throw new TypeError("videos doit être un tableau");
    }
    // videos est la liste de toutes le videos raccrochées aux menusVideos.json
    this.#videos = videos;
  }

  /**
   * Affiche les boxes de sélection
   * @param {HTMLElement} element - Élément DOM parent
   * @param {string} datamenu - Type de menu
   * @throws {Error} Si les paramètres sont invalides
   */
  affBoxes(element) {
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error("element doit être un élément DOM valide");
    }
    // element est la div menu_fam, menu_voy ou menu_pll
    this.#boxElement = element;
    this.#boxSelect = this.#videos.filter((objbox) =>
      objbox.clas
        .slice(4, 8)
        .includes("." + this.#boxElement.className.slice(13))
    );
    // this.#boxSelect filtre de videos(videos+menus) par la clas .fam/.voy/.pll
    // enlever le typevideo de la clas et le mettre dans tv
    this.#boxSelect = this.#boxSelect.map((item) => {
      item.tv = item.clas.slice(0, 4);
      item.clas = item.clas.slice(4);
      return item;
    });
    // console.log("this.#boxSelect", this.#boxSelect);
    // ne garder que le menu (fam/voy/pll), le id_groupe, le detail venat de la classe
    this.#listatrier = this.#boxSelect.map((item) => {
      const { clas } = item;
      const menu = clas.slice(0, 4);
      const id_groupe = clas.slice(4, 9);
      const detail = clas.slice(9, 17);
      return { clas, menu, id_groupe, detail };
    });
    // console.log("this.#listatrier", this.#listatrier);
    /* enlever tous les doublons de listeatrier et trier : par detail puis groupe*/
    this.#liensSelect = [
      ...new Set(this.#listatrier.map((item) => JSON.stringify(item))),
    ]
      .map((item) => JSON.parse(item))
      .sort((a, b) => (a.detail > b.detail ? 1 : a.detail < b.detail ? -1 : 0))
      .sort((a, b) =>
        a.id_groupe > b.id_groupe ? 1 : a.id_groupe < b.id_groupe ? -1 : 0
      );
    // console.log("this.#liensSelect", this.#liensSelect);
    this.#listElement = new DocumentFragment();
    this.#liensSelect.forEach((boite) => {
      this.#item = this.#boxSelect.filter((it) => it.clas === boite.clas);
      const box = new MenuItem(this.#item);
      this.#listElement.append(box.returnBox);
    });
    this.#boxElement.append(this.#listElement);
  }
}

 // box=:{"clas": ".dia.voy.asie.vie","groupe": "Asie","text": "2017 Saigon-Da.Nang",
// "src": "./box_img/Vietnam-11.jpg","detail": "Vietnam}
class MenuItem {
  #boxElement;
  #boxItem;
  #boxList = [];
  liste;
  constructor(box) {
    this.#boxList = box;
    this.#boxItem = this.#boxList[0].clas;
    // console.log("boxItem", this.#boxItem, "this.#boxList", this.#boxList);
    this.#boxElement = cloneTemplate("menuBlocs").firstElementChild;
    this.#boxElement
      .querySelector(".blogs")
      .setAttribute("src", this.#boxList[0].src);
    this.#boxElement
      .querySelector(".blogs")
      .setAttribute("alt", this.#boxList[0].detail);
    this.#boxElement
      .querySelector(".blogs")
      .classList.add(this.#boxList[0].clas.slice(1, 4));
    this.#boxElement.querySelector(".ti_blog").textContent =
      this.#boxList[0].detail;
    this.#boxElement.querySelector(".groupe").textContent =
      this.#boxList[0].groupe;
    this.#boxElement.querySelector(".ti_blog").dataset.select = this.#boxItem;
    this.liste = new DocumentFragment();
    this.#boxList.forEach((obj) => {
      const ligne = new Box_liste(obj);
      this.liste.append(ligne.returnDetail);
    });
    this.#boxElement.querySelector(".vid_list").append(this.liste);
  }
  get returnBox() {
    return this.#boxElement;
  }
}

/* Creation d'une ligne de detail videos */
class Box_liste {
  #detail;
  #ligneElement;
  constructor(detail) {
    this.#detail = detail;
    this.#ligneElement = cloneTemplate("videoListe").firstElementChild;
    this.#ligneElement.textContent = this.#detail.text;
    this.#ligneElement.classList.add(this.#detail.tv)
  
  }
  get returnDetail() {
    return this.#ligneElement;
  }
}
