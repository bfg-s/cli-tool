const fs = new (require('./helpers/fs'));

module.exports = new class Config {
    constructor() {
        this.data = {};

    }

    load (file) {
        const dataInFile = fs.get_json_contents(file);
        if (Object.keys(dataInFile).length) {
            this.data = Object.assign(this.data, dataInFile);
        }
        return this;
    }

    get (key, defaultValue = null) {
        return this.data[key] || defaultValue;
    }

    set (key, value) {
        this.data[key] = value;
        return this;
    }
}
