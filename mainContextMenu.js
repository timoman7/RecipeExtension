let altNames = {
  "nutrition": "NutritionInformation",
  "ingredients": "recipeIngredient"
};
let schemaOpts = {
  "Recipe":{
    "name": "Single",
    "description": "Single",
    "author": "Single",
    "recipeYield": "Single",
    "recipeCategory": "Single",
    "cookingMethod": "Single",
    "ingredients": "Multiple",
    "recipeCuisine": "Single",
    "recipeIngredient": "Multiple",
    "recipeInstructions": "Multiple",
    "nutrition": "New Type"
  },
  "NutritionInformation":{
    "servingSize": "Single",
    "calories": "Single",
    "fatContent": "Single",
    "carbohydrateContent": "Single",
    "proteinContent": "Single",
  }
};

function parseProp(prop, propType, schemaType, origin){
  let _prop;
  if(origin != "Allrecipes"){
    if(propType == "Single"){
      if(prop){
        _prop = prop.textContent;
      }else{
        _prop = "Unavailable"
      }
    }else if(propType == "Multiple"){
      _prop = [];
      for(let i = 0; i < prop.length; i++){
        prop[i] = prop[i].textContent
        _prop.push(prop[i]);
      }
    }else if(propType == "New Type"){
      console.log(prop, propType);
      _prop = {};
      for(let i in prop){
        _prop[i] = prop[i];
      }
    }
  }else{
    if(propType == "Single"){
      if(prop){
        _prop = prop.textContent;
      }else{
        _prop = "Unavailable"
      }
    }else if(propType == "Multiple"){
      _prop = [];
      console.log(prop)
      for(let i = 0; i < prop.length; i++){
        console.log(prop[i])
        if(prop[i].querySelector){
          if(prop[i].classList.contains('recipe-directions__list')){
            console.log(prop[i])
            let tProp = prop[i].querySelectorAll(".recipe-directions__list--item");
            for(let _i = 0; _i < tProp.length; _i++){
              _prop.push(tProp[_i].textContent);
            }
          }else if(prop[i].classList.contains('recipe-ingred_txt')){
            console.log(prop[i])
            _prop.push(prop[i].textContent);
          }
        }else if(prop[i].classList){
          prop[i].setAttribute('itemprop', Object.getOwnPropertyNames(altNames).includes(prop[i].getAttribute('itemprop')) ? altNames[prop[i].getAttribute('itemprop')] : prop[i].getAttribute('itemprop'));
          if(prop[i].classList.contains('recipe-ingred_txt')){
            let tProp = prop[i].querySelectorAll(".recipe-ingred_txt");
            console.log(tProp)
            for(let _i = 0; _i < prop[i].length; _i++){
              _prop.push(prop[i][_i].textContent);
            }
          }
        }else{
          console.log(prop[i])
          _prop.push(prop[i].textContent);
        }
      }
    }else if(propType == "New Type"){
      console.log(prop, propType);
      _prop = {};
      for(let i in prop){
        _prop[i] = prop[i];
      }
    }
  }
  console.log(prop, propType)
  return _prop;
}

function parseSchema(origin, schemaType){
  let _schema = {};
  let recipeContainer;
  if(origin){
    recipeContainer = document.querySelector("[itemtype=https\\:\\/\\/schema\\.org\\/"+schemaType+"]") || document.querySelector("[itemtype=http\\:\\/\\/schema\\.org\\/"+schemaType+"]");
  }
  console.log(origin, schemaType, recipeContainer)
  if(origin != "Allrecipes"){
    for(let schemaProp in schemaOpts[schemaType]){
      let prop;
      let propType = schemaOpts[schemaType][schemaProp];
      console.log(schemaProp)
      if(schemaOpts[schemaType][schemaProp] == "Single"){
        prop = recipeContainer.querySelector('[itemprop='+schemaProp+']');
      }else if(schemaOpts[schemaType][schemaProp] == "Multiple"){
        prop = recipeContainer.querySelectorAll('[itemprop='+schemaProp+']');
      }else if(schemaOpts[schemaType][schemaProp] == "New Type"){
        prop = parseSchema(origin, altNames[schemaProp]);
      }
      _schema[Object.getOwnPropertyNames(altNames).includes(schemaProp) ? altNames[schemaProp] : schemaProp] = parseProp(prop, propType, schemaType, origin);
    }
  }else{
    recipeContainer = document.querySelector("[itemtype=https\\:\\/\\/schema\\.org\\/"+schemaType+"]") || document.querySelector("[itemtype=http\\:\\/\\/schema\\.org\\/"+schemaType+"]");
    if(recipeContainer.querySelector('.breadcrumbs.breadcrumbs')){
      recipeContainer.removeChild(recipeContainer.querySelector('.breadcrumbs.breadcrumbs'));
    }
    for(let schemaProp in schemaOpts[schemaType]){
      let prop;
      let propType = schemaOpts[schemaType][schemaProp];
      console.log(schemaProp)
      if(schemaOpts[schemaType][schemaProp] == "Single"){
        prop = recipeContainer.querySelector('[itemprop='+schemaProp+']');
      }else if(schemaOpts[schemaType][schemaProp] == "Multiple"){
        prop = recipeContainer.querySelectorAll('[itemprop='+schemaProp+']');
      }else if(schemaOpts[schemaType][schemaProp] == "New Type"){
        prop = parseSchema(origin, altNames[schemaProp]);
      }
      let trueName = Object.getOwnPropertyNames(altNames).includes(schemaProp) ? altNames[schemaProp] : schemaProp;
      if(prop){
        if(prop.setAttribute){
          console.log(prop)
          prop.setAttribute('itemprop', trueName);
        }
      }
      if(_schema[trueName] == undefined){
        _schema[trueName] = parseProp(prop, propType, schemaType, origin);
      }
    }
  }
  return _schema;
}

function getRecipe(origin){
  let _recipe;
  if(origin == "LowCarbYum"){
    _recipe = JSON.parse(document.querySelector(".wprm-recipe-container").children[0].text);
  }else if(["Breathe","Dream","Allrecipes"].includes(origin)){
    _recipe = parseSchema(origin, "Recipe");
  }

  return _recipe;
}

function getOrigin(e){
  let origin = e.pageUrl || e.currentTarget.location.host || window.location.host;
  let _origin = false;
  if(origin.includes("ibreatheimhungry.com")){
    _origin = "Breathe";
  }else if(origin.includes("allrecipes.com")){
    _origin = "Allrecipes";
  }else if(origin.includes("alldayidreamaboutfood.com")){
    _origin = "Dream";
  }else if(origin.includes("lowcarbyum.com")){
    _origin = "LowCarbYum";
  }
  console.log(_origin)
  return _origin;
}

function loadRecipePage(e){
  let _recipe = getRecipe(getOrigin(e));

  console.log(_recipe)
}

function addRecipe(info, tab){
  console.log(window, document)
  chrome.tabs.sendMessage(tab.id, , function(e){console.log(e)});
  console.log(info, tab);
  console.log(getRecipe(getOrigin(info)))
}
// NOTE: USE CHROME.TABS.SENDMESSAGE ONMESSAGE AND CHROME.RUNTIME.SENDMESSAGE ONMESSAGE
console.log(chrome.contextMenus)
chrome.contextMenus.create({
  "type": "normal",
  "title": "Add recipe",
  "contexts": ["page"],
  "onclick": addRecipe,
  "documentUrlPatterns": ["*://*.alldayidreamaboutfood.com/*",
  "*://*.ibreatheimhungry.com/*",
  "*://*.allrecipes.com/*",
  "*://*.lowcarbyum.com/*"]
});
