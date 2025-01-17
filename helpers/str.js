module.exports = class Str {

    /**
     * Convert html text to nodes
     * @param html
     */
    to_nodes (html) {
        if (typeof html !== 'string') { return html; }
        let div = document.createElement('div');
        div.innerHTML = html.trim();
        return Object.assign([], div.childNodes);
    }

    /**
     * Preg match all how in PHP
     * @param pattern
     * @param str
     */
    preg_match_all (pattern, str) {
        let result;
        let matches = [];
        while ((result = pattern.exec(str)) !== null) {
            matches.push(result);
        }
        return matches;
    }

    /**
     * Replace tags in string by params
     * @param target
     * @param params
     * @param markers
     */
    replace_tags (target, params, markers = "{*}") {
        markers = !Array.isArray(markers) ? markers.split('*') : markers;
        Object.keys(params).map(k => {
            target = target.replace(
                new RegExp(`${markers[0]}${k}${markers[1]}`.replace(
                    new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\#-]', 'g'), '\\$&'),
                    'g'
                ),
                params[k]
            );
        });
        return target;
    }

    /**
     * Check end string with
     * @param str
     * @param end
     */
    end_with (str, end) {
        return this.is(`*${end}`, str);
    }

    /**
     * Check start string with
     * @param str
     * @param start
     */
    start_with (str, start) {
        return this.is(`${start}*`, str);
    }

    /**
     * Check has in string
     * @param str
     * @param contain
     */
    contains (str, contain) {
        return this.is(`*${contain}*`, str);
    }

    /**
     * Get dir name
     * @param path
     */
    dirname (path) {
        return path.replace(/\\/g, '/')
            .replace(/\/[^/]*\/?$/, '');
    }

    ucfirst (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Transform to camel case
     * @param str
     * @param first
     */
    camel (str, first = false) {
        return str.replace(/\-|\_/g, ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return first ? word.toUpperCase() : (index === 0 ? word.toLowerCase() : word.toUpperCase());
        }).replace(/\s+/g, '');
    }

    /**
     * Text to slug
     * @param str
     * @param separator
     */
    snake (str, separator = '_') {
        if(typeof separator == 'undefined') separator = '-';
        let flip = separator === '-' ? '_' : '-';
        str = str.replace(flip, separator);
        return str.toLowerCase()
            .replace(new RegExp('\:', 'g'), separator)
            .replace(new RegExp('\\s', 'g'), separator)
            .replace(new RegExp('\\s\\s', 'g'), separator)
            .replace(new RegExp('['+separator+separator+']+', 'g'), separator)
            .replace(new RegExp('[^a-z0-9' + separator + '\\s]', 'g'), '');
    }

    /**
     * Text to translit
     * @param str
     */
    translit (str) {
        let ru = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z', 'и': 'i',
            'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh',
            'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya'
        }, n_str = [];
        str = str.replace(/[ъь]+/g, '').replace(/й/g, 'i');
        for ( let i = 0; i < str.length; ++i ) {
            n_str.push(
                ru[ str[i] ]
                || ru[ str[i].toLowerCase() ] === undefined && str[i]
                || ru[ str[i].toLowerCase() ].replace(/^(.)/, ( match ) => { return match.toUpperCase() })
            );
        }
        return n_str.join('');
    }

    /**
     * Slubable string
     * @param str
     * @param separator
     */
    slug (str, separator = "_") {

        return this.snake(this.translit(str), separator)
    }

    /**
     * Get query value
     * @param name
     */
    query_get (name = null) {

        let match,
            pl     = /\+/g,
            search = /([^&=]+)=?([^&]*)/g,
            decode = (s) => decodeURIComponent(s.replace(pl, " ")),
            query  = window.location.search.substring(1);

        let urlParams = {};

        while (match = search.exec(query)) {

            urlParams[decode(match[1])] = decode(match[2]);
        }

        if (name) {

            return urlParams[name];
        }

        else {

            return urlParams;
        }
    }

    /**
     * Determine if a given string matches a given pattern.
     * @param pattern
     * @param text
     */
    is (pattern, text) {

        pattern = pattern
            .replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\#-]', 'g'), '\\$&')
            .replace(/\\\*/g, '.*');

        return (new RegExp(pattern + '$', 'u')).test(text);
    }

    /**
     * Trip whitespace (or other characters) from the beginning and end of a string
     * @param str
     * @param charlist
     * @returns {*}
     */
    trim (str, charlist) {
        charlist = !charlist ? ' \s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
        let re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
        return str.replace(re, '');
    }

    /**
     * Number formatter
     * @param num
     * @param decimals
     * @param dec_point
     * @param thousands_sep
     */
    number_format(num, decimals = 0, dec_point = '.', thousands_sep = ',' ) {
        let i, j, kw, kd, km;
        if( isNaN(decimals = Math.abs(decimals)) ){ decimals = 2; }
        if( dec_point === undefined ){ dec_point = ","; }
        if( thousands_sep === undefined ){ thousands_sep = "."; }
        i = parseInt(num = (+num || 0).toFixed(decimals)) + "";
        if( (j = i.length) > 3 ){ j = j % 3; } else{ j = 0; }
        km = (j ? i.substr(0, j) + thousands_sep : "");
        kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
        kd = (decimals ? dec_point + Math.abs(Number(num) - parseInt(i)).toFixed(decimals).replace(/-/, '0').slice(2) : "");
        return km + kw + kd;
    }

    /**
     * Create http query
     * @param obj
     * @param num_prefix
     * @param temp_key
     */
    http_build_query (obj, num_prefix = null, temp_key = null) {

        let output_string = []

        if (obj !== null) {

            Object.keys(obj).forEach((val) => {

                let key = val;

                num_prefix && !isNaN(Number(key)) ? key = num_prefix + key : '';

                key = encodeURIComponent(key.replace(/[!'()*]/g, escape));

                temp_key ? key = temp_key + '[' + key + ']' : '';

                if (typeof obj[val] === 'object') {

                    output_string.push(key + '=' + JSON.stringify(obj[val]))
                }

                else {

                    let value = encodeURIComponent(String(obj[val]).replace(/[!'()*]/g, escape));

                    output_string.push(key + '=' + value);
                }

            });
        }

        return output_string.join('&');
    }
}
