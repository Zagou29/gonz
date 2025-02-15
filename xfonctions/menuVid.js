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
    // if (typeof datamenu !== "string") {
    //   throw new TypeError("datamenu doit être une chaîne de caractères");
    // }

    this.#boxElement = element;
    this.#boxSelect = this.#videos.filter((objbox) =>
      objbox.clas
        .slice(4, 8)
        .includes("." + this.#boxElement.className.slice(13))
    );
    this.#listatrier = this.#boxSelect.map((item) => {
      const { clas } = item;
      const typVid = clas.slice(0, 4);
      const menu = clas.slice(4, 8);
      const id_groupe = clas.slice(8, 13);
      const detail = clas.slice(13, 17);
      return { clas, menu, id_groupe, typVid, detail };
    });
    /* enlever les doublons de clas et trier : typvid,id_groupe,detail*/
    this.#liensSelect = [
      ...new Set(this.#listatrier.map((item) => JSON.stringify(item))),
    ]
      .map((item) => JSON.parse(item))
      .sort((a, b) => (a.detail > b.detail ? 1 : a.detail < b.detail ? -1 : 0))
      .sort((a, b) =>
        a.id_groupe > b.id_groupe ? 1 : a.id_groupe < b.id_groupe ? -1 : 0
      )
      .sort((a, b) => (a.typVid > b.typVid ? -1 : a.typVid < b.typVid ? 1 : 0));
    this.#listElement = new DocumentFragment();
    this.#liensSelect.forEach((boite) => {
      this.#item = this.#boxSelect.filter((it) => it.clas === boite.clas);
      const box = new MenuItem(this.#item);
      this.#listElement.append(box.returnBox);
    });
    this.#boxElement.append(this.#listElement);
  }
}

/** creer une boite qui contient les infos vid/menu/groupe/select */
class MenuItem {
  #boxElement;
  #boxItem;
  #boxList = [];
  liste;
  constructor(box) {
    this.#boxList = box;
    this.#boxItem = this.#boxList[0].clas;
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
  }
  get returnDetail() {
    return this.#ligneElement;
  }
}
