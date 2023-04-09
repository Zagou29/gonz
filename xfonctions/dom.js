/**
 *
 * @param {string} tagName
 * @param {object} attributes
 * @return {HTMLelement}
 */
 const createElement = (tagName, attributes = {}) => {
  const element = document.createElement(tagName);
  for (const [attribute, value] of Object.entries(attributes)) {
    if (value !== null) {
      element.setAttribute(attribute, value);
    }
  }
  return element;
};
/**
 * 
 * @param {string} id 
 * @returns {documentFragment} clone du template
 */
 const cloneTemplate = (id) => {
  return document.getElementById(id).content.cloneNode(true);
};
export {createElement,cloneTemplate}