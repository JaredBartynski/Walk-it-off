
var snackInput = $("#snack");
var bodyWeightInput = $("#weight");
var submit = $("#submitButton");
var zipCode = $("#zip");
var modalDlg = document.querySelector('#image-modal');
var loadModal = document.querySelector('#loading-modal');
var imageModalCloseBtn = document.querySelector('#image-modal-close');
var snackTest = document.querySelector('#snack');
var amountInput = $("#amount");

imageModalCloseBtn.addEventListener('click', function () {
    modalDlg.classList.remove('is-active');
    
});


submit.click(function () {
  loadModal.classList.add('is-active');
  var zip = zipCode.val();
  var snack = snackInput.val();
  var bodyWeight = bodyWeightInput.val();
  var amount = amountInput.val();

try{
  determineCalories(snack, bodyWeight, zip, amount);
} catch (error){
  console.log(error);
}
finally {
  loadModal.classList.remove('is-active');
  snackTest.classList.add('is-danger');
  // $("snack").append("<span class="icon is-small is-right"><i class="fas fa-exclamation-triangle"></i></span>");
}

  // determineCalories(snack, bodyWeight, zip, amount);
  
  console.log(zip);
  // apiCallcoords();
});

function determineCalories(snack, bodyWeight, zip, amount) {
  console.log(zip);
  $.ajax({
    url: "https://trackapi.nutritionix.com/v2/search/instant?query=" + snack,
    method: "GET",
    beforeSend: function (xhr) {
      xhr.setRequestHeader("x-app-id", "e75b2779");
      xhr.setRequestHeader("x-app-key", "0be5c122a01d2e0e81c70fd596e73aea");
    },
  }).then(function (getInfo) {
    var calories = getInfo.branded[0].nf_calories * amount;
    console.log(getInfo.branded[0]);
    var miles = (calories * 1.37) / bodyWeight;
    var minimumTrailLength = Math.round(miles);
    console.log(minimumTrailLength);
    apiCallcoords(zip, minimumTrailLength);
  });
}

function apiCallcoords(zip, minimumTrailLength) {
  // URL for openWeather API to determine coordinates, to be used in the hiking API
  var queryURLcoord = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=209f8c58871bc71410613a476769ea05`;
  // storing trail length to pass along to next function
  console.log(minimumTrailLength);

  $.ajax({
    url: queryURLcoord,
    method: "GET",
  }).then(function (weather) {
    // console.log(weather);

    // coordinates
    var lat = weather.coord.lat;
    var lon = weather.coord.lon;
    apiCallHike(lat, lon, minimumTrailLength);
  });
}

function apiCallHike(lat, lon, minimumTrailLength) {
  // max distance from lon and lat
  var max = 20;

  // URL for hinking API
  var queryURL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=${max}&minLength=${minimumTrailLength}&key=200914730-ab7614e0ee0bfb0265f3fa4b3c4abc83`;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (hikingData) {
    console.log(hikingData);
    var trailId =[];
    for (i = 0; i < hikingData.trails.length; i++) {
      var selectedTrail = hikingData.trails[i]["length"];
      if (selectedTrail >= minimumTrailLength && selectedTrail <= minimumTrailLength + 3) {
        // console.log(hikingData.trails[i]);
        trailId.push(hikingData.trails[i]);
      } else if(selectedTrail >= minimumTrailLength +10){
        trailId.push(hikingData.trails[i])
      }

    }
    
    //    this below is just stored for possible sorting logic
    // //    var trailsWithMinimumLength = hikingData.trails.filter(function(trail) {
      // //         // trail is an Object in here

      // //         return trail.length >= minimumTrailLength;

      //     });

    // displaying all the information in the pop up modal
    console.log(trailId[0]);
    var trailIMG = hikingData.trails[0]["imgMedium"];
    console.log(trailIMG);
    if( trailIMG === ""){
      $("#trailImage").attr("src", "noImage.jpg" );  
    }
    else{
    $("#trailImage").attr("src", trailId[0].imgMedium);
  }
    $("#trailName").text(trailId[0].name + " is the perfect hike for you!");
    $("#trailSummary").text(trailId[0].summary);
    $("#difficulty").text("difficulty: " + trailId[0].difficulty);
    $("#rating").text("rating: " + trailId[0].stars + "★");
    $("#length").text("length: " + trailId[0].length + " miles");
    $("#ascent").text("ascent: " + trailId[0].ascent );
    $("#descent").text("descent: " + trailId[0].descent );
    $("#condition").text("condition: " + trailId[0].condition);
    loadModal.classList.remove('is-active');
    modalDlg.classList.add('is-active');
  });
}


 

  