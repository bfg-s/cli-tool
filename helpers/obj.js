module.exports = class Obj {

    constructor(command) {
        this.command = command;
    }

    filter (obj, eq) {
        let result = [];
        this.each(obj, (item, key) => {
            if (typeof eq === 'function') {
                if (eq(item, key)) result.push(item);
            } else if (Array.isArray(eq)) {
                if (item[eq[0]] == eq[1]) result.push(item);
            } else {
                if (item == eq) result.push(item);
            }
        });
        return result;
    }

    find (obj, eq) {

        return this.first(this.filter(obj, eq));
    }

    get_methods (obj) {
        let res = [];
        for(let m in obj) {
            res.push(m);
        }
        return res;
    }

    get_element_attrs (el) {
        let result = {};
        if (el) {
            [].slice.call(el.attributes ?? []).map((attr) => {
                result[attr.name] = attr.value;
            });
        }
        return result;
    }

    /**
     * Make observiable object
     * @param target
     * @param events
     * @param revocable
     */
    observer (target = {}, events = {}, revocable = false) {
        return revocable ? new Proxy(target, events) :
            Proxy.revocable(target, events);
    }

    has (str, obj) {
        return String(str)
            .split('.')
            .reduce((o,i)=>o !== undefined ? o[i] : undefined, obj) !== undefined;
    }

    /**
     * Get by dots
     * @param str
     * @param obj
     * @param defaultValue
     */
    get (str, obj, defaultValue = undefined) {
        return String(str).split('.').reduce((obj, i) => {
            return obj && obj[i] !== undefined ? obj[i] : defaultValue;
        }, obj);
    }

    /**
     * Set by dots
     * @param str
     * @param value
     * @param obj
     */
    set (str, value, obj) {
        let levels = String(str).split('.');
        let max_level = levels.length - 1;
        let target = obj;
        levels.some(function (level, i) {
            if (typeof level === 'undefined') {
                return true;
            }
            if (i === max_level) {
                target[level] = value;
            } else {
                let obj = target[level] || {};
                target[level] = obj;
                target = obj;
            }
        });
    }

    /**
     * Each object or array
     * @param target
     * @param callback
     */
    each(target, callback) {
        let resultTarget = Array.isArray(target) ? [] : {};
        Object.keys(target).map((k) => resultTarget[k] = callback(target[k], k));
        return resultTarget;
    }

    /**
     * Get data with needle start
     * @param target
     * @param start
     */
    get_start_with (target, start) {
        let result = null;
        start = start.replace(/\*/g, '00110011');
        Object.keys(target).map((b) => {

            if (!result && this.command.str.start_with(target[b].replace(/\*/g, '00110011'), start)) {
                result = target[b];
            }
        });
        return result;
    }

    /**
     * Get data with needle end
     * @param target
     * @param end
     */
    get_end_with (target, end) {
        let result = null;
        Object.keys(target).map((b) => {
            if (!result && this.command.str.end_with(target[b], end)) {
                result = target[b];
            }
        });
        return result;
    }

    /**
     * Flip object
     * @param trans
     */
    flip(trans) {
        let key, tmp_ar = {};

        for ( key in trans )
        {
            if ( trans.hasOwnProperty( key ) )
            {
                tmp_ar[trans[key]] = key;
            }
        }

        return tmp_ar;
    }

    /**
     * Get object or array a first key
     * @param target
     */
    first_key (target) {

        let keys = Object.keys(target);
        return 0 in keys ? keys[0] : null;
    }

    /**
     * Get object or array a last key
     * @param target
     */
    last_key (target) {

        let keys = Object.keys(target);
        let last_index = keys.length - 1;
        return last_index in keys ? keys[last_index] : null;
    }

    /**
     * Get object or array a first value
     * @param target
     */
    first (target) {

        let key = this.first_key(target);

        return key ? target[key] : null;
    }

    /**
     * Get object or array a last value
     * @param target
     */
    last (target) {

        let key = this.last_key(target);

        return key ? target[key] : null;
    }

    /**
     * Merge recursive objects
     * @param target
     * @param sources
     */
    merge_recursive(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) {
                        Object.assign(target, { [key]: {} });
                    }else{
                        target[key] = Object.assign({}, target[key])
                    }
                    this.merge_recursive(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.merge_recursive(target, ...sources);
    }

    /**
     * is Class
     * @param data
     */
    isClass (data) {
        let str = String(data);
        return (str === "[object Object]" &&
            typeof data === 'function') || /^class\s.*/.test(str.trim());
    }

    /**
     * Is Array
     * @param obj
     */
    isArray (obj) {
        return Array.isArray(obj);
    }

    /**
     * Is empty object
     * @param val
     */
    isEmptyObject(val) {
        return Object.keys(val).length === 0
    }

    /**
     * Is Object
     * @param val
     */
    isObject (val) {
        return Object.prototype.toString.call(val) === '[object Object]'
    }

    /**
     * Is Array or Object
     * @param val
     */
    isArrayOrObject (val) {
        return Object(val) === val
    }

    /**
     * Make dot object
     * @param obj
     * @param tgt
     * @param path
     * @param useBrackets
     * @param keepArray
     * @param separator
     */
    dot (
        obj,
        tgt = {},
        path = [],
        useBrackets = false,
        keepArray = false,
        separator = "."
    ) {

        Object.keys(obj).forEach(
            (key) => {

                let index = this.isArray && useBrackets ? '[' + key + ']' : key;

                if (
                    this.isArrayOrObject(obj[key]) &&
                    ((this.isObject(obj[key]) && !this.isEmptyObject(obj[key])) ||
                        (this.isArray(obj[key]) && !keepArray && obj[key].length !== 0))
                ) {
                    if (this.isArray && useBrackets) {

                        let previousKey = path[path.length - 1] || '';

                        return this.dot(
                            obj[key],
                            tgt,
                            path.slice(0, -1).concat(previousKey + index)
                        )
                    } else {

                        return this.dot(obj[key], tgt, path.concat(index))
                    }
                } else {

                    if (this.isArray && useBrackets) {

                        tgt[path.join(separator).concat('[' + key + ']')] = obj[key]

                    } else {

                        tgt[path.concat(index).join(separator)] = obj[key]
                    }
                }
            }
        );

        return tgt
    }
}
