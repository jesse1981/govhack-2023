const h = require('./classes/helpers');
const wikipedia = require('./classes/wikipedia');

const hms_headers = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-AU,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    "origin": "https://www.hms.heritage.nsw.gov.au",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
}
const hms_defaults = {
    ProgramId: "",
    ProjectId: "",
    EndorsedOrganisationId: "",
    IsForMergeItem: "False",
    MergeToItemId: "",
    SearchType: "basic",
    ShrFlag: "",
    S170Flag: "",
    LEPFlag: "",
    ItemRedundant: "",
    IHOProtectedFlag: "",
    IsSearchingGroupItemsOnly: "False",
    IsSearchingNonGroupItemsOnly: "False",
    ItemIdsFromMap: "",
    ItemListingTypesFromMap: "",
    ForAssociation: "False",
    IsIhoListingType: "False",
    IsCouncilIhoListingType: "False",
    IsShrListingType: "False",
    IsInfoReqOrMisc: "False",
    BasicItemName: "",
    BasicStreetName: "",
    BasicSuburb: "",
    BasicSuburbLovId: "",
    BasicLGALovId: "",
    AdvanceStreetName: "",
    AdvanceSuburb: "",
    AdvanceSuburbLovId: "",
    AdvanceLGALovId: "",
    LocalAboriginalLandCouncilLovId: "",
    AdvanceItemName: "",
    SignificanceDescriptionHistoricalNotes: "",
    RecordOwnerOrganizationLovId: "",
    DesignerBuilder: "",
    ConstructionStartYear: "",
    ConstructionEndYear: "",
    IdTypeLovId: "",
    IdNumbers: "",
    GazettalDateFrom: "",
    GazettalDateTo: "",
    NationalThemeLovId: "",
    StateThemeLovId: "",
    LocalThemeLovId: "",
    "MapActionRequest.Page": "1",
    "MapActionRequest.PageSize": "25",
    "MapActionRequest.PreviousPageSize": "25",
    "MapActionRequest.Sort.Field": "ItemName",
    "MapActionRequest.Sort.Dir": "asc",
    "AToZActionRequest.Page": "0",
    "AToZActionRequest.PageSize": "0",
    "AToZActionRequest.PreviousPageSize": "0",
    "AToZActionRequest.Sort.Field": "",
    "AToZActionRequest.Sort.Dir": "",
    "StatutoryAboriginalActionRequest.Page": "0",
    "StatutoryAboriginalActionRequest.PageSize": "0",
    "StatutoryAboriginalActionRequest.PreviousPageSize": "0",
    "StatutoryAboriginalActionRequest.Sort.Field": "",
    "StatutoryAboriginalActionRequest.Sort.Dir": "",
    "StatutoryNSWHeritageActionRequest.Page": "0",
    "StatutoryNSWHeritageActionRequest.PageSize": "0",
    "StatutoryNSWHeritageActionRequest.PreviousPageSize": "0",
    "StatutoryNSWHeritageActionRequest.Sort.Field": "",
    "StatutoryNSWHeritageActionRequest.Sort.Dir": "",
    "StatutoryLocalGovtActionRequest.Page": "0",
    "StatutoryLocalGovtActionRequest.PageSize": "0",
    "StatutoryLocalGovtActionRequest.PreviousPageSize": "0",
    "StatutoryLocalGovtActionRequest.Sort.Field": "",
    "StatutoryLocalGovtActionRequest.Sort.Dir": "",
    ItemSearchType: "ITEM_SEARCH_TYPE_MAP"
}

module.exports.handler = {
    suburb_lookup: async (event) => {
        let suburb = event.suburb || event.queryStringParameters.suburb,
            state = event.state || event.queryStringParameters.state,
            search_params = {
                "prefix": suburb,
                "state": state,
                "excludePoBoxAddresses": true,
                "_": Date.now()
            },
            query = Object.keys(search_params).map(key => key + '=' + search_params[key]).join('&');
            result = await h._call(`${process.env.HMS_API}/LookupCode/perform-suburb-lookup?${query}`, 'GET',"", hms_headers);

        if (process.env.NODE_ENV == 'staging') {
            console.log(query);
            console.log("RESULT:",result);
        }
        
        if (result.status == 200) {
            return {
                statusCode: 200,
                body: JSON.stringify(result.data["$values"])
            }
        }
        else {
            return {
                statusCode: result.status,
                body: JSON.stringify({
                    error: result.data
                })
            }
        }
    },
    item_search: async (event) => {
        let headers = hms_headers,
            search_keys = hms_defaults;

        headers['content-type'] = 'application/x-www-form-urlencoded';
        search_keys['BasicSuburb'] = event.location;
        search_keys['BasicSuburbLovId'] = event.location_id;
        if (event.name) search_keys['BasicItemName'] = event.name;

        let result = await h._call(process.env.HMS_SEARCH, 'POST', h.formUrlEncoded(search_keys), headers);
        
        try {
            let xml = h.parseXml(`<html>${result.data}</html>`);
            let results = [];
            for (let i = 0; i < xml.html.div.length; i++) {
                let obj = xml.html.div[i],
                    name    = obj.div.div[1].div[0]["#text"],
                    address = obj.div.div[1].div[1],
                    suburb  = obj.div.div[1].div[2];

                //console.log(name,address,suburb);
                results.push({
                    name: name,
                    address: address,
                    suburb: suburb,
                    lat: 0,
                    lng: 0
                });
            }
            return {
                statusCode: 200,
                body: JSON.stringify(results)
            }
        }
        catch (e) {
            console.log("FAILED:",e);
            console.log(result.data);
            return false;
        }
    },
    wikipedia_search: async (event) => {
        let w = new wikipedia,
            search_val = event.search_val || event.queryStringParameters.search_val,
            result = await w.search(search_val);

        console.log("Batch",result.data.query.search.length,"Max",result.data.query.searchinfo.totalhits);
        console.log(JSON.stringify(result.data.query.search[0]));

        if (result.status == 200) {
            // Get the first result canonical url
            //let wiki_url = await w.getFullUrl(result);

            // Get the page infobox
            let infobox = await w.getInfoboxData(result.data.query.search[0].pageid),
                infobox_data = infobox.query.pages[result.data.query.search[0].pageid].revisions[0]["*"];
            infobox_data = String(infobox_data).split("\n");
            console.log("infobox keys",infobox_data.length);
            let infobox_obj = {};
            for (let i = 0; i < infobox_data.length; i++) {
                if (infobox_data[i].indexOf(" = ") > -1) {
                    let key = infobox_data[i].split(" = ")[0].trim(),
                        val = infobox_data[i].split(" = ")[1].trim();
                    key = key.replace("| ","").replace("{{","").replace("}}","");
                    infobox_obj[key] = val;
                }
            }
            // get the image url
            if (infobox_obj.image) {
                let image_url = await w.getImageUrl(infobox_obj.image);
                infobox_obj.image = image_url;
            }
            
            console.log("infobox",infobox_obj);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(infobox_obj)
        }
    }
}