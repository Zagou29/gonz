import { cloneTemplate } from "./dom.js";

export class Affimg {
  #listimg; //liste des objets img venat de JSON
  #opt; // option 'photo' ou non
  #asp; //show ou show_mod
  #elt_images; //fragment où charger les img
  #elt_dates; //element ou charger les liensdates
  #ancre_imgs; //Boite où charger les images
  #ancres_dates; //Boite où charger les Li dates
  constructor(listimg, opt, asp) {
    this.#listimg = listimg;
    this.#opt = opt;
    this.#asp = asp;
    /* construire this.#elt_images */
    this.#elt_images = new DocumentFragment();
    let n = 0;
    let vseuil = "";
    this.#listimg[0].seuil = vseuil;
    if (this.#opt === "photo") {
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
      })
    } else {
      let ind = 0;
      this.#listimg.forEach((obj, index) => {
        if (obj.an !== vseuil) {
          obj.seuil = obj.an;
          //s'il y a moins de 2 seuil "" apres le précédent non vide , forcer seuil à "", sinon recaler ind sur l'index de cette ligne
          index - ind < 4 && index - ind > 0 ? (obj.seuil = "") : (ind = index);
        } else {
          obj.seuil = "";
        }
        obj.num = index;
        const image = new AffItem(obj, this.#asp);
        this.#elt_images.append(image.retourImage);
        vseuil = obj.an;
      });
    }
    /* construire this.#elt_dates */
    this.#elt_dates = new DocumentFragment();
    if (this.#opt === "photo") {
      this.#listimg.forEach((obj) => {
        const liendate = new DateItem(obj);
        if (obj.seuil !== "") this.#elt_dates.append(liendate.retourDateItem);
      });
    } else {
      this.#listimg.forEach((obj) => {
        const liendate = new DateItem(obj);
        this.#elt_dates.append(liendate.retourDateItem);
      });
    }
  }

  /* inclure dans les ancres adequates */
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
    if (this.#imgobj.seuil !== "")
      this.#el_image.dataset.seuil = this.#imgobj.seuil;
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
      this.#dateObj.seuil !== "" ? this.#dateObj.an : "";
  }

  get retourDateItem() {
    return this.#dateElt;
  }
}
