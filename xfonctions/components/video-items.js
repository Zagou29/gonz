import { cloneTemplate } from "../dom.js";
import { VIDEO_CONFIG } from "../config/video-config.js";

/**
 * Crée un élément miniature ou iframe de vidéo
 */
export class VidItem {
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
   * @param {string} [tempId=VIDEO_CONFIG.TEMPLATES.DEFAULT] - ID du template à utiliser
   * @throws {Error} Si les paramètres ne sont pas valides
   */
  constructor(video, tempId = VIDEO_CONFIG.TEMPLATES.DEFAULT) {
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
      this.#tempId !== VIDEO_CONFIG.TEMPLATES.DEFAULT &&
      this.#tempId !== VIDEO_CONFIG.TEMPLATES.FRAME
    ) {
      return;
    }

    this.#vidTitre = this.#vidElement.querySelector(".vidTitre");
    if (!this.#vidTitre) {
      return;
    }

    // Déterminer si c'est une vidéo ou un diaporama
    this.#vidClass =
      this.#vidItem.clas.slice(0, 4) === VIDEO_CONFIG.CLASSES.VIDEO
        ? VIDEO_CONFIG.TYPES.VIDEO
        : VIDEO_CONFIG.TYPES.DIAPO;

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

    if (this.#tempId === VIDEO_CONFIG.TEMPLATES.DEFAULT) {
      // Pour les miniatures, on utilise l'image de prévisualisation
      this.#video.setAttribute(
        "src",
        `${VIDEO_CONFIG.YOUTUBE.THUMB_BASE_URL}${this.#vidItem.id}/${
          VIDEO_CONFIG.YOUTUBE.THUMB_QUALITY
        }`
      );
    } else {
      // Pour les iframes, on configure la source selon qu'il s'agisse d'une vidéo ou d'une playlist
      this.#video.setAttribute("title", this.#vidItem.text);

      const isPlaylist =
        this.#vidItem.id.length === VIDEO_CONFIG.PLAYLIST_ID_LENGTH;
      const baseUrl = VIDEO_CONFIG.YOUTUBE.EMBED_BASE_URL;
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
export class BarItem {
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
export class AnnItem {
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
