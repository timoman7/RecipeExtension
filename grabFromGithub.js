var abc;
var filePath = "https://raw.githubusercontent.com/timoman7/RecipeExtension/laptop/";
var files = {};

function recursiveJSON(frag, cb) {
  for (let _frag in frag) {
    if (typeof frag[_frag] == "object") {
      recursiveJSON(frag[_frag], cb, _frag)
    } else {
      if (arguments[2]) {
        cb(arguments[2], frag[_frag]);
      } else {
        cb(frag[_frag]);
      }
    }
  }
}
fetch(filePath + "filepaths.json").then((result) => {
  return result.json();
}).then((json) => {
  abc = json;
  recursiveJSON(json, function() {
    var arg = arguments;
    fetch(filePath + (([...arguments].join("")).replace(/ /g, ""))).then((result) => {
      if (arg[0].endsWith("/")) {
        return arg[1].endsWith("json") ? result.json() : result.text();
      } else {
        return arg[0].endsWith("json") ? result.json() : result.text();
      }
    }).then((Obj) => {
      if (arg[0].endsWith("/")) {
        if (!files[arg[0]]) {
          files[arg[0]] = {};
        }
        files[arg[0]][arg[1]] = Obj;

      } else {
        files[arg[0]] = Obj;
      }
    });
  });
});
