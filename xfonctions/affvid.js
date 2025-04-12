import { cloneTemplate } from "./dom.js";

/**
 * Constantes pour la configuration des vidéos
 */
const CONFIG = {
  TEMPLATES: {
    DEFAULT: "ytThumb",
    FRAME: "ytFrame",
    FRAME_READ: "ytFrameR",
  },
  CLASSES: {
    VIDEO: ".vid",
    DIAPO: ".dia",
  },
  TYPES: {
    VIDEO: "video",
    DIAPO: "diapo",
  },
  FORMATS: {
    FORMAT_4_3: "43",
    RATIO_4_3: 4 / 3,
    RATIO_16_9: 16 / 9,
  },
  DIMENSIONS: {
    MARGE_LARGEUR: 5,
    MARGE_HAUTEUR: 27,
  },
  MAX_ID_LENGTH: 12,
  PLAYLIST_ID_LENGTH: 34,
  YOUTUBE: {
    EMBED_BASE_URL: "https://www.youtube-nocookie.com/embed/",
    THUMB_BASE_URL: "https://img.youtube.com/vi/",
    THUMB_QUALITY: "maxresdefault.jpg",
  },
};

/**
 * Définition d'un objet vidéo
 * @typedef {object} VideoItem
 * @property {string} ec - Format de l'écran ('43' ou '169')
 * @property {string} id - Identifiant YouTube
 * @property {string} clas - Classes CSS associées
 * @property {string} text - Texte descriptif
 * @property {string} annee - Année de la vidéo
 */

