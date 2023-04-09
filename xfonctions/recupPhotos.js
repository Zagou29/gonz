import { fetchJSON } from "./api.js";
const listImages = await fetchJSON("./xjson/photoImg.json");
const jsonObj = {};
const jsonFile = [];

listImages.forEach((img) => {
  jsonObj.class = img.class;
  jsonObj.src = img.src;
  jsonObj.an = img.an;
  jsonObj.numb = img.numb * 10;
  jsonFile.push({
    class: jsonObj.class,
    src: jsonObj.src,
    an: jsonObj.an,
    numb: jsonObj.numb,
  });
});
console.log(JSON.stringify(jsonFile));
