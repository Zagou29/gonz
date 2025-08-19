/* Module pour la gestion de la navigation et du zoom */

export class NavigationManager {
  constructor(domElements, stats) {
    this.domElements = domElements;
    this.stats = stats;
  }

  /* deplacement relatif horiz des images */
  depHor(box, sens) {
    const currentScrollLeft = box.scrollLeft;
    const maxScrollLeft = box.scrollWidth - box.offsetWidth;

    // Vérifier si on peut encore faire défiler
    if (sens > 0 && currentScrollLeft >= maxScrollLeft) {
      return false; // On est déjà à la fin, impossible d'aller plus loin
    }
    if (sens < 0 && currentScrollLeft <= 0) {
      return false; // On est déjà au début, impossible d'aller plus loin
    }

    // Utiliser scrollTo avec position absolue pour éviter les problèmes de double scroll sur iPadOS
    const currentPosition = box.scrollLeft;
    const imageWidth =
      this.stats.list_img && this.stats.list_img[0]
        ? this.stats.list_img[0].offsetWidth
        : box.offsetWidth;
    const newPosition = currentPosition + imageWidth * sens;

    // S'assurer que la nouvelle position est dans les limites
    const clampedPosition = Math.max(0, Math.min(newPosition, maxScrollLeft));

    box.scrollTo({
      left: clampedPosition,
      behavior: "instant",
    });

    this.stats.k++;
    return true; // Déplacement effectué avec succès
  }

  /* deplacement relatif vertical des images */
  depVert(sens) {
    window.scrollBy({
      top: this.stats.list_img[0].getBoundingClientRect().height * sens,
      behavior: "instant",
    });
  }

  /* positionner l'image à la position récupérée */
  positImage(pos) {
    window.scrollTo({
      top: pos,
      behavior: "instant",
    });
  }

  /* si condition= true on est au debut ou à la fin */
  toggleStop(condition, el_stop, el_fl) {
    el_stop.classList.toggle("eff_fl", !condition);
    el_fl.classList.toggle("eff_fl", condition);
  }

  /* montre l'icone stop debut ou l'icone stop fin ou efface */
  showStop() {
    this.toggleStop(
      this.domElements.boiteImg.scrollLeft === 0,
      this.domElements.stop_debut,
      this.domElements.left
    );
    this.toggleStop(
      this.domElements.boiteImg.scrollLeft ===
        this.domElements.boiteImg.scrollWidth -
          this.domElements.boiteImg.offsetWidth,
      this.domElements.stop_fin,
      this.domElements.right
    );
  }

  /* afficher les années dans box-années et dans le titre année */
  afficheDate(entries) {
    entries.forEach((ent) => {
      const dataNum = ent.target.dataset.num;
      const dateElement = this.domElements.cont.querySelector(
        `[data-num="${dataNum}"]`
      );
      if (!dateElement) return;

      dateElement.classList.toggle("show-an", ent.isIntersecting);

      if (ent.isIntersecting) {
        this.domElements.aff_an.textContent = ent.target.dataset.an;
      }
    });
  }

  /*  fonction pour placer l'image verticalement selon l'année*/
  scrollImg(e) {
    window.scrollTo({
      top: this.stats.list_img[e.target.dataset.num].offsetTop,
      behavior: "instant",
    });
    this.domElements.aff_an.textContent =
      this.stats.list_img[e.target.dataset.num].dataset.an;
  }
}
