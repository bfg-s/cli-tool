const {execSync} = require("child_process");
const fs = new (require('./helpers/fs'));
const str = new (require('./helpers/str'));
const obj = new (require('./helpers/obj'))({str});
const keyVersion = process.version.replace(/\./g, '-');

module.exports = new class Config {
    constructor() {
        this.data = {};
        this.store = {};

        this.NPM_GLOBAL_PATH = `npm.${keyVersion}.global-path`;
        this.NPM_GLOBAL_HASH = `npm.${keyVersion}.global-hash`;
        this.NPM_INCLUDED_DIRS = `npm.${keyVersion}.included-dirs`;
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
        let value = obj.get(key, this.data);
        if (value !== undefined) {
            const matches = /^\$\{[E|e][N|n][V|v]\.([a-zA-Z0-9_\-]+)(?:\s*([|]{2})\s*(.*)?)?}$/gm.exec(value);
            if (matches) {
                value = process.env[matches[1]] || matches[3] || null;
            }
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

    has (key) {
        return obj.has(key, this.data);
    }

    delete (key) {
        obj.delete(key, this.data);
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

    deleteFromStore (store, key) {
        const file = this.store[store];
        if (file) {
            fs.delete_json_key(file, key);
        }
        this.delete(key);
        return this;
    }

    getNpmGlobalPath () {
        return this.get(this.NPM_GLOBAL_PATH, () => {
            return this.setToStore('tmp', this.NPM_GLOBAL_PATH, () => {
                return execSync(`npm root -g`).toString().trim();
            });
        });
    }

    getNpmGlobalHash (live = false) {
        if (live) {
            const globalPath = this.getNpmGlobalPath();
            const dirs = fs.read_dir(globalPath).filter(dir => {
                return fs.is_dir(fs.path(globalPath, dir, '.cli'));
            }).join('|');
            return str.md5(dirs);
        }
        return this.get(this.NPM_GLOBAL_HASH, this.updateGlobalHash);
    }

    getIncludedDirs () {
        return this.get(this.NPM_INCLUDED_DIRS, this.updateIncludedPaths);
    }

    updateGlobalHash () {
        return this.setToStore('tmp', this.NPM_GLOBAL_HASH, () => {
            return this.getNpmGlobalHash(true);
        });
    }

    updateIncludedPaths () {
        const globalPath = this.getNpmGlobalPath();
        const globalExtends = fs.read_dir(this.getNpmGlobalPath());
        const rootDirName = this.get('root.dir-name');
        const extendsDirs = [];
        for (const dir of globalExtends) {
            const path = fs.path(globalPath, dir, rootDirName);
            if (dir !== 'bfg-cli-tool' && fs.is_dir(path)) {
                extendsDirs.push(
                    fs.path(dir, rootDirName)
                );
            }
        }
        return this.setToStore('tmp', this.NPM_INCLUDED_DIRS, extendsDirs);
    }
}
