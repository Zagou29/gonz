import { cloneTemplate } from "./dom.js";

/**
 * @typedef {object} Box
 * @property {string} menu - Type de menu
 * @property {string} ph - Identifiant
 * @property {string} href - Lien
 * @property {string} src - Source de l'image
 * @property {string} spText - Texte de l'image
 * @property {string} divText - Texte descriptif
 */

/**
 * Gestion des boîtes de menu
 * @class Menubox
 */
export class Menubox {
  /** @type {Box[]} */
  #boxes;
  #boxSelect;
  #dataMenu;
  #boxElement;
  #liensElements;
  #listLiens;
  /** @type {DocumentFragment} */
  #listElement;

  /**
   * @param {Box[]} boxes - Liste des boîtes
   */
  constructor(boxes) {
    if (!Array.isArray(boxes)) {
      throw new TypeError("boxes doit être un tableau");
    }
    this.#boxes = boxes;
  }

  /**
   * Affiche les boîtes de sélection
   * @param {HTMLElement} element - Élément DOM parent
   * @param {string} datamenu - Type de menu
   * @param {string} sens - Sens d'insertion ("1" pour append, autre pour prepend)
   * @throws {Error} Si les paramètres sont invalides
   */
  apBox_Ph(element, datamenu, sens) {
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error("element doit être un élément DOM valide");
    }
    if (typeof datamenu !== "string") {
      throw new TypeError("datamenu doit être une chaîne de caractères");
    }
    if (typeof sens !== "string") {
      throw new TypeError("sens doit être une chaîne de caractères");
    }

    this.#boxElement = element;
    this.#dataMenu = datamenu;
    this.#boxSelect = this.#boxes.filter(
      (objbox) => objbox.menu === this.#dataMenu
    );

    this.#listElement = new DocumentFragment();
    const insertMethod = sens === "1" ? "append" : "prepend";
    this.#boxSelect.forEach((boite) => {
      const box = new BoxItem(boite);
      this.#listElement[insertMethod](box.returnBox);
    });
    this.#boxElement.append(this.#listElement);
  }

  /**
   * Récupère les boîtes de photos
   * @returns {Array<{ph: string, spText: string}>}
   */
  get returnBoxes() {
    return this.#boxes
      .filter((obj) => obj.menu === "ph")
      .map((box) => {
        const { ph, spText } = box;
        return { ph, spText };
      });
  }

  /**
   * Affiche les liens de menu
   * @param {HTMLElement} element - Élément DOM parent
   * @param {string} sens - Sens d'insertion ("1" pour prepend, autre pour append)
   * @throws {Error} Si les paramètres sont invalides
   */
  apLienMenu(element, sens) {
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error("element doit être un élément DOM valide");
    }
    if (typeof sens !== "string") {
      throw new TypeError("sens doit être une chaîne de caractères");
    }

    this.#liensElements = element;
    this.#listLiens = new DocumentFragment();
    const insertMethod = sens === "1" ? "prepend" : "append";
    this.#boxes.forEach((lien) => {
      const lienMenu = new Lien_menu_item(lien);
      this.#listLiens[insertMethod](lienMenu.retourLienItem);
    });
    this.#liensElements.append(this.#listLiens);
  }
}

/** creer une boite HTML pour index.html */
class BoxItem {
  #boxElement;
  #boxItem;
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
    if (this.#boxItem.menu === "ph") {
      this.#boxElement.querySelector(".ti_blog").dataset.ph = this.#boxItem.ph;
    } else {
      this.#boxElement.setAttribute("href", this.#boxItem.href);
    }
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
