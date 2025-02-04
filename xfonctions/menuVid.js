import { cloneTemplate } from "./dom.js";

/**
 * @property {string} menu
 * @property {string} ph id
 * @property {string} href
 * @property {string} src
 * @property {string} spText texte
 * @property {string} divText
 */
/* creation des menus fam voy pll */
export class MenuVid {
  #videos = [];
  #boxSelect = [];
  #dataMenu;
  #boxElement;
  #liensSelect;
  #listatrier;
  #item;
  /** @type {HTMLUListelement}li créée a partir des todos */
  #listElement = [];
  /**
   *construit une liste de todos
   */
  constructor(videos) {
    this.#videos = videos;
  }
  /** renvoyer les boxes de choix des photos dans index.html */
  affBoxes(element, datamenu) {
    this.#boxElement = element;
    this.#dataMenu = datamenu;
    /** Array des objets box de PH*/
    this.#boxSelect = this.#videos.filter((objbox) =>
      objbox.clas.slice(4, 8).includes(this.#dataMenu)
    );

    /** préparer la liste pour le tri */
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
    /**créer une boite par objet et l'inserer dans listElement */
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
    /* prendre la classe du premier item */
    this.#boxItem = this.#boxList[0].clas;
    /** créer une boite à partir du template */
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
    // a supprimer si pas d'affichage des groupes
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
