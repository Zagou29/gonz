const go_fullScreen = (elem) => {
  if (elem) {
    let not_fs =
      !document.fullscreenElement &&
      !document.mozFullScreen &&
      !document.webkitIsFullScreen &&
      !document.msFullscreenElement;
    if (not_fs) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else stop_fullScreen();
  }
};

const stop_fullScreen = () => {
  let fs =
    document.fullscreenElement ||
    document.mozFullScreen ||
    document.webkitIsFullScreen ||
    document.msFullscreenElement;
  if (fs) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }
};



export { go_fullScreen, stop_fullScreen };
