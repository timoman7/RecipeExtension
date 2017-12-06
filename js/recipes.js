let recipes;
let _RecipeTemplate = document.querySelector('#RecipeTemplate');
chrome.storage.sync.get("recipes", function(strg){
  recipes = strg.recipes;
});
// TODO: For each recipe in the array, run it through a function using the template
