import { cloneTemplate } from "./dom.js";

/**
 * @typedef {object} boxes
 * @property {string} menu
 * @property {string} ph id
 * @property {string} href
 * @property {string} src
 * @property {string} spText texte
 * @property {string} divText
 */
export class Menubox {
  /** @type {boxes[]} objet avec tous les boxes (id,title,completed)*/
  #boxes = [];
  #boxSelect = [];
  #dataMenu;
  #boxElement;
  #liensElements;
  #liensSelect;
  #listLiens;
  /** @type {HTMLUListelement}li créée a partir des todos */
  #listElement = [];
  /**
   *construit une liste de todos
   * @param {boxes[]} boxes
   */
  constructor(boxes) {
    this.#boxes = boxes;
  }
  /** renvoyer les boxes de choix des photos dans index.html */
  apBox_Ph(element, datamenu, sens) {
    this.#boxElement = element;
    this.#dataMenu = datamenu;
    /** Array des objets box de PH*/
    this.#boxSelect = this.#boxes.filter(
      (objbox) => objbox.menu === this.#dataMenu
    );
    /** definir l'emplacement d'insertion des boites */
    this.#listElement = new DocumentFragment();
    /**céer une boite par objet et l'inserer dans listElement */
    if (sens === "1") {
      this.#boxSelect.forEach((boite) => {
        const box = new BoxItem(boite);
        this.#listElement.append(box.returnBox);
      });
    } else {
      this.#boxSelect.forEach((boite) => {
        const box = new BoxItem(boite);
        this.#listElement.prepend(box.returnBox);
      });
    }
    this.#boxElement.append(this.#listElement);
  }
  /** recuperer les ph et spText pour Photos */
  get returnBoxes() {
    return this.#boxes
      .filter((obj) => obj.menu === "ph")
      .map((box) => {
        const { ph, spText } = box;
        return { ph, spText };
      });
  }
  /** renvoyer les lien_menu dans photo.html */
  apLienMenu(element, sens) {
    this.#liensElements = element;
    this.#listLiens = new DocumentFragment();
    if (sens === "1") {
      this.#boxes.forEach((lien) => {
        const lienMenu = new Lien_menu_item(lien);
        this.#listLiens.prepend(lienMenu.retourLienItem);
      });
    } else {
      this.#boxes.forEach((lien) => {
        const lienMenu = new Lien_menu_item(lien);
        this.#listLiens.append(lienMenu.retourLienItem);
      });
    }
    this.#liensElements.append(this.#listLiens);
  }
}
/** creer une boite HTML pour index.html */
class BoxItem {
  #boxElement;
  #boxItem;
  #menu;
  constructor(box) {
    this.#boxItem = box;
    this.#boxElement = cloneTemplate(this.#boxItem.menu).firstElementChild;
    this.#boxElement
      .querySelector("img")
      .setAttribute("src", this.#boxItem.src);
    this.#boxElement
      .querySelector("img")
      .setAttribute("alt", this.#boxItem.spText);
    this.#boxElement.querySelector(".ti_blog").textContent =
      this.#boxItem.spText;
    this.#boxElement.querySelector(".texte").textContent =
      this.#boxItem.divText;
    this.#boxItem.menu === "ph"
      ? (this.#boxElement.querySelector(".ti_blog").dataset.ph =
          this.#boxItem.ph)
      : this.#boxElement.setAttribute("href", this.#boxItem.href);
  }
  get returnBox() {
    return this.#boxElement;
  }
}
/** créer un lien_menu pour photo.html */
class Lien_menu_item {
  #lienItem;
  #lienObj;
  constructor(lien) {
    this.#lienObj = lien;
    this.#lienItem = cloneTemplate("menu_dates").firstElementChild;
    this.#lienItem.dataset.idmenu = this.#lienObj.ph;
    this.#lienItem.textContent = this.#lienObj.spText;
  }

  get retourLienItem() {
    return this.#lienItem;
  }
}
