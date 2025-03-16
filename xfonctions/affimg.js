import { cloneTemplate } from "./dom.js";

/**
 * Classe de gestion d'affichage des images et dates
 * @class Affimg
 */
export class Affimg {
  #listimg; // Liste des objets img venant de JSON
  #opt; // Option 'photo' ou non
  #asp; // show ou show_mod (aspect)
  #elt_images; // Fragment où charger les img
  #elt_dates; // Element où charger les liensdates
  #ancre_imgs; // Boite où charger les images
  #ancres_dates; // Boite où charger les Li dates

  /**
   * Crée une nouvelle instance d'Affimg
   * @param {Array} listimg - Liste des objets images du JSON
   * @param {string} opt - Option d'affichage ('photo' ou autre)
   * @param {string} asp - Aspect des images ('show' ou 'show_mod')
   */
  constructor(listimg, opt, asp) {
    this.#listimg = listimg;
    this.#opt = opt;
    this.#asp = asp;

    this.#preparerImages();
    this.#preparerDates();
  }

  /**
   * Prépare les éléments d'images
   * @private
   */
  #preparerImages() {
    this.#elt_images = new DocumentFragment();
    let n = 0;
    let vseuil = "";

    // S'assurer que le premier élément a une valeur seuil initiale
    if (this.#listimg.length > 0) {
      this.#listimg[0].seuil = vseuil;
    }

    if (this.#opt === "photo") {
      this.#preparerImagesPhoto(vseuil);
    } else {
      this.#preparerImagesAutres(vseuil);
    }
  }

  /**
   * Prépare les images pour l'option 'photo'
   * @param {string} vseuil - Valeur seuil initiale
   * @private
   */
  #preparerImagesPhoto(vseuil) {
    let n = 0;
    this.#listimg.forEach((obj, index) => {
      if (obj.an !== vseuil) {
        obj.seuil = obj.an;
        obj.num = index;
        n = index;
      } else {
        obj.num = n;
        obj.seuil = "";
      }

      const image = new AffItem(obj, this.#asp);
      this.#elt_images.append(image.retourImage);
      vseuil = obj.an;
    });
  }

  /**
   * Prépare les images pour les options autres que 'photo'
   * @param {string} vseuil - Valeur seuil initiale
   * @private
   */
  #preparerImagesAutres(vseuil) {
    let ind = 0;
    this.#listimg.forEach((obj, index) => {
      if (obj.an !== vseuil) {
        obj.seuil = obj.an;
        // S'il y a moins de 4 éléments après le précédent non vide, forcer seuil à "",
        // sinon recaler ind sur l'index de cette ligne
        if (index - ind < 4 && index - ind > 0) {
          obj.seuil = "";
        } else {
          ind = index;
        }
      } else {
        obj.seuil = "";
      }

      obj.num = index;
      const image = new AffItem(obj, this.#asp);
      this.#elt_images.append(image.retourImage);
      vseuil = obj.an;
    });
  }

  /**
   * Prépare les éléments de dates
   * @private
   */
  #preparerDates() {
    this.#elt_dates = new DocumentFragment();

    if (this.#opt === "photo") {
      // Pour l'option photo, n'ajouter que les éléments avec un seuil non vide
      this.#listimg.forEach((obj) => {
        if (obj.seuil !== "") {
          const lien_date = new DateItem(obj);
          this.#elt_dates.append(lien_date.retourDateItem);
        }
      });
    } else {
      // Pour les autres options, ajouter tous les éléments
      this.#listimg.forEach((obj) => {
        const lien_date = new DateItem(obj);
        this.#elt_dates.append(lien_date.retourDateItem);
      });
    }
  }

  /**
   * Injecte les images dans l'élément d'ancrage
   * @param {HTMLElement} ancre_imgs - L'élément DOM où injecter les images
   */
  creeimages(ancre_imgs) {
    this.#ancre_imgs = ancre_imgs;
    this.#ancre_imgs.append(this.#elt_images);
  }

  /**
   * Injecte les dates dans l'élément d'ancrage
   * @param {HTMLElement} ancres_dates - L'élément DOM où injecter les dates
   */
  creedates(ancres_dates) {
    this.#ancres_dates = ancres_dates;
    this.#ancres_dates.append(this.#elt_dates);
  }
}

/**
 * Classe pour créer un élément image
 * @class AffItem
 */
class AffItem {
  #imgobj;
  #el_image;
  #asp;

  /**
   * @param {Object} imgobj - Objet image à afficher
   * @param {string} asp - Classe CSS à appliquer
   */
  constructor(imgobj, asp) {
    this.#imgobj = imgobj;
    this.#asp = asp;
    this.#el_image = cloneTemplate("photos").firstElementChild;

    // Configuration de l'élément image
    this.#el_image.setAttribute("src", this.#imgobj.src);
    this.#el_image.setAttribute("alt", this.#imgobj.an);
    this.#el_image.setAttribute("class", this.#asp);
    this.#el_image.dataset.an = this.#imgobj.an;
    this.#el_image.dataset.num = this.#imgobj.num;

    // Ajouter l'attribut seuil si nécessaire
    if (this.#imgobj.seuil !== "") {
      this.#el_image.dataset.seuil = this.#imgobj.seuil;
    }
  }

  /**
   * Retourne l'élément image créé
   * @return {HTMLElement}
   */
  get retourImage() {
    return this.#el_image;
  }
}

/**
 * Classe pour créer un élément de date
 * @class DateItem
 */
class DateItem {
  #dateObj;
  #dateElt;

  /**
   * @param {Object} dateObj - Objet contenant les informations de date
   */
  constructor(dateObj) {
    this.#dateObj = dateObj;
    this.#dateElt = cloneTemplate("liendate").firstElementChild;

    // Configuration de l'élément date
    this.#dateElt.dataset.an = this.#dateObj.an;
    this.#dateElt.dataset.num = this.#dateObj.num;
    this.#dateElt.textContent = this.#dateObj.an;

    // Ajouter l'attribut seuil si nécessaire
    if (this.#dateObj.seuil !== "") {
      this.#dateElt.dataset.seuil = this.#dateObj.an;
    }
  }

  /**
   * Retourne l'élément date créé
   * @return {HTMLElement}
   */
  get retourDateItem() {
    return this.#dateElt;
  }
}
