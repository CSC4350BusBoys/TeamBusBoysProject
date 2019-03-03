let map;
let markers = [];
let prevOpenWindow = false;

// jquery obj holding our form
let formObj = $("#route-search-form");




function initMap(){

  //Map settings
  let mapOpt = {
    zoom: 10,
    center: {lat: 33.7490, lng: -84.3880}
  }

  //Map Constructor
  map = new google.maps.Map(document.getElementById('map'), mapOpt);


  // new functionality to close an info window if the map is clicked
  map.addListener("click", ()=>{
    if(prevOpenWindow){
      prevOpenWindow.close();
    }
  });
  /*

  //Info Window Content
  let infoCon = {
    content: '<h1>Piedmont Park</h1>'
  }

  //Info Window Constructor
  let info = new google.maps.InfoWindow(infoCon);

  //Click-to-Open
  marker.addListener('click', function(){
    info.open(map, marker);
  });
  */
}

//Add Marker function
function addMarker(element, currETA){
  let lat = parseFloat(element["LATITUDE"]);
  let lng = parseFloat(element["LONGITUDE"]);
  // console.log(lat + " " + lng);

  let marker = new google.maps.Marker({
    position: {lat, lng},
    map: map
  });

  let timeUser = element['MSGTIME'].split("  ")
  console.log(timeUser);
  // let lastUpdate = getLastUpdate(element, new Date());

  let infoCon = {
    content: '<h6>Heading ' + element["DIRECTION"] + '</h6>' +
              '<h6>Towards ' + element["TIMEPOINT"] + '</h6>' +
              '<h6>Expected to Arrive in ' + currETA + '</h6>' +
              '<h6>Last Update: ' + element["MSGTIME"] + '</h6>'
  };



  //Info Window Constructor
  let info = new google.maps.InfoWindow(infoCon);

  //Click-to-Open
  marker.addListener('click', function(){
    // added functionality to close any previously open
    // info window when a new one is open
    if(prevOpenWindow){
      prevOpenWindow.close();
    }

    info.open(map, marker);
    prevOpenWindow = info;
  });

  markers.push(marker);
}

function getLastUpdate(lastUpdate, currTime){

}

function geocodeCurrLoc(element){
      let geocoder = new google.maps.Geocoder();
      let address = element['TIMEPOINT'] + " Atlanta, GA";
      let userGivenDest = [];

      geocoder.geocode({'address': address}, function(results, status){
          if(status === "OK"){
            let lng = results[0].geometry.location.lng();
            let lat = results[0].geometry.location.lat();

            userGivenDest.push(lat);
            userGivenDest.push(lng);

            estimateRoute(element, userGivenDest);
          }else{
            return "There was a geocoding error!";
          }
      });
}


function estimateRoute(element, dest){
  // console.log(element);
        let origin = new google.maps.LatLng(element['LATITUDE'], element['LONGITUDE']); 
        let destination = new google.maps.LatLng(dest[0], dest[1]); 

        // must create a new directions sesrvice object in order to obtain route from origin to dest
        let directionsService = new google.maps.DirectionsService();

        // fill request var with our origin and dest objs, and then travelmode
        let request = {
            origin: origin, // LatLng|string
            destination: destination, // LatLng|string
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };


        // send those request details to the direction services  route method, and have callback fnction intercept the response - being necessary details like duration n distance - as well as status
        //log error if status isnt returned as OK; otherwise, print out the first routes legs duration and distance .text!!! look at JSON returns to see how google returns route!
        directionsService.route(request, function( response, status ) {
            if ( status === 'OK' ) {
                  let point = response.routes[0].legs[0];

                  let currETA = (point.duration.text + " (" + point.distance.text + ")");
                  addMarker(element, currETA);
                  // return point.duration.text + " (" + point.distance.text + ")";
            }else{
                console.log("FAIL");
                window.alert('Directions request failed due to ' + status);
                // return "route est. failed";
            }
        });

}

function displayResults(results){

  results.forEach((element)=>{
    geocodeCurrLoc(element);
  });
  showMarkers();
}

function clearMarkers(){
  setMapOnAll(null);
}

function setMapOnAll(map){
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function showMarkers(){
  setMapOnAll(map);
}

function deleteMarkers(){
  clearMarkers();
  markers=[];
}

//when form submission button is clicked, we will prevent the default - the reloading of the page onto .php - and send a ajax GET call, sending the route data entered in the form. If success, we overwrite our results with whatever data the .php returns, and print out; we can do whatever we like with this

// if error, we log there was an error!
$(formObj).on("submit", function(e){
  //when form submitted, resize search dialog, and search MARTA API for details
  deleteMarkers();

  let results = [];
  e.preventDefault();

  $.ajax({
    url: "./extractMARTA.php",
    type: "GET",
    data: formObj.serialize(),
    dataType: 'json',
    success: function(data){
      results = JSON.parse(data);
      if(results.length === 0){
        alert("No routes by that number.")
      }else{
        displayResults(results);
      }
    },
    error: function(e){
      console.log("ERROR" + e);
      alert("ERROR: No Data Was Able to be Obtained")
    }
  });
});
