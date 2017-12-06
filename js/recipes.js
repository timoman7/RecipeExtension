let recipes;
let _RecipeTemplate;
let RecipeHolder;
String.prototype.camelToProper = function(){
  let newString = "";
  let upperCase = this.match(/[A-Z]/g) || [];
  newString = this.split(/[A-Z]/g);
  let tempString = "";
  newString.forEach((section) => {
    console.log(section)
    tempString += (upperCase[newString.indexOf(section)-1]||"").toLowerCase()+section+" ";
  });
  newString = tempString.substr(0,1).toUpperCase() + tempString.substr(1,tempString.length-1);
  return newString;
};

let altNames = {
  "NutritionInformation": "nutrition",
  "recipeIngredient": "ingredients",
  "recipeInstructions": "instructions"
};
function updateRecipes(){
  chrome.storage.sync.get("recipes", function(strg){
    recipes = strg.recipes;
  });
}
function removeRecipe(recipeID){
  console.log(recipeID)
  chrome.storage.sync.get(function(strg){
    if(!strg.recipes){
      chrome.storage.sync.set({
        recipes: []
      });
    }
  });
  chrome.storage.sync.get("recipes",function(strg){
    strg.recipes.splice(recipeID, 1);
    chrome.storage.sync.set({
      recipes: strg.recipes
    });
  });
}
// TODO: For each recipe in the array, run it through a function using the template
function recipeToHtml(recipe, recipeInd){
  let recipeHTML = document.importNode(_RecipeTemplate.content, true);
  for(let prop in recipe){
    let propVal = recipe[prop];
    if(!prop.startsWith("@")){
      let fakeName = Object.getOwnPropertyNames(altNames).includes(prop) ? altNames[prop] : prop;
      let trueName = Object.getOwnPropertyNames(altNames).includes(prop) ? prop : altNames[prop];
      if(typeof propVal == "object"){
        console.log(fakeName)
        let sectTemplate = recipeHTML.querySelector("."+fakeName);
        if(sectTemplate){
          for(let frag in recipe[prop]){
            let fragVal = recipe[prop][frag];
            if(!frag.startsWith("@")){
              let fragHTML = document.createElement('li');
              fragHTML.classList.add(frag);
              if(isNaN(parseFloat(frag))){
                fragHTML.style.listStyle = "none"
                fragHTML.textContent = frag.camelToProper() + ": " + fragVal;
              }else{
                fragHTML.textContent = fragVal;
              }
              console.log(fakeName, altNames[trueName])
              if(trueName == "NutritionInformation"){
                fragHTML.setAttribute('itemprop', frag);
              }else{
                if(fakeName != altNames[trueName]){
                  fragHTML.setAttribute('itemprop', frag);
                }else{
                  fragHTML.setAttribute('itemprop', trueName);
                }
              }
              console.log(sectTemplate)
              sectTemplate.appendChild(fragHTML);
              sectTemplate.appendChild(document.createElement('br'));
            }
          }
        }
      }else if(typeof propVal == "string"){
        let propTemplate = recipeHTML.querySelector("."+fakeName);
        if(propTemplate){
          propTemplate.textContent = propVal;
          if(propTemplate.tagName == "A"){
            propTemplate.href = propVal;
          }
        }
      }else{
        console.log("Unknown", propVal)
      }
    }
  }
  recipeHTML.querySelector('.removeRecipe').addEventListener('click', function(e){
    let recipeArr = RecipeHolder.querySelectorAll('.recipe-holder');
    let recipeRefID = [...recipeArr].indexOf(e.srcElement.parentElement);
    removeRecipe(recipeRefID);
  });
  //recipeHTML.querySelector(".name").textContent = recipe
  return recipeHTML;
}
/*
<div itemscope itemtype="http://schema.org/Recipe">
  <span class="name" itemprop="name"></span>
  By <span class="author" itemprop="author"></span>
  <span class="description" itemprop="description"></span>
  Prep Time: <span class="prepTime" itemprop="prepTime"></span>
  Cook time: <span class="cookTime" itemprop="cookTime"></span>
  Yield: <span class="recipeYield" itemprop="recipeYield"></span>
  <div class="nutrition" itemprop="nutrition" itemscope itemtype="http://schema.org/NutritionInformation">
    Nutrition facts:
  </div>
  Ingredients:
  <div class="ingredients">
  </div>

  Instructions:
  <div class="instructions">
  </div>
</div>
*/
updateRecipes();
let abc;
function updateRecipeHTML(d, p){
  if((d == undefined && p == undefined) || d.recipes){
    let oldRecipes = RecipeHolder.querySelectorAll('.recipe-holder');
    for(let oldRecipeID = oldRecipes.length-1; oldRecipeID >= 0; oldRecipeID--){
      oldRecipes[oldRecipeID].parentElement.removeChild(oldRecipes[oldRecipeID]);
    }
    updateRecipes();
    let _recipes = (d ? d.recipes.newValue : recipes);
    for(let recipeInd in _recipes){
      let newRecipe = recipeToHtml(_recipes[recipeInd], recipeInd);
      RecipeHolder.appendChild(newRecipe);
    }
  }
}

chrome.storage.onChanged.addListener(updateRecipeHTML);

window.addEventListener('load',function(){
  updateRecipes();
  RecipeHolder = document.querySelector("#EveryRecipe");
  _RecipeTemplate = document.querySelector('#RecipeTemplate');
  setTimeout(function(){
    if(recipes){
      updateRecipeHTML();
    }
  }, 2000);
});
