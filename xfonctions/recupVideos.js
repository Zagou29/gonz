import { fetchJSON } from "./api.js";
const listImages = await fetchJSON("./xjson/indexVid.json");
const jsonObj = {};
const jsonFile = [];
listImages.filter((img) => img.clas.includes(".fam.")).forEach((img) => {
  jsonObj.class = img.clas;
  jsonObj.ec = img.ec;
  jsonObj.an = img.annee;
  jsonObj.text = img.text;
  jsonObj.id = img.id;
  jsonFile.push({
    class: jsonObj.class,
    an: jsonObj.an,
    id: jsonObj.id,
    text: jsonObj.text,
   
   
  });
});

console.log(jsonFile);
