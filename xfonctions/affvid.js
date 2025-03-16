import { cloneTemplate } from "./dom.js";

/**
 * Définition d'un objet vidéo
 * @typedef {object} VideoItem
 * @property {string} ec - Format de l'écran (43 ou 169)
 * @property {string} id - Identifiant YouTube
 * @property {string} clas - Classes CSS associées
 * @property {string} text - Texte descriptif
 * @property {string} annee - Année de la vidéo
 */

/**
 * Gère l'affichage des vidéos et des miniatures YouTube
 * @class Affvid
 */
export class Affvid {
  /** @type {VideoItem[]} - Liste complète des vidéos */
  #vidlist = [];
  /** @type {VideoItem[]} - Vidéos filtrées selon les critères actuels */
  #vidSelect = [];
  /** @type {DocumentFragment} - Fragment pour les vidéos */
  #listElement;
  /** @type {DocumentFragment} - Fragment pour les barres */
  #listElem;
  /** @type {HTMLElement} - Conteneur pour les vidéos */
  #container;
  /** @type {string} - Classe CSS pour le filtrage */
  #classe = "";
  /** @type {HTMLElement} - Menu pour les barres */
  #menu;
  /** @type {VideoItem[]} - Liste triée des vidéos et diaporamas */
  #liste = [];
  /** @type {HTMLElement} - Liste des années */
  #ul_Years;
  /** @type {Set<string>} - Années disponibles */
  #an_Select;
  /** @type {DocumentFragment} - Fragment pour les éléments d'année */
  #li_Annee;
  /** @type {string} - Année sélectionnée */
  #an;
  /** @type {string} - ID de la vidéo sélectionnée */
  #vidId;
  /** @type {string} - ID du template à utiliser */
  #tempId;
  /** @type {HTMLElement} - Élément image de la vidéo */
  #vidImg;
  /** @type {VidItem} - Instance de VidItem */
  #video;
  /** @type {HTMLElement} - Élément iFrame de la vidéo */
  #imgVid;
  /** @type {BarItem} - Instance de BarItem */
  #barItem;

  // Dimensions et ratios
  /** @type {number} - Largeur du conteneur */
  #wl;
  /** @type {number} - Hauteur du conteneur */
  #wh;
  /** @type {number} - Ratio de l'image */
  #ratioI;
  /** @type {number} - Ratio du conteneur */
  #ratioW;
  /** @type {AnnItem} - Instance de AnnItem */
  #an_Item;

  /**
   * Initialise le gestionnaire de vidéos
   * @param {VideoItem[]} vidlist - Liste des objets vidéo
   */
  constructor(vidlist) {
    this.#vidlist = vidlist;
  }

  /**
   * Affiche les miniatures des vidéos dans le conteneur
   * @param {HTMLElement} container - Conteneur pour les vidéos
   * @param {string} classe - Classe CSS pour filtrer
   * @param {string} [an] - Année pour filtrer
   * @param {string} tempId - ID du template à utiliser
   */
  affVideos(container, classe, an, tempId) {
    if (!container || !(container instanceof HTMLElement)) {
      console.error("Le conteneur doit être un élément HTML valide");
      return;
    }

    this.#tempId = tempId || "ytThumb";
    this.#container = container;
    this.#classe = classe || "";
    this.#an = an;
    this.#listElement = new DocumentFragment();

    this.#filtrerVideos();
    this.#creerThumbnails();

    this.#container.append(this.#listElement);
  }

