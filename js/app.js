const url = "https://793ac23c6757.au.ngrok.io/";

var player;
var game;
var loadingProgress = { loaded: 0, count: 0 };
var poops = 5;

window.onload = function () {
  renderPoops();
  initialise();
  // When the window loads, start to initialize the SDK
  FBInstant.initializeAsync().then(function () {
    loadImages();
  });
};

function renderPoops() {
  for (i = 0; i < poops; i++) {
    $(".poops").append(
      '<div class="x" style="animation-delay: ' +
        i / 5 +
        's;"><div class="poop " style="animation-delay: 0.' +
        (i % 2).toString() +
        's;"><div class="poop' +
        (i % 2).toString() +
        '">💩</div></div></div>'
    );
  }
}

function loadImages() {
  var images = ["./img/header.png"];
  loadingProgress.count = images.length;
  for (var i = 0; i < images.length; i++) {
    var assetName = images[i];
    var image = asyncImageLoader(assetName);
    image.then((res) => {
      loadingProgress.loaded++;
      updateLoadingScreen();
    });
  }
}

function asyncImageLoader(url) {
  return new Promise((resolve, reject) => {
    var image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("could not load image"));
  });
}
function updateLoadingScreen() {
  var progress = (loadingProgress.loaded / loadingProgress.count) * 100;
  FBInstant.setLoadingProgress(progress);
  if (progress == 100) {
    // Now that assets are loaded, call startGameAsync
    FBInstant.startGameAsync().then(onStart);
  }
}

function onStart() {
  getUser(
    FBInstant.player.getID(),
    FBInstant.player.getName(),
    FBInstant.player.getPhoto()
  );
  // This is called when the user has tapped Play
  // Information from the SDK can now be accessed
}

function getUser(id, name, imgurl) {
  encodedURI = encodeURIComponent(imgurl);
  $.getJSON(
    url + "getUser?id=" + id + "&name=" + name + "&imgurl=" + encodedURI,
    function (data) {
      handleUser(data);
      return data;
    }
  ).fail(function (response) {
    console.log("Error: " + response.responseText);
  });
}

function handleUser(resp) {
  player = resp;
  $(".games-played .value").html(player.gamesPlayed);
  $(".games-lost .value").html(player.gamesLost);
  $("#menu").addClass("active");
}

function sendRequest(endpoint, data, aFunction) {
  $.post(url + endpoint, data).done(function (resp) {
    aFunction(resp);
  });
}

function handleNewGame(resp) {
  $("section#newGame").addClass("active");
  game = resp.game;
  player = resp.player;
  game.players.forEach((player) => {
    asyncImageLoader(player.imgurl);
    $(".players-list")
      .html("")
      .append(
        '<div class="player"><div style="background-image: url(' +
          player.imgurl +
          ');" class="player-img"></div><div class="player-name">' +
          player.name +
          "</div></div>"
      );
  });
}

function initialise() {
  $("section")
    .on("transitionstart", function () {})
    .on("transitionend", function () {});
  $(".btn-new-game").click(function () {
    $("section#menu").removeClass("active").addClass("return");
    sendRequest("newGame", { id: FBInstant.player.getID() }, handleNewGame);
  });
  $(".btn-back").click(function () {
    $("section.active").removeClass("active");
    $("section.return").removeClass("return");
    $("section#menu").addClass("active");
  });
  $(".btn-how-to-play").click(function () {
    $("section#menu").removeClass("active").addClass("return");
    $("section#howToPlay").addClass("active");
  });
  $(".btn-rules").click(function () {
    $(".instructions.rules").addClass("active").removeClass("return");
    $(".btn-rules").addClass("active");
    $(".instructions.cards").removeClass("active");
    $(".btn-cards").removeClass("active");
  });
  $(".btn-cards").click(function () {
    $(".instructions.cards").addClass("active");
    $(".btn-cards").addClass("active");
    $(".instructions.rules").removeClass("active").addClass("return");
    $(".btn-rules").removeClass("active");
  });
}
