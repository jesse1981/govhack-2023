var map;
var autocomplete;
var address1Field;
var markers = [];
var geo = {};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });

    geo = new google.maps.Geocoder();
    initAutocomplete();
}


function initAutocomplete() {
  address1Field = document.querySelector('input[name="address"]');
  
  autocomplete = new google.maps.places.Autocomplete(address1Field, {
    componentRestrictions: { country: ["au"] },
    fields: ["address_components", "geometry"],
    types: ["address"],
  });
  address1Field.focus();
  // When the user selects an address from the drop-down, populate the
  // address fields in the form.
  autocomplete.addListener("place_changed", fillInAddress);
}

function fillInAddress() {
    // center map and zoom in on selected address
    let thisPlace = autocomplete.getPlace();
    console.log("PLACE",thisPlace);
    let c = thisPlace.address_components;
    let thisAddress = `${c[0].long_name} ${c[1].long_name}, ${c[2].long_name}, ${c[4].long_name} ${c[6].long_name}`;

    map.panTo(thisPlace.geometry.location);
    map.setZoom(14);
    addItemMarker({
        address: thisAddress
    });

    const place = autocomplete.getPlace();

    console.log("PLACE",place);

    let query_vals = {};

    for (const component of place.address_components) {
        query_vals[component.types[0]] = String(component.short_name).toUpperCase();
    }

    console.log("QUERY VALS",query_vals);

    // Query the hms api
    suburb_lookup(query_vals["locality"],query_vals["administrative_area_level_1"])
        .then((location_data) => {
            console.log("LOCATION DATA",location_data);
            item_search(
                location_data.CodeLovId,
                `${location_data.Description} ${location_data.ShortDesc} ${location_data.AlternativeDesc}`,
                document.getElementById("filter").value)})
        .then((item_data) => {
            console.log("ITEM DATA",item_data);
            item_data.forEach((item) => {
                addItemMarker(item);
            });
        })
        .catch((err) => {
            console.log("ERROR",err);
        });
}

function addItemMarker(item) {
    console.log("ITEM",item)
    geo.geocode({address: item.address},function(results, status){
        if (status == google.maps.GeocoderStatus.OK) {              
            var myLatLng = results[0].geometry.location;

            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                title: item.name
            });

            markers.push(marker)
            google.maps.event.addListener(marker, "click", onMarkerClick);
        } 
        else {
            console.log("Geocode was not successful for the following reason: " + status);
        }
    });
    
}
var onMarkerClick = function () {
    var marker = this;

    // get wikipedia data
    wikipedia_search(marker.title)
    .then((wiki_data) => {
        console.log("WIKI DATA",wiki_data);
        if (Object.keys(wiki_data).length > 0) {
            let name = wiki_data.name,
                image = wiki_data.image;

            item.body = `<h3>${name}</h3><img src="${image}"/>`;
        }
        else {
            item.body = `<h3>${item.name}</h3><p>No wikipedia entry found</p>`;
        }
    })
    .catch((err) => {
        console.log("ERROR",err);
    });
    
    var text = format(marker.title, marker.body).replace(/\n/g, '<br>');
    infoWindow.setContent(text);
    infoWindow.open(map, marker);
}
clearMarkers = function() {
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
    markers = [];
    bounds = new google.maps.LatLngBounds();
}