  /**
   * Filtre les vidéos selon la classe et/ou l'année
   * @private
   */
  #filtrerVideos() {
    if (this.#an) {
      /* Si on déselectionne video ou diapo dans onglet année */
      if (this.#classe.length > 4) {
        this.#classe = this.#classe.slice(0, 4);
      } else {
        this.#classe = "";
      }

      /* Filtre par année, classe et longueur d'ID (exclut les playlists) */
      this.#vidSelect = this.#vidlist
        .filter((obj) => obj.annee === this.#an)
        .filter((obj) => obj.clas.includes(this.#classe))
        .filter((obj) => obj.id.length < 12);
    } else {
      this.#vidSelect = this.#vidlist.filter((obj) =>
        obj.clas.includes(this.#classe)
      );
    }

    /* Trier par type: vidéos puis diaporamas */
    this.#liste = [
      ...this.#vidSelect.filter((item) => item.clas.includes(".vid")),
      ...this.#vidSelect.filter((item) => item.clas.includes(".dia")),
    ];
  }

  /**
   * Crée les miniatures pour chaque vidéo
   * @private
   */
  #creerThumbnails() {
    this.#liste.forEach((obj, index) => {
      this.#video = new VidItem(obj, this.#tempId);
      this.#vidImg = this.#video.retourItem.querySelector(".vidImg");

      // Configurer les dimensions
      const [largeur, hauteur] = this.#setDim(this.#container, obj);
      this.#vidImg.setAttribute("width", largeur);
      this.#vidImg.setAttribute("height", hauteur);

      // Ajouter l'index pour la navigation
      this.#video.retourItem.querySelector(".lect").dataset.num = index;
      this.#listElement.append(this.#video.retourItem);
    });
  }

  /**
   * Affiche une vidéo en mode lecture
   * @param {HTMLElement} container - Conteneur pour la vidéo
   * @param {string} vidId - ID de la vidéo YouTube
   */
  aff_ytFrameR(container, vidId) {
    if (!container || !vidId) return;

    this.#container = container;
    this.#vidId = vidId;
    this.#vidSelect = this.#vidlist.find((item) => item.id === this.#vidId);

    if (this.#vidSelect) {
      this.#video = new VidItem(this.#vidSelect, "ytFrameR");
      this.#imgVid = this.#video.retourItem.querySelector(".vidImg");

      // Configurer les dimensions
      const [largeur, hauteur] = this.#setDim(
        this.#container.parentElement,
        this.#vidSelect
      );
      this.#imgVid.setAttribute("width", largeur);
      this.#imgVid.setAttribute("height", hauteur);

      // Activer la lecture automatique
      this.#imgVid.src = this.#imgVid.src.replace("autoplay=0", "autoplay=1");

      this.#container.append(this.#video.retourItem);
    }
  }

  /**
   * Affiche la barre des vidéos sous le menu
   * @param {HTMLElement} menu - Élément menu pour les barres
   */
  affBar(menu) {
    if (!this.#liste.length || this.#liste.length <= 1) return;

    this.#menu = menu;
    this.#listElem = new DocumentFragment();

    this.#liste.forEach((obj, index) => {
      this.#barItem = new BarItem(obj);
      this.#barItem.retourBarItem.dataset.num = index;
      this.#listElem.append(this.#barItem.retourBarItem);
    });

    this.#menu.append(this.#listElem);
  }

  /**
   * Récupère la liste des vidéos sélectionnées
   * @return {VideoItem[]} Liste des vidéos sélectionnées
   */
  get retourVideo() {
    return this.#vidSelect;
  }

  /**
   * Affiche les années disponibles
   * @param {HTMLElement} ul_Years - Conteneur pour la liste des années
   */
  aff_ans(ul_Years) {
    if (!ul_Years) return;

    this.#ul_Years = ul_Years;
    this.#li_Annee = new DocumentFragment();

    // Ne conserver que les vidéos (exclure les playlists) et extraire les années uniques
    this.#an_Select = new Set(
      this.#vidlist.filter((obj) => obj.id.length < 12).map((it) => it.annee)
    );

    // Créer les éléments d'année
    this.#an_Select.forEach((annee) => {
      this.#an_Item = new AnnItem(annee);
      this.#li_Annee.append(this.#an_Item.retourAnnItem);
    });

    this.#ul_Years.append(this.#li_Annee);
  }

  /**
   * Calcule les dimensions optimales pour une vidéo
   * @param {HTMLElement} conteneur - Conteneur parent
   * @param {VideoItem} video - Objet vidéo
   * @return {[number, number]} Tableau [largeur, hauteur]
   * @private
   */
  #setDim(conteneur, video) {
    // Ajuster les marges
    const MARGE_LARGEUR = 5;
    const MARGE_HAUTEUR = 27;

    this.#wl = conteneur.clientWidth - MARGE_LARGEUR;
    this.#wh = conteneur.clientHeight - MARGE_HAUTEUR;

    // Définir le ratio de l'image selon le format (4:3 ou 16:9)
    this.#ratioI = video.ec === "43" ? 4 / 3 : 16 / 9;
    // Ratio du conteneur
    this.#ratioW = this.#wl / this.#wh;

    // Si le ratio du conteneur est plus grand que celui de l'image,
    // on ajuste la largeur en fonction de la hauteur, sinon l'inverse
    if (this.#ratioW > this.#ratioI) {
      return [Math.floor(this.#wh * this.#ratioI), this.#wh];
    } else {
      return [this.#wl, Math.floor(this.#wl / this.#ratioI)];
    }
  }
}

/**
 * Crée un élément miniature ou iframe de vidéo
 * @class VidItem
 */
class VidItem {
  /** @type {string} - ID du template à utiliser */
  #tempId;
  /** @type {VideoItem} - Objet vidéo */
  #vidItem;
  /** @type {HTMLElement} - Élément DOM créé */
  #vidElement;
  /** @type {string} - Classe de la vidéo (video/diapo) */
  #vidClass;
  /** @type {HTMLElement} - Élément titre */
  #vidTitre;
  /** @type {HTMLElement} - Élément vidéo/image */
  #video;

  /**
   * Crée un élément vidéo
   * @param {VideoItem} video - Objet vidéo
   * @param {string} tempId - ID du template à utiliser (ytThumb/ytFrame/ytFrameR)
   */
  constructor(video, tempId) {
    this.#vidItem = video;
    this.#tempId = tempId || "ytThumb";
    this.#vidElement = cloneTemplate(this.#tempId);

    this.#configurerTitre();
    this.#configurerVideo();
  }

  /**
   * Configure le titre de la vidéo si nécessaire
   * @private
   */
  #configurerTitre() {
    // Le titre n'est requis que pour les templates ytThumb et ytFrame
    if (this.#tempId !== "ytThumb" && this.#tempId !== "ytFrame") return;

    this.#vidTitre = this.#vidElement.querySelector(".vidTitre");

    // Déterminer si c'est une vidéo ou un diaporama
    this.#vidClass =
      this.#vidItem.clas.slice(0, 4) === ".vid" ? "video" : "diapo";

    // Formater le texte du titre
    const typeCapitalized =
      this.#vidClass.charAt(0).toUpperCase() + this.#vidClass.slice(1);
    this.#vidTitre.textContent = `${typeCapitalized} ${this.#vidItem.text}`;
    this.#vidTitre.classList.add(this.#vidClass);
  }

  /**
   * Configure l'élément vidéo ou thumbnail
   * @private
   */
  #configurerVideo() {
    this.#video = this.#vidElement.querySelector(".vidImg");
    this.#video.setAttribute("data-id", this.#vidItem.id);

    if (this.#tempId === "ytThumb") {
      // Pour les miniatures, on utilise l'image de prévisualisation
      this.#video.setAttribute(
        "src",
        `https://img.youtube.com/vi/${this.#vidItem.id}/maxresdefault.jpg`
      );
    } else {
      // Pour les iframes, on configure la source selon qu'il s'agisse d'une vidéo ou d'une playlist
      this.#video.setAttribute("title", this.#vidItem.text);

      const isPlaylist = this.#vidItem.id.length === 34;
      const baseUrl = "https://www.youtube-nocookie.com/embed/";
      const videoUrl = `${baseUrl}${this.#vidItem.id}?rel=0&autoplay=0`;
      const playlistUrl = `${baseUrl}videoseries?list=${
        this.#vidItem.id
      }&rel=0&autoplay=0`;

      this.#video.setAttribute("src", isPlaylist ? playlistUrl : videoUrl);
    }
  }

  /**
   * Récupère l'élément vidéo créé
   * @return {HTMLElement} Élément vidéo
   */
  get retourItem() {
    return this.#vidElement;
  }
}

