const fs = new (require('./helpers/fs'));
const str = new (require('./helpers/str'));
const obj = new (require('./helpers/obj'))({str});

module.exports = new class Config {
    constructor() {
        this.data = {};
        this.store = {};
    }

    setLog (program) {
        this.log = program.log.bind(program);
        return this;
    }

    load (file, store = null) {
        this.log('Loading config file: ' + file + '...');
        const dataInFile = fs.get_json_contents(file);
        if (store) {
            this.store[store] = file;
        }
        if (Object.keys(dataInFile).length) {
            this.data = Object.assign(this.data, dataInFile);
        }
        return this;
    }

    get (key, defaultValue = null) {
        const value = obj.get(key, this.data);
        if (value !== undefined) {
            return value;
        }
        return typeof defaultValue === 'function'
            ? defaultValue(this, key)
            : defaultValue;
    }

    set (key, value) {
        obj.set(key, value, this.data);
        return this;
    }

    setToStore (store, key, value) {
        const file = this.store[store];
        value = typeof value === 'function' ? value(this, key) : value;
        if (file) {
            fs.update_json(file, key, value);
        }
        this.set(key, value);
        return value;
    }
}
