import { VIDEO_CONFIG } from "./config/video-config.js";
import { VidItem, BarItem, AnnItem } from "./components/video-items.js";
import { DimensionCalculator } from "./utils/dimension-calculator.js";

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

  /**
   * Initialise le gestionnaire de vidéos
   * @param {ideoItem[]} vidlist - Liste des objets vidéo
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
   * @param {string} [tempId=VIDEO_CONFIG.TEMPLATES.DEFAULT] - ID du template à utiliser
   * @returns {Affvid} - Instance courante pour le chaînage
   * @throws {Error} Si le conteneur n'est pas valide
   */
  affVideos(
    container,
    classe = "",
    an,
    tempId = VIDEO_CONFIG.TEMPLATES.DEFAULT
  ) {
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
        .filter((obj) => obj.id.length < VIDEO_CONFIG.MAX_ID_LENGTH);
    } else {
      this.#vidSelect = this.#vidlist.filter((obj) =>
        obj.clas.includes(this.#classe)
      );
    }
    // Trier les vidéos et diaporamas
    this.#liste = this.#vidSelect.sort((a, b) => {
      const isVideoA = a.clas.includes(VIDEO_CONFIG.CLASSES.VIDEO);
      const isVideoB = b.clas.includes(VIDEO_CONFIG.CLASSES.VIDEO);
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
      const [largeur, hauteur] = DimensionCalculator.calculateDimensions(
        this.#container,
        obj
      );
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

    const video = new VidItem(videoItem, VIDEO_CONFIG.TEMPLATES.FRAME_READ);
    const videoElement = video.retourItem;
    const iframe = videoElement.querySelector(".vidImg");

    // Configurer les dimensions
    const [largeur, hauteur] = DimensionCalculator.calculateDimensions(
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
        .filter((obj) => obj.id.length < VIDEO_CONFIG.MAX_ID_LENGTH)
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
}