/**
 * Gère l'affichage des vidéos et des miniatures YouTube
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
  // Dimensions et ratios
  /** @type {number} - Largeur du conteneur */
  #wl;
  /** @type {number} - Hauteur du conteneur */
  #wh;
  /** @type {number} - Ratio de l'image */
  #ratioI;
  /** @type {number} - Ratio du conteneur */
  #ratioW;
 

  /**
   * Initialise le gestionnaire de vidéos
   * @param {VideoItem[]} vidlist - Liste des objets vidéo
   * @throws {TypeError} Si vidlist n'est pas un tableau
   */
  constructor(vidlist) {
    if (!Array.isArray(vidlist)) {
      throw new TypeError("vidlist doit être un tableau d'objets VideoItem");
    }
    this.#vidlist = [...vidlist]; // Copie pour éviter des modifications externes
  }

  /**
   * Affiche les miniatures des vidéos dans le conteneur
   * @param {HTMLElement} container - Conteneur pour les vidéos
   * @param {string} [classe=''] - Classe CSS pour filtrer
   * @param {string} [an] - Année pour filtrer
   * @param {string} [tempId=CONFIG.TEMPLATES.DEFAULT] - ID du template à utiliser
   * @returns {Affvid} - Instance courante pour le chaînage
   * @throws {Error} Si le conteneur n'est pas valide
   */
  affVideos(container, classe = "", an, tempId = CONFIG.TEMPLATES.DEFAULT) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error("Le conteneur doit être un élément HTML valide");
    }

    this.#tempId = tempId;
    this.#container = container;
    this.#classe = classe;
    this.#an = an;
    this.#listElement = new DocumentFragment();

    this.#filtrerVideos();
    this.#creerThumbnails();

    this.#container.append(this.#listElement);
    return this;
  }

  /**
   * Filtre les vidéos selon la classe et/ou l'année
   * @private
   */
  #filtrerVideos() {
    if (this.#an) {
      // Si on déselectionne video ou diapo dans onglet année
      if (this.#classe.length > 4) {
        this.#classe = this.#classe.slice(0, 4);
      } else {
        this.#classe = "";
      }

      // Filtre par année, classe et longueur d'ID (exclut les playlists)
      this.#vidSelect = this.#vidlist
        .filter((obj) => obj.annee === this.#an)
        .filter((obj) => obj.clas.includes(this.#classe))
        .filter((obj) => obj.id.length < CONFIG.MAX_ID_LENGTH);
    } else {
      this.#vidSelect = this.#vidlist.filter((obj) =>
        obj.clas.includes(this.#classe)
      );
    }
    // Trier les vidéos et diaporamas
    this.#liste = this.#vidSelect.sort((a, b) => {
      const isVideoA = a.clas.includes(CONFIG.CLASSES.VIDEO);
      const isVideoB = b.clas.includes(CONFIG.CLASSES.VIDEO);
      return isVideoB - isVideoA; // Les vidéos avant les diaporamas
    });
  }
  /**
   * Crée les miniatures pour chaque vidéo
   * @private
   */
  #creerThumbnails() {
    this.#liste.forEach((obj, index) => {
      const video = new VidItem(obj, this.#tempId);
      const videoElement = video.retourItem;
      const vidImg = videoElement.querySelector(".vidImg");

      // Configurer les dimensions
      const [largeur, hauteur] = this.#setDim(this.#container, obj);
      vidImg.setAttribute("width", largeur);
      vidImg.setAttribute("height", hauteur);

      // Ajouter l'index pour la navigation
      videoElement.querySelector(".lect").dataset.num = index;
      this.#listElement.append(videoElement);
    });
  }

  /**
   * Affiche une vidéo en mode lecture
   * @param {HTMLElement} container - Conteneur pour la vidéo
   * @param {string} vidId - ID de la vidéo YouTube
   * @returns {Affvid} - Instance courante pour le chaînage
   * @throws {Error} Si le conteneur n'est pas valide ou l'ID est manquant
   */
  aff_ytFrameR(container, vidId) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error("Le conteneur doit être un élément HTML valide");
    }
    if (!vidId) {
      throw new Error("L'ID de la vidéo est requis");
    }

    this.#container = container;
    this.#vidId = vidId;
    const videoItem = this.#vidlist.find((item) => item.id === this.#vidId);

    if (!videoItem) {
      throw new Error(`Aucune vidéo trouvée avec l'ID: ${vidId}`);
    }

    const video = new VidItem(videoItem, CONFIG.TEMPLATES.FRAME_READ);
    const videoElement = video.retourItem;
    const iframe = videoElement.querySelector(".vidImg");

    // Configurer les dimensions
    const [largeur, hauteur] = this.#setDim(
      this.#container.parentElement,
      videoItem
    );
    iframe.setAttribute("width", largeur);
    iframe.setAttribute("height", hauteur);

    // Activer la lecture automatique
    if (iframe.src) {
      iframe.src = iframe.src.replace("autoplay=0", "autoplay=1");
    }

    this.#container.append(videoElement);
    return this;
  }

  /**
   * Affiche la barre des vidéos sous le menu
   * @param {HTMLElement} menu - Élément menu pour les barres
   * @returns {Affvid} - Instance courante pour le chaînage
   * @throws {Error} Si le menu n'est pas valide
   */
  affBar(menu) {
    if (!menu || !(menu instanceof HTMLElement)) {
      throw new Error("Le menu doit être un élément HTML valide");
    }

    if (!this.#liste.length || this.#liste.length <= 1) {
      return this;
    }

    this.#menu = menu;
    this.#listElem = new DocumentFragment();

    this.#liste.forEach((obj, index) => {
      const barItem = new BarItem(obj);
      barItem.retourBarItem.dataset.num = index;
      this.#listElem.append(barItem.retourBarItem);
    });

    this.#menu.append(this.#listElem);
    return this;
  }

  /**
   * Récupère la liste des vidéos sélectionnées
   * @returns {VideoItem[]} Liste des vidéos sélectionnées
   */
  get retourVideo() {
    return [...this.#vidSelect]; // Retourne une copie pour éviter des modifications externes
  }

  /**
   * Affiche les années disponibles
   * @param {HTMLElement} ul_Years - Conteneur pour la liste des années
   * @returns {Affvid} - Instance courante pour le chaînage
   * @throws {Error} Si le conteneur n'est pas valide
   */
  aff_ans(ul_Years) {
    if (!ul_Years || !(ul_Years instanceof HTMLElement)) {
      throw new Error("Le conteneur doit être un élément HTML valide");
    }

    this.#ul_Years = ul_Years;
    this.#li_Annee = new DocumentFragment();

    // Ne conserver que les vidéos (exclure les playlists) et extraire les années uniques
    this.#an_Select = new Set(
      this.#vidlist
        .filter((obj) => obj.id.length < CONFIG.MAX_ID_LENGTH)
        .map((it) => it.annee)
    );

    // Créer les éléments d'année
    this.#an_Select.forEach((annee) => {
      const anItem = new AnnItem(annee);
      this.#li_Annee.append(anItem.retourAnnItem);
    });

    this.#ul_Years.append(this.#li_Annee);
    return this;
  }

  /**
   * Calcule les dimensions optimales pour une vidéo
   * @param {HTMLElement} conteneur - Conteneur parent
   * @param {VideoItem} video - Objet vidéo
   * @returns {[number, number]} Tableau [largeur, hauteur]
   * @private
   */
  #setDim(conteneur, video) {
    if (!conteneur || !video) {
      return [0, 0]; // Valeurs par défaut en cas d'erreur
    }

    // Récupérer les dimensions du conteneur avec marges
    this.#wl = conteneur.clientWidth - CONFIG.DIMENSIONS.MARGE_LARGEUR;
    this.#wh = conteneur.clientHeight - CONFIG.DIMENSIONS.MARGE_HAUTEUR;

    // Définir le ratio de l'image selon le format (4:3 ou 16:9)
    this.#ratioI =
      video.ec === CONFIG.FORMATS.FORMAT_4_3
        ? CONFIG.FORMATS.RATIO_4_3
        : CONFIG.FORMATS.RATIO_16_9;

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
   * @param {string} [tempId=CONFIG.TEMPLATES.DEFAULT] - ID du template à utiliser
   * @throws {Error} Si les paramètres ne sont pas valides
   */
  constructor(video, tempId = CONFIG.TEMPLATES.DEFAULT) {
    if (!video || typeof video !== "object") {
      throw new Error("L'objet vidéo est requis");
    }

    this.#vidItem = video;
    this.#tempId = tempId;

    const element = cloneTemplate(this.#tempId);
    if (!element) {
      throw new Error(`Template non trouvé: ${this.#tempId}`);
    }

    this.#vidElement = element;

    this.#configurerTitre();
    this.#configurerVideo();
  }

  /**
   * Configure le titre de la vidéo si nécessaire
   * @private
   */
  #configurerTitre() {
    // Le titre n'est requis que pour les templates ytThumb et ytFrame
    if (
      this.#tempId !== CONFIG.TEMPLATES.DEFAULT &&
      this.#tempId !== CONFIG.TEMPLATES.FRAME
    ) {
      return;
    }

    this.#vidTitre = this.#vidElement.querySelector(".vidTitre");
    if (!this.#vidTitre) {
      return;
    }

    // Déterminer si c'est une vidéo ou un diaporama
    this.#vidClass =
      this.#vidItem.clas.slice(0, 4) === CONFIG.CLASSES.VIDEO
        ? CONFIG.TYPES.VIDEO
        : CONFIG.TYPES.DIAPO;

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
    if (!this.#video) {
      return;
    }

    this.#video.setAttribute("data-id", this.#vidItem.id);

    if (this.#tempId === CONFIG.TEMPLATES.DEFAULT) {
      // Pour les miniatures, on utilise l'image de prévisualisation
      this.#video.setAttribute(
        "src",
        `${CONFIG.YOUTUBE.THUMB_BASE_URL}${this.#vidItem.id}/${
          CONFIG.YOUTUBE.THUMB_QUALITY
        }`
      );
    } else {
      // Pour les iframes, on configure la source selon qu'il s'agisse d'une vidéo ou d'une playlist
      this.#video.setAttribute("title", this.#vidItem.text);

      const isPlaylist = this.#vidItem.id.length === CONFIG.PLAYLIST_ID_LENGTH;
      const baseUrl = CONFIG.YOUTUBE.EMBED_BASE_URL;
      const videoUrl = `${baseUrl}${this.#vidItem.id}?rel=0&autoplay=0`;
      const playlistUrl = `${baseUrl}videoseries?list=${
        this.#vidItem.id
      }&rel=0&autoplay=0`;

      this.#video.setAttribute("src", isPlaylist ? playlistUrl : videoUrl);
    }
  }

  /**
   * Récupère l'élément vidéo créé
   * @returns {HTMLElement} Élément vidéo
   */
  get retourItem() {
    return this.#vidElement;
  }
}

