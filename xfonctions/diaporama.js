/* Module pour la gestion du diaporama */

export class DiaporamaManager {
  constructor(domElements, stats, audioManager, navigationManager) {
    this.domElements = domElements;
    this.stats = stats;
    this.audioManager = audioManager;
    this.navigationManager = navigationManager;
  }

  /* toggle lancer / arreter diapos et icone diapo */
  toggleDiapo(image) {
    if (
      this.stats.list_img.length - 1 >
      -this.stats.list_img[0].getBoundingClientRect().x / image.offsetWidth
    ) {
      this.domElements.diap.classList.toggle("diapo_on");
      if (!this.stats.nId && this.stats.zoome) {
        this.stats.nId = setInterval(() => {
          // Essayer de passer à l'image suivante
          const canContinue = this.navigationManager.depHor(image, 1);
          // Si on ne peut plus avancer (dernière image), arrêter le diaporama
          if (!canContinue) {
            this.clearMusic();
          }
        }, this.stats.delai);
        this.audioManager.audio.play();
      } else {
        this.clearMusic();
      }
    }
  }

  clearMusic() {
    clearInterval(this.stats.nId);
    this.stats.nId = null;
    this.audioManager.clearMusic();
    this.domElements.diap.classList.remove("diapo_on");
  }

  /* augmenter, diminuer le delai */
  delaiChange(del, sens) {
    if (!this.stats.zoome) return del;
    del === 4000 ? (del = 1000) : (del = del + 500 * sens);
    del = Math.max(1000, del);
    del = Math.min(4000, del);
    this.domElements.duree.textContent = `${del / 1000} sec`;
    return del;
  }

  /* gestion des diapo par icones */
  setupDiaporama(image) {
    const DIAPO_ACTIONS = {
      TOGGLE_DIAPO: 0,
      PLAY: 1,
      PAUSE: 2,
      SPEED_UP: 3,
    };

    this.domElements.diap.querySelectorAll("*").forEach((el, index) => {
      el.addEventListener("click", (e) => {
        switch (index) {
          case DIAPO_ACTIONS.TOGGLE_DIAPO:
            this.toggleDiapo(image);
            break;
          case DIAPO_ACTIONS.PLAY:
            if (this.stats.nId === null) break;
            this.audioManager.playPause(1);
            break;
          case DIAPO_ACTIONS.PAUSE:
            if (this.stats.nId === null) break;
            this.audioManager.playPause(0);
            break;
          case DIAPO_ACTIONS.SPEED_UP:
            this.stats.delai = this.delaiChange(this.stats.delai, +1);
            break;
        }
      });
    });
  }
}
