const relat = [...document.querySelectorAll(".relat")];
const jsonObj ={};
const jsonFile = [];
relat.forEach((box) => {
  jsonObj.href = box.querySelector("a")?.getAttribute("href")
    ? box.querySelector("a")?.getAttribute("href")
    : "";
  jsonObj.src = box.querySelector("img")?.getAttribute("src");
  jsonObj.ph = box?.dataset.ph ? box?.dataset.ph : "";
  jsonObj.spText = box.querySelector(".ti_blog")?.textContent
    ? box.querySelector(".ti_blog")?.textContent.trim()
    : "";
  jsonObj.divText = box.querySelector(".texte")?.textContent
    ? box.querySelector(".texte")?.textContent.trim()
    : "";
  jsonObj.menu = box?.dataset.ph ? "ph" : "bl";
  jsonFile.push({
    menu:jsonObj.menu,
    ph: jsonObj.ph,
    href: jsonObj.href,
    src: jsonObj.src,
    spText: jsonObj.spText,
    divText: jsonObj.divText,
  });
});
console.log(JSON.stringify(jsonFile));
