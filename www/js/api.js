function suburb_lookup(suburb,state) {
    let url = `https://xfaf3t02mg.execute-api.ap-southeast-2.amazonaws.com/suburb-lookup/${suburb}/${state}`;
    let result = httpRequest("GET",url);
    return result;
}
function item_search(loc_id,loc_name,filter) {
    filter = (filter) ? filter:"";
    let url = `https://xfaf3t02mg.execute-api.ap-southeast-2.amazonaws.com/item-search`;
    let data = {
        location_id: loc_id,
        location_name: loc_name,
        name: filter
    }
    let result = httpRequest("POST",url,null,data);
    return result;
}
wikipedia_search = function(search_val) {
    let url = `https://xfaf3t02mg.execute-api.ap-southeast-2.amazonaws.com/wiki-search/${search_val}`;
    let result = httpRequest("GET",url);
    return result;
}