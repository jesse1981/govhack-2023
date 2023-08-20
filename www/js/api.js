function suburb_lookup(suburb,state) {
    return new Promise((resolve,reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `https://xfaf3t02mg.execute-api.ap-southeast-2.amazonaws.com/suburb-lookup/${suburb}/${state}`);
        xhr.setRequestHeader("Accept", "application/json");
        
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                let location_data = JSON.parse(xhr.responseText)[0];
                resolve(location_data);
            }
        };
        
        xhr.onerror = () => {
            console.log("Request failed");
            reject("Request failed");
        }
    })
}
function item_search(loc_id,loc_name,filter) {
    filter = (filter) ? filter:"";
    return new Promise((resolve,reject) => {
        let xhr = new XMLHttpRequest();
        let data = {
            "location_id": loc_id,
            "location_name": loc_name,
            "name": filter
        };
        xhr.open("POST", `https://xfaf3t02mg.execute-api.ap-southeast-2.amazonaws.com/item-search/${search_val}`);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.send(data)
        
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                let item_data = JSON.parse(xhr.responseText);
                resolve(item_data);
            }
        };
        
        xhr.onerror = () => {
            console.log("Request failed");
            reject("Request failed");
        }
    })
}
wikipedia_search = function(search_val) {
    return new Promise((resolve,reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `https://xfaf3t02mg.execute-api.ap-southeast-2.amazonaws.com/wiki-search/${search_val}`);
        xhr.setRequestHeader("Accept", "application/json");
        
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                let wiki_data = JSON.parse(xhr.responseText);
                resolve(wiki_data);
            }
        };
        
        xhr.onerror = () => {
            console.log("Request failed");
            reject("Request failed");
        }
    })
}