import { cloneTemplate } from "./dom.js";

/**
 * Classe de gestion d'affichage des images et dates
 * @class Affimg
 */
export class Affimg {
  #imageList; // Liste des objets img venant de JSON
  #val_trans; // Option d'affichage ('photo' ou autre)
  #aspectClass; // show ou show_mod (aspect)
  #imagesFragment; // Fragment où charger les img
  #datesFragment; // Fragment où charger les liensdates
  #imagesContainer; // Boite où charger les images
  #datesContainer; // Boite où charger les Li dates

  /**
   * Crée une nouvelle instance d'Affimg
   * @param {Array} imageList - Liste des objets images du JSON
   * @param {string} val_trans - Option d'affichage ('photo' ou autre)
   * @param {string} aspectClass - Aspect des images ('show' ou 'show_mod')
   */
  constructor(imageList, val_trans, aspectClass) {
    this.#imageList = imageList;
    this.#val_trans = val_trans;
    this.#aspectClass = aspectClass;

    this.#preparerElements();
  }

  /**
   * Prépare les fragments d'images et de dates
   * @private
   */
  #preparerElements() {
    this.#imagesFragment = new DocumentFragment();
    this.#datesFragment = new DocumentFragment();
    let vseuil = "";
    let photoIndex = 0; // Index spécifique pour l'option 'photo'

    this.#imageList.forEach((imgData, index) => {
      const nouvSeuil = imgData.an !== vseuil;

      if (nouvSeuil) {
        imgData.seuil = imgData.an; // Définit le seuil pour cet élément
        vseuil = imgData.an;
        if (this.#val_trans === "photo") {
          photoIndex = index; // Met à jour l'index de référence pour 'photo'
        }
      } else {
        imgData.seuil = ""; // Pas de seuil pour cet élément
      }

      // Assigne le numéro basé sur l'option
      imgData.num = this.#val_trans === "photo" ? photoIndex : index;

      // Crée et ajoute l'élément image
      const imageItem = new AffItem(imgData, this.#aspectClass);
      this.#imagesFragment.append(imageItem.element);

      // Crée et ajoute l'élément date (conditionnellement pour 'photo')
      if (this.#val_trans !== "photo" || imgData.seuil !== "") {
        //si "pas photos"=> un lien un lien pour chaque nouvelle date
        //si "photos"=> un lien pour chaque seuil non null
        const dateItem = new DateItem(imgData);
        this.#datesFragment.append(dateItem.element);
      }
    });
  }

  /**
   * Injecte les images dans l'élément d'ancrage
   * @param {HTMLElement} imagesContainer - L'élément DOM où injecter les images
   * @returns {this}
   */
  creeimages(imagesContainer) {
    this.#imagesContainer = imagesContainer;
    // Vider le conteneur avant d'ajouter (optionnel, mais souvent utile)
    this.#imagesContainer.append(this.#imagesFragment);
    return this;
  }

  /**
   * Injecte les dates dans l'élément d'ancrage
   * @param {HTMLElement} datesContainer - L'élément DOM où injecter les dates
   * @returns {this}
   */
  creedates(datesContainer) {
    this.#datesContainer = datesContainer;
    // Vider le conteneur avant d'ajouter (optionnel, mais souvent utile)
    this.#datesContainer.append(this.#datesFragment);
    return this;
  }
}

/**
 * Classe de base pour les éléments créés (Image ou Date)
 * @class BaseItem
 */
class BaseItem {
  _element;
  _data;

  /**
   * @param {Object} data - Objet contenant les données (image ou date)
   * @param {string} templateId - ID du template HTML à cloner
   * @param {string} tagName - Nom de la balise de l'élément cloné (ex: 'IMG', 'BUTTON')
   */
  constructor(data, templateId, tagName) {
    this._data = data;
    const templateContent = cloneTemplate(templateId);
    // S'assurer que l'élément cloné correspond bien à la balise attendue
    this._element =
      templateContent.querySelector(tagName) ||
      templateContent.firstElementChild;
    if (!this._element) {
      throw new Error(
        `Template "${templateId}" ne contient pas l'élément attendu "${tagName}".`
      );
    }

    this._configureElement();
  }

  /**
   * Configure les attributs communs et dataset
   * @protected
   */
  _configureElement() {
    this._element.dataset.an = this._data.an;
    this._element.dataset.num = this._data.num;
    if (this._data.seuil !== "") {
      this._element.dataset.seuil = this._data.seuil;
    }
  }

  /**
   * Retourne l'élément DOM créé
   * @return {HTMLElement}
   */
  get element() {
    return this._element;
  }
}

/**
 * Classe pour créer un élément image
 * @class AffItem
 * @extends BaseItem
 */
class AffItem extends BaseItem {
  /**
   * @param {Object} imgData - Objet image à afficher
   * @param {string} aspectClass - Classe CSS à appliquer
   */
  constructor(imgData, aspectClass) {
    super(imgData, "photos", "img"); // Utilise le template "photos" et attend une balise <img>
    this._element.setAttribute("src", this._data.src);
    this._element.setAttribute("alt", this._data.an); // Utiliser une description plus utile si possible
    this._element.setAttribute("class", aspectClass);
    // La configuration commune (dataset) est gérée par le constructeur parent
  }
}

/**
 * Classe pour créer un élément de date (lien/bouton)
 * @class DateItem
 * @extends BaseItem
 */
class DateItem extends BaseItem {
  /**
   * @param {Object} dateData - Objet contenant les informations de date
   */
  constructor(dateData) {
    // Supposons que le template "liendate" contient un <button> ou <a>
    // Ajustez "button" si c'est une autre balise (ex: "a")
    super(dateData, "liendate", "li");
    this._element.textContent = this._data.an;
    // La configuration commune (dataset) est gérée par le constructeur parent
  }
}
