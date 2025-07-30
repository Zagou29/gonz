import { VIDEO_CONFIG } from "../config/video-config.js";

/**
 * Utilitaires pour le calcul des dimensions des vidéos
 */
export class DimensionCalculator {
  /**
   * Calcule les dimensions optimales pour une vidéo
   * @param {HTMLElement} conteneur - Conteneur parent
   * @param {VideoItem} video - Objet vidéo
   * @returns {[number, number]} Tableau [largeur, hauteur]
   */
  static calculateDimensions(conteneur, video) {
    if (!conteneur || !video) {
      return [0, 0]; // Valeurs par défaut en cas d'erreur
    }

    const dimensions = this.#getContainerDimensions(conteneur);
    const ratioImage = this.#getImageRatio(video);

    return this.#calculateOptimalDimensions(dimensions, ratioImage);
  }

  /**
   * Récupère les dimensions du conteneur avec marges
   * @param {HTMLElement} conteneur - Conteneur parent
   * @returns {{width: number, height: number}} Dimensions du conteneur
   * @private
   */
  static #getContainerDimensions(conteneur) {
    return {
      width: conteneur.clientWidth - VIDEO_CONFIG.DIMENSIONS.MARGE_LARGEUR,
      height: conteneur.clientHeight - VIDEO_CONFIG.DIMENSIONS.MARGE_HAUTEUR,
    };
  }

  /**
   * Détermine le ratio de l'image selon le format
   * @param {VideoItem} video - Objet vidéo
   * @returns {number} Ratio de l'image
   * @private
   */
  static #getImageRatio(video) {
    return video.ec === VIDEO_CONFIG.FORMATS.FORMAT_4_3
      ? VIDEO_CONFIG.FORMATS.RATIO_4_3
      : VIDEO_CONFIG.FORMATS.RATIO_16_9;
  }

  /**
   * Calcule les dimensions optimales selon le ratio
   * @param {{width: number, height: number}} dimensions - Dimensions du conteneur
   * @param {number} ratioImage - Ratio de l'image
   * @returns {[number, number]} Dimensions optimales [largeur, hauteur]
   * @private
   */
  static #calculateOptimalDimensions(dimensions, ratioImage) {
    const ratioContainer = dimensions.width / dimensions.height;

    if (ratioContainer > ratioImage) {
      return [Math.floor(dimensions.height * ratioImage), dimensions.height];
    } else {
      return [dimensions.width, Math.floor(dimensions.width / ratioImage)];
    }
  }
}