/**
 * Crée un élément barre pour la navigation
 */
class BarItem {
  /** @type {VideoItem} - Objet vidéo */
  #vidObj;
  /** @type {HTMLElement} - Élément barre créé */
  #barElement;

  /**
   * Crée un élément barre
   * @param {VideoItem} video - Objet vidéo
   * @throws {Error} Si l'objet vidéo n'est pas valide
   */
  constructor(video) {
    if (!video || typeof video !== "object") {
      throw new Error("L'objet vidéo est requis");
    }

    this.#vidObj = video;

    const element = cloneTemplate("line");
    if (!element || !element.firstElementChild) {
      throw new Error('Template "line" non trouvé');
    }

    this.#barElement = element.firstElementChild;

    // Configurer l'élément
    this.#barElement.textContent = this.#vidObj.text;
    this.#barElement.classList.add("ytItem");

    // Ajouter la classe spécifique au type (vid/dia)
    const typeClass = this.#vidObj.clas.slice(1, 4);
    if (typeClass) {
      this.#barElement.classList.add(typeClass);
    }
  }

  /**
   * Récupère l'élément barre créé
   * @returns {HTMLElement} Élément barre
   */
  get retourBarItem() {
    return this.#barElement;
  }
}

/**
 * Crée un élément année pour la navigation
 */
class AnnItem {
  /** @type {string} - Année */
  #vidObj;
  /** @type {HTMLElement} - Élément année créé */
  #annElement;

  /**
   * Crée un élément année
   * @param {string} annee - Année à afficher
   * @throws {Error} Si l'année n'est pas valide
   */
  constructor(annee) {
    if (!annee || typeof annee !== "string") {
      throw new Error("L'année doit être une chaîne de caractères valide");
    }

    this.#vidObj = annee;

    const element = cloneTemplate("line");
    if (!element || !element.firstElementChild) {
      throw new Error('Template "line" non trouvé');
    }

    this.#annElement = element.firstElementChild;

    // Configurer l'élément
    this.#annElement.textContent = this.#vidObj;
    this.#annElement.dataset.year = this.#vidObj;
    this.#annElement.dataset.select = ".ann";
  }

  /**
   * Récupère l'élément année créé
   * @returns {HTMLElement} Élément année
   */
  get retourAnnItem() {
    return this.#annElement;
  }
}
