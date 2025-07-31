/* Module pour la gestion de l'audio */

export class AudioManager {
  constructor(domElements) {
    this.domElements = domElements;
    this.audio = null;
    this.init();
  }

  init() {
    const rnd = (max) => Math.floor(Math.random() * max) + 1;
    this.audio = new Audio(`./audio/audio_${rnd(11)}.mp3`);
    // Gestion propre de la boucle
    this.audio.addEventListener("ended", () => {
      this.audio.currentTime = 0;
      this.audio.play();
    });
  }

  playPause(sens) {
    const shouldPlay = sens === 1;
    this.audio[shouldPlay ? "play" : "pause"]();
    this.domElements.mute.classList.toggle("eff_fl", shouldPlay);
    this.domElements.son.classList.toggle("eff_fl", !shouldPlay);
    return sens;
  }

  clearMusic() {
    this.audio.currentTime = 0;
    this.audio.pause();
    this.domElements.mute.classList.add("eff_fl");
    this.domElements.son.classList.remove("eff_fl");
  }

  toggleSon(sens) {
    return sens === 1 ? this.playPause(0) : this.playPause(1);
  }
}
