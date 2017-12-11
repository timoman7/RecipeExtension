let recipes;
let _RecipeTemplate;
let RecipeHolder;
let BTSRecipes = [];
//Sort        | SortOpt SortDir
let SOpt;
let SDir;
//Filter      | FilterOpt FilterIs FilterOp FilterText
let FOpt;
let FIs;
let FOp;
let FText;
//SortFilter  | SortFilterSubmit SortFilterClear
let SFSubmit;
let SFClear;
String.prototype.camelToProper = function(){
  let newString = "";
  let upperCase = this.match(/[A-Z]/g) || [];
  newString = this.split(/[A-Z]/g);
  let tempString = "";
  newString.forEach((section) => {
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
  chrome.storage.local.get("recipes", function(strg){
    BTSRecipes = strg.recipes;
    recipes = strg.recipes;
  });
}
function removeRecipe(recipeID){
  chrome.storage.local.get(function(strg){
    if(!strg.recipes){
      chrome.storage.local.set({
        recipes: []
      });
    }
  });
  chrome.storage.local.get("recipes",function(strg){
    strg.recipes.splice(recipeID, 1);
    chrome.storage.local.set({
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
              if(trueName == "NutritionInformation"){
                fragHTML.setAttribute('itemprop', frag);
              }else{
                if(fakeName != altNames[trueName]){
                  fragHTML.setAttribute('itemprop', frag);
                }else{
                  fragHTML.setAttribute('itemprop', trueName);
                }
              }
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

function updateRecipeHTMLManual(){
  let oldRecipes = RecipeHolder.querySelectorAll('.recipe-holder');
  for(let oldRecipeID = oldRecipes.length-1; oldRecipeID >= 0; oldRecipeID--){
    oldRecipes[oldRecipeID].parentElement.removeChild(oldRecipes[oldRecipeID]);
  }
  let _recipes = recipes;
  for(let recipeInd in _recipes){
    let newRecipe = recipeToHtml(_recipes[recipeInd], recipeInd);
    RecipeHolder.appendChild(newRecipe);
  }
}


//    Sort        | SortOpt SortDir
// let SOpt;
// let SDir;
//    Filter      | FilterOpt FilterIs FilterOp FilterText
// let FOpt;
// let FIs;
// let FOp;
// let FText;
//    SortFilter  | SortFilterSubmit SortFilterClear
// let SFSubmit;
// let SFClear;

function sortRecipes(_SOpt,SOptType,_SDir){
  let valConvert = {
    "name": "name",
    "prep": "prepTime",
    "cook": "cookTime",
    "calories": "calories",
    "fat": "fatContent",
    "protein": "proteinContent",
    "carb": "carbohydrateContent",
    "none": "none",
  };
  let sortType = valConvert[_SOpt];
  let isNutrition = ["fat","protein","carb","calories"].includes(_SOpt);
  if(sortType != "none"){
    chrome.storage.local.get("recipes", function(strg){
      BTSRecipes = strg.recipes;
    });
    recipes.sort((recipeA, recipeB) => {
      console.log(recipeA, recipeB);
      let recipeAVal;
      let recipeBVal;
      if(_SDir == "asc"){
        if(isNutrition){
          recipeAVal = recipeA.NutritionInformation[sortType];
          recipeBVal = recipeB.NutritionInformation[sortType];
        }else{
          recipeAVal = recipeA[sortType];
          recipeBVal = recipeB[sortType];
        }
        if(SOptType == "number"){
          recipeAVal = parseFloat(recipeAVal.replace(/[ a-zA-Z]/g,""));
          recipeBVal = parseFloat(recipeBVal.replace(/[ a-zA-Z]/g,""));
        }else if(SOptType == "string"){

        }
        console.log(recipeAVal > recipeBVal ? 1 : (recipeAVal == recipeBVal ? 0 : -1));
        return (recipeAVal > recipeBVal ? 1 : (recipeAVal == recipeBVal ? 0 : -1));
      }else if(_SDir == "dec"){
        if(isNutrition){
          recipeAVal = recipeA.NutritionInformation[sortType];
          recipeBVal = recipeB.NutritionInformation[sortType];
        }else{
          recipeAVal = recipeA[sortType];
          recipeBVal = recipeB[sortType];
        }

        if(SOptType == "number"){
          recipeAVal = parseFloat(recipeAVal.replace(/[ a-zA-Z]/g,""));
          recipeBVal = parseFloat(recipeBVal.replace(/[ a-zA-Z]/g,""));
        }else if(SOptType == "string"){

        }
        console.log(recipeAVal < recipeBVal ? 1 : (recipeAVal == recipeBVal ? 0 : -1));
        return (recipeAVal < recipeBVal ? 1 : (recipeAVal == recipeBVal ? 0 : -1));
      }
    });
  }else{
    chrome.storage.local.get("recipes", function(strg){
      BTSRecipes = strg.recipes;
    });
    recipes = BTSRecipes;
  }
  updateRecipeHTMLManual();
}

function filterRecipes(_FOpt,FOptType,_FIs,_FOp,_FText){
  let valConvert = {
    "name": "name",
    "prep": "prepTime",
    "cook": "cookTime",
    "calories": "calories",
    "fat": "fatContent",
    "protein": "proteinContent",
    "carb": "carbohydrateContent",
    "none": "none",
  };
  let filterType = valConvert[_FOpt];
  let isNutrition = ["fat","protein","carb","calories"].includes(_FOpt);
  if(filterType != "none"){
    chrome.storage.local.get("recipes", function(strg){
      BTSRecipes = strg.recipes;
    });
    recipes = BTSRecipes;
    recipes = recipes.filter((recipe) => {
      let recipeVal;
      if(isNutrition){
        recipeVal = recipe.NutritionInformation[filterType];
      }else{
        recipeVal = recipe[filterType];
      }
      if(FOptType == "number"){
        recipeVal = parseFloat(recipeVal.replace(/[ a-zA-Z]/g,""));
      }else if(FOptType == "string"){

      }
      if(FOptType == "string"){
        if(_FIs == "is"){
          if(_FOp == "in"){
            return recipeVal.includes(_FText);
          }else{
            return true;
          }
        }else if(_FIs == "not"){
          if(_FOp == "in"){
            return !(recipeVal.includes(_FText));
          }else{
            return true;
          }
        }
      }else if(FOptType == "number"){
        if(_FIs == "is"){
          if(_FOp == ">"){
            return recipeVal > parseFloat(_FText.replace(/[ a-zA-Z]/g, ""));
          }else if(_FOp == "<"){
            return recipeVal < parseFloat(_FText.replace(/[ a-zA-Z]/g, ""));
          }else if(_FOp == "="){
            return Math.round(recipeVal) == Math.round(parseFloat(_FText.replace(/[ a-zA-Z]/g, "")));
          }else{
            return true;
          }
        }else if(_FIs == "not"){
          if(_FOp == ">"){
            return !(recipeVal > parseFloat(_FText.replace(/[ a-zA-Z]/g, "")));
          }else if(_FOp == "<"){
            return !(recipeVal < parseFloat(_FText.replace(/[ a-zA-Z]/g, "")));
          }else if(_FOp == "="){
            return !(Math.round(recipeVal) == Math.round(parseFloat(_FText.replace(/[ a-zA-Z]/g, ""))));
          }else{
            return true;
          }
        }
      }else{
        return true;
      }
    });
  }else{
    chrome.storage.local.get("recipes", function(strg){
      BTSRecipes = strg.recipes;
    });
    recipes = BTSRecipes;
  }
  updateRecipeHTMLManual();
}

//    Sort        | SortOpt SortDir
// let SOpt;
// let SDir;
//    Filter      | FilterOpt FilterIs FilterOp FilterText
// let FOpt;
// let FIs;
// let FOp;
// let FText;
//    SortFilter  | SortFilterSubmit SortFilterClear
// let SFSubmit;
// let SFClear;

chrome.storage.onChanged.addListener(updateRecipeHTML);

window.addEventListener('load',function(){
  updateRecipes();
  SOpt = document.querySelector('#SortOpt');
  SDir = document.querySelector('#SortDir');
  FOpt = document.querySelector('#FilterOpt');
  FIs = document.querySelector('#FilterIs');
  FOp = document.querySelector('#FilterOp');
  FText = document.querySelector('#FilterText');
  SFSubmit = document.querySelector('#SortFilterSubmit');
  SFClear = document.querySelector('#SortFilterClear');
  SFSubmit.addEventListener('click', function(){
    if(FOpt.value != "none"){
      filterRecipes(FOpt.value,FOpt.selectedOptions[0].getAttribute('dataType'),FIs.value,FOp.value,FText.value);
    }
    if(SOpt.value != "none"){
      sortRecipes(SOpt.value,SOpt.selectedOptions[0].getAttribute('dataType'),SDir.value);
    }
  });
  SFClear.addEventListener('click', function(){
      chrome.storage.local.get("recipes", function(strg){
        BTSRecipes = strg.recipes;
      });
      recipes = BTSRecipes;
      updateRecipeHTMLManual();
  });
  RecipeHolder = document.querySelector("#EveryRecipe");
  _RecipeTemplate = document.querySelector('#RecipeTemplate');
  setTimeout(function(){
    if(recipes){
      updateRecipeHTML();
    }
  }, 2000);
});
