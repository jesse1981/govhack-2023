const h = require('./helpers.js');

const url = "https://en.wikipedia.org/w/api.php";
const origin = "https://en.wikipedia.org";
const headers = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-AU,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    "origin": origin,
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
}


class wikipedia {
    async search(search_val) {
        let query = {
                "action": "query",
                "list": "search",
                "prop": "info",
                "inprop": "url",
                "utf8": "",
                "format": "json",
                "origin": origin,
                "srlimit": 20,
                "srsearch": search_val
            }
        let result = await h._call(`${url}?${h.formUrlEncoded(query)}`, 'GET', "", headers);

        return result;
    }
    async getFullUrl(result) {
        let query = {
                action: "query",
                prop: "info",
                pageids: result.data.query.search[0].pageid,
                inprop: "url",
                format: "json"
            },
            res = await h._call(`${url}?${h.formUrlEncoded(query)}`, 'GET', "", headers);

        let wiki_url = res.data.query.pages[query.pageids].fullurl;

        return wiki_url;
    }
    async getInfoboxData(pageid) {
        let query = {
                action: "query",
                prop: "revisions",
                rvprop: "content",
                pageids: pageid,
                format: "json",
                rvsection: 0
            };
        let result = await h._call(`${url}?${h.formUrlEncoded(query)}`, 'GET', "", headers);
        return result.data;
    }
    async getImageUrl(title) {
        let url = `${url}?action=query&titles=File:${title}&prop=imageinfo&iiprop=url&format=json`,
            result = await h._call(url, 'GET', null, null);

        try {
            return result.data.imageinfo[0].url;
        }
        catch (e) {
            console.log("FAILED:",e);
            console.log(result.data);
            return false;
        }
    }
}

module.exports = wikipedia;