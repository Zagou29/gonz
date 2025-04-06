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

  if (fsAPI.element()) {
    return stop_fullScreen();
  } else {
    return fsAPI.request(elem).catch((error) => {
      console.error("Erreur lors du passage en plein écran:", error);
      throw error;
    });
  }
};

export { toggle_fullScreen, stop_fullScreen };
