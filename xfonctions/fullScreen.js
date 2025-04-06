/**
 * Module de gestion du mode plein écran avec support multi-navigateurs
 * Utilise des promesses et une API standardisée lorsque possible
 */

// Détermine les préfixes du navigateur pour les API fullscreen
const fsAPI = (() => {
  const doc = document;
  return {
    // Vérification de l'état plein écran
    element: () =>
      doc.fullscreenElement ||
      doc.mozFullScreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement,

    // Méthodes de requête de plein écran
    request: (elem) => {
      if (elem.requestFullscreen) return elem.requestFullscreen();
      if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen();
      if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen();
      if (elem.msRequestFullscreen) return elem.msRequestFullscreen();
      return Promise.reject(new Error("Fullscreen API not available"));
    },

    // Méthodes de sortie du plein écran
    exit: () => {
      if (doc.exitFullscreen) return doc.exitFullscreen();
      if (doc.mozCancelFullScreen) return doc.mozCancelFullScreen();
      if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
      if (doc.msExitFullscreen) return doc.msExitFullscreen();
      return Promise.reject(new Error("Fullscreen API not available"));
    },

    // Détermine si l'API plein écran est disponible
    isSupported: () =>
      Boolean(
        doc.fullscreenEnabled ||
          doc.mozFullScreenEnabled ||
          doc.webkitFullscreenEnabled ||
          doc.msFullscreenEnabled
      ),

    // Événements de changement d'état
    changeEvent:
      "fullscreenchange" in doc
        ? "fullscreenchange"
        : "mozfullscreenchange" in doc
        ? "mozfullscreenchange"
        : "webkitfullscreenchange" in doc
        ? "webkitfullscreenchange"
        : "MSFullscreenChange" in doc
        ? "MSFullscreenChange"
        : null,

    // Événements d'erreur
    errorEvent:
      "fullscreenerror" in doc
        ? "fullscreenerror"
        : "mozfullscreenerror" in doc
        ? "mozfullscreenerror"
        : "webkitfullscreenerror" in doc
        ? "webkitfullscreenerror"
        : "MSFullscreenError" in doc
        ? "MSFullscreenError"
        : null,
  };
})();

/**
 * Active le mode plein écran pour un élément
 * @param {HTMLElement} elem - Élément à mettre en plein écran
 * @returns {Promise} - Promesse résolue quand le plein écran est activé
 */
const go_fullScreen = (elem) => {
  if (!elem) {
    return Promise.reject(new Error("Aucun élément fourni"));
  }

  if (!fsAPI.isSupported()) {
    return Promise.reject(new Error("API plein écran non supportée"));
  }

  if (fsAPI.element()) {
    return stop_fullScreen();
  }

  return fsAPI.request(elem).catch((error) => {
    console.error("Erreur lors du passage en plein écran:", error);
    throw error;
  });
};

/**
 * Quitte le mode plein écran
 * @returns {Promise} - Promesse résolue quand le plein écran est désactivé
 */
const stop_fullScreen = () => {
  if (!fsAPI.element()) {
    return Promise.resolve(); // Déjà hors plein écran
  }

  return fsAPI.exit().catch((error) => {
    console.error("Erreur lors de la sortie du plein écran:", error);
    throw error;
  });
};

/**
 * Bascule l'état plein écran d'un élément
 * @param {HTMLElement} elem - Élément à mettre en plein écran
 * @returns {Promise} - Promesse résolue après le changement d'état
 */
const toggle_fullScreen = (elem) => {
  if (!elem) {
    return Promise.reject(new Error("Aucun élément fourni"));
  }

  return fsAPI.element() ? stop_fullScreen() : go_fullScreen(elem);
};

/**
 * Vérifie si le mode plein écran est actuellement actif
 * @returns {Boolean} true si en mode plein écran
 */
const is_fullScreen = () => Boolean(fsAPI.element());

/**
 * Vérifie si l'API plein écran est supportée par le navigateur
 * @returns {Boolean} true si l'API est supportée
 */
const is_fullScreenSupported = () => fsAPI.isSupported();

/**
 * Ajoute un écouteur pour les changements d'état plein écran
 * @param {Function} callback - Fonction à appeler lors du changement
 */
const on_fullScreenChange = (callback) => {
  if (fsAPI.changeEvent && typeof callback === "function") {
    document.addEventListener(fsAPI.changeEvent, callback);
  }
};

/**
 * Supprime un écouteur pour les changements d'état plein écran
 * @param {Function} callback - Fonction à supprimer
 */
const off_fullScreenChange = (callback) => {
  if (fsAPI.changeEvent && typeof callback === "function") {
    document.removeEventListener(fsAPI.changeEvent, callback);
  }
};

export {
  go_fullScreen,
  stop_fullScreen,
  toggle_fullScreen,
  is_fullScreen,
  is_fullScreenSupported,
  on_fullScreenChange,
  off_fullScreenChange,
};
