const axios = require('axios');
const markdown = require('markdown').markdown;
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

class helpers {
    async _call(url, method,data,headers) {
        let result = await axios({
            method: method,
            url: url,
            data: data,
            headers: headers
        })
        if (process.env.NODE_ENV == 'staging') {
            console.log("RESULT:",url,result.data);
        }

        return result;
    }
    formUrlEncoded (x) {
        return Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')
    }
    parseXml(xml) {
        let parser = new XMLParser();
        return parser.parse(xml);
    }
    parseMd(md) {
        return markdown.parse(md);
    }
}

module.exports = new helpers;