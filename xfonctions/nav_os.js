/* OS? */

/* Win Mac Linux Android like Mac */
const ordiOS = {
  win: navigator.userAgent.indexOf("Win") > 0,
  mac: navigator.userAgent.indexOf("Mac") > 0,
  linux: navigator.userAgent.indexOf("Linux")>0,
  android: navigator.userAgent.indexOf("Android")>0,
  ios: navigator.userAgent.indexOf("like Mac")>0,
  /*  */
};
const mobile = {
  mob: navigator.userAgent.toLowerCase().indexOf("mobi")>0,
};
const navigateur = {
  edge: navigator.userAgent.toLowerCase().indexOf("edg")>0,
  opera: navigator.userAgent.toLowerCase().indexOf("opr")>0,
  chrome: navigator.userAgent.toLowerCase().indexOf("chrome")>0,
  chromeIos:navigator.userAgent.toLowerCase().indexOf("crios")>0,
  ie: navigator.userAgent.toLowerCase().indexOf("trident")>0,
  firefox: navigator.userAgent.toLowerCase().indexOf("firefox")>0,
  safari: navigator.userAgent.toLowerCase().indexOf("safari")>0 && navigator.userAgent.toLowerCase().indexOf("chrome")<0,
};
const ordi_OS = () => ordiOS;
const navig = () => navigateur;
const mob = () => mobile;
export { ordi_OS, navig, mob };