/**
 * Crée un élément barre pour la navigation
 * @class BarItem
 */
class BarItem {
  /** @type {VideoItem} - Objet vidéo */
  #vidObj;
  /** @type {HTMLElement} - Élément barre créé */
  #barElement;

  /**
   * Crée un élément barre
   * @param {VideoItem} video - Objet vidéo
   */
  constructor(video) {
    this.#vidObj = video;
    this.#barElement = cloneTemplate("line").firstElementChild;

    // Configurer l'élément
    this.#barElement.textContent = this.#vidObj.text;
    this.#barElement.classList.add("ytItem");
    this.#barElement.classList.add(this.#vidObj.clas.slice(1, 4));
  }

  /**
   * Récupère l'élément barre créé
   * @return {HTMLElement} Élément barre
   */
  get retourBarItem() {
    return this.#barElement;
  }
}

/**
 * Crée un élément année pour la navigation
 * @class AnnItem
 */
class AnnItem {
  /** @type {string} - Année */
  #vidObj;
  /** @type {HTMLElement} - Élément année créé */
  #annElement;

  /**
   * Crée un élément année
   * @param {string} annee - Année à afficher
   */
  constructor(annee) {
    this.#vidObj = annee;
    this.#annElement = cloneTemplate("line").firstElementChild;

    // Configurer l'élément
    this.#annElement.textContent = this.#vidObj;
    this.#annElement.dataset.year = this.#vidObj;
    this.#annElement.dataset.select = ".ann";
  }

  /**
   * Récupère l'élément année créé
   * @return {HTMLElement} Élément année
   */
  get retourAnnItem() {
    return this.#annElement;
  }
}
