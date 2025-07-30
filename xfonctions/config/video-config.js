/**
 * Configuration des vidéos YouTube
 */
export const VIDEO_CONFIG = {
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
