import { fetchJSON } from "./api.js";
const listImages = await fetchJSON("./xjson/indexVid.json");
const jsonObj = {};
const jsonFile = [];

listImages.forEach((img) => {
  jsonObj.class = img.class;
  jsonObj.ec = img.ec;
  jsonObj.an = img.annee;
  jsonObj.text = img.text;
  jsonObj.id = img.id;
  jsonFile.push({
    class: jsonObj.class,
    an: jsonObj.an,
    text: jsonObj.text,
   
  });
});
console.log(jsonFile);
