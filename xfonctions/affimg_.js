import { cloneTemplate } from "./dom.js";
// fichier simplifié mais moins precis
export class Affimg {
  #listimg; // Liste des objets img venant de JSON
  #opt; // Option 'photo' ou non
  #asp; // 'show' ou 'show_mod'
  #elt_images; // Fragment où charger les img
  #elt_dates; // Élément où charger les liens dates
  #ancre_imgs; // Boîte où charger les images
  #ancres_dates; // Boîte où charger les Li dates

  constructor(listimg, opt, asp) {
    this.#listimg = listimg;
    this.#opt = opt;
    this.#asp = asp;

    // Construire this.#elt_images
    this.#elt_images = new DocumentFragment();
    let n = 0;
    let vseuil = "";
    this.#listimg[0].seuil = vseuil;

    this.#listimg.forEach((obj, index) => {
      //si an different du seuil precedent, num = index et seuil = an
      if (obj.an !== vseuil) {
        obj.seuil = obj.an;
        obj.num = index;
        n = index;
      } else {
        //sino garder le meme num et seuil= ""
        obj.num = n;
        obj.seuil = "";
      }
      const image = new AffItem(obj, this.#asp);
      this.#elt_images.append(image.retourImage);
      // this.#elt_images.dataset.no = index;
      vseuil = obj.an;
    });
    // Construire this.#elt_dates
    this.#elt_dates = new DocumentFragment();
    this.#listimg.forEach((obj) => {
      const liendate = new DateItem(obj);
      if (this.#opt !== "photo" || obj.seuil !== "") {
        //toutes les img si pas "photo", sinon seul les seuils non nuls
        this.#elt_dates.append(liendate.retourDateItem);
      }
    });
  }

  // Inclure dans les ancres adéquates
  creeimages(ancre_imgs) {
    this.#ancre_imgs = ancre_imgs;
    this.#ancre_imgs.append(this.#elt_images);
  }

  creedates(ancres_dates) {
    this.#ancres_dates = ancres_dates;
    this.#ancres_dates.append(this.#elt_dates);
  }
}

class AffItem {
  #imgobj;
  #el_image;
  #asp;

  constructor(imgobj, asp) {
    this.#imgobj = imgobj;
    this.#asp = asp;
    this.#el_image = cloneTemplate("photos").firstElementChild;
    this.#el_image.setAttribute("src", this.#imgobj.src);
    this.#el_image.setAttribute("alt", this.#imgobj.an);
    this.#el_image.setAttribute("class", this.#asp);
    this.#el_image.dataset.an = this.#imgobj.an;
    this.#el_image.dataset.num = this.#imgobj.num;
    if (this.#imgobj.seuil !== "") {
      this.#el_image.dataset.seuil = this.#imgobj.seuil;
    }
  }

  get retourImage() {
    return this.#el_image;
  }
}

class DateItem {
  #dateObj;
  #dateElt;

  constructor(dateObj) {
    this.#dateObj = dateObj;
    this.#dateElt = cloneTemplate("liendate").firstElementChild;
    this.#dateElt.dataset.an = this.#dateObj.an;
    this.#dateElt.dataset.num = this.#dateObj.num;
    this.#dateElt.textContent = this.#dateObj.an;
    this.#dateElt.dataset.seuil =
      this.#dateObj.seuil !== "" ? this.#dateObj.an : ""
  }

  get retourDateItem() {
    return this.#dateElt;
  }
}
