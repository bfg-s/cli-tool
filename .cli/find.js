const fs = require('fs');
const path = require('path');

module.exports = class Find extends process.Command {

    name = 'find [value]';

    description = 'Find in files or find files';

    options = [
        ['-f, --file <file>', 'Select file mask to search'],
        ['-i, --ignore <pattern>', 'Ignore pattern'],
        ['-s, --max <size>', 'File max size in bytes or (1B, 1K, 1M, 1G, 1T)'],
        ['-m, --min <size>', 'File min size in bytes or (1B, 1K, 1M, 1G, 1T)'],
        ['-c, --created <date>', 'File created date'],
        ['-u, --updated <date>', 'File updated date'],
    ];

    option = {
        file: null,
        ignore: null,
        max: null,
        min: null,
        created: null,
        updated: null,
    };

    arg = {
        value: null,
    };

    matches = 0;

    fileNums = 0;

    async handle() {

        this.prepareOptions();

        let result = [];

        if (this.arg.value) {
            result = await this.findInFiles(this.arg.value);
            console.log(`Matches: `.green + this.matches);
        } else {
            result = await this.findFiles(this.option.file || '*');
        }

        if (! result.length) {
            this.warn('Nothing found!');
        } else {
            console.log('Files: '.green + result.length);
        }

        const endTime = Date.now();
        const time = (endTime - this.program.startTime) / 1000;
        console.log(`Time: `.green + `${time} sec`);
    }

    async findFiles(fileMask) {
        const dir = this.fs.base_path();
        const searchInFile = this.quote(fileMask);
        return await this.read_all_dir_promise(dir, async (file, stat) => {
            const relativePath = file.replace(dir + path.sep, '');
            if (
                !relativePath.startsWith('.git')
                && ! this.hasIgnoreCase(file)
                && this.str.is(fileMask, relativePath)
            ) {
                this.fileLine(file, searchInFile);
                return true;
            }
            return false;
        });
    }

    async findInFiles(value) {
        const dir = this.fs.base_path();
        const searchInContent = this.quote(value);
        return await this.read_all_dir_promise(dir, async (file, stat) => {
            const relativePath = file.replace(dir + path.sep, '');

            if (
                !relativePath.startsWith('.git')
                && ! this.hasIgnoreCase(file)
            ) {
                let searchInFile = null;
                if (this.option.file && ! this.str.is(this.option.file, relativePath)) {
                    return false;
                } else if (this.option.file) {
                    searchInFile = this.quote(this.option.file);
                }
                return await this.readFileContentStream(file, (content) => {

                    if (this.str.is(value, content)) {

                        let lenFileLine = this.fileLine(file, searchInFile);
                        content.split('\n').forEach((line, n) => {
                            line = line.trim();
                            if (this.str.is(value, line)) {
                                n++;
                                const len = String(n).length;
                                let minLen = 6;
                                if (len > minLen) {minLen = 12;}
                                if (len > minLen) {minLen = 18;}
                                if (len > minLen) {minLen = 24;}
                                const spacesLen = minLen - len;
                                const spaces = ` `.repeat(spacesLen > 0 ? spacesLen : 1);
                                const num = `[:${n}]`;
                                this.line(num.green + spaces + `${this.replaceToColor(line, searchInContent, true)}`);
                            }
                        });
                        this.line('-'.repeat(lenFileLine).blue);
                        return true;
                    }
                    return false;
                });
            }
        });
    }

    async read_all_dir_promise(dir, cb) {
        try {
            const stat = await fs.promises.stat(dir);
            if (stat.isDirectory() && !stat.isSymbolicLink()) {
                const files = await fs.promises.readdir(dir);
                const allFiles = await Promise.all(
                    files.map(async (file) => {

                        if (String(file).endsWith('.DS_Store')) {
                            return null;
                        }

                        const name = path.join(dir, file);
                        const stat = await fs.promises.stat(name);

                        if (stat.isDirectory() && !stat.isSymbolicLink()) {
                            try {
                                return await this.read_all_dir_promise(name, cb);
                            } catch (e) {
                                return null;
                            }
                        }
                        if (this.option.max && stat.size >= this.option.max) {
                            return null;
                        }
                        if (this.option.min && stat.size <= this.option.min) {
                            return null;
                        }
                        if (this.option.created && (stat.birthtime <= this.option.created.from || stat.birthtime >= this.option.created.to)) {
                            return null;
                        }
                        if (this.option.updated && (stat.mtime <= this.option.updated.from || stat.mtime >= this.option.updated.to)) {
                            return null;
                        }
                        const r = await cb(name, stat);
                        return r ? [name] : null;
                    })
                );
                return allFiles.filter(Boolean).flat().filter(Boolean);
            }
            return [];
        } catch (err) {
            return [];
        }
    }

    async readFileContentStream(filePath, data) {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
            let isTrue = false;
            stream.on('data', (chunk) => {
                if (chunk instanceof Buffer) {
                    chunk = chunk.toString('utf8');
                }
                const r = data(chunk);
                if (r) isTrue = true;
            });
            stream.on('end', () => resolve(isTrue));
            stream.on('error', reject);
        });
    }

    prepareOptions () {
        if (this.option.max) this.option.max = this.parseSizeToBytes(this.option.max);
        if (this.option.min) this.option.min = this.parseSizeToBytes(this.option.min);
        if (this.option.created) {
            const created = this.option.created.split(' - ');
            this.option.created = {
                from: this.parseRelativeDate(created[0]),
                to: created[1] ? this.parseRelativeDate(created[1]) : this.parseRelativeDate(created[0]),
            };
            if (! created[1]) {
                this.option.created.to.setHours(23, 59, 59);
            }
        }
        if (this.option.updated) {
            const updated = this.option.updated.split(' - ');
            this.option.updated = {
                from: this.parseRelativeDate(updated[0]),
                to: updated[1] ? this.parseRelativeDate(updated[1]) : this.parseRelativeDate(updated[0]),
            };
            if (! updated[1]) {
                this.option.updated.to.setHours(23, 59, 59);
            }
        }
    }

    parseRelativeDate(input) {
        const now = new Date();

        const normalized = input.trim().toLowerCase();

        switch (normalized) {
            case 'now':
                return now;
            case 'today':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'yesterday':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            case 'tomorrow':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            case 'endofday':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            case 'startofday':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        }

        const parsedDate = new Date(input);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }

        const match = normalized.match(/^([+-]?\d+)\s*(day|week|month|year|hour|minute|second)s?$/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];

            const result = new Date(now);

            switch (unit) {
                case 'day':
                    result.setDate(result.getDate() + value);
                    break;
                case 'week':
                    result.setDate(result.getDate() + value * 7);
                    break;
                case 'month':
                    result.setMonth(result.getMonth() + value);
                    break;
                case 'year':
                    result.setFullYear(result.getFullYear() + value);
                    break;
                case 'hour':
                    result.setHours(result.getHours() + value);
                    break;
                case 'minute':
                    result.setMinutes(result.getMinutes() + value);
                    break;
                case 'second':
                    result.setSeconds(result.getSeconds() + value);
                    break;
                default:
                    throw new Error(`Unsupported unit: ${unit}`);
            }

            return result;
        }

        this.exit(`Invalid date format: ${input}`);
    }

    parseSizeToBytes(sizeStr) {
        const units = { B: 1, K: 1024, M: 1024 ** 2, G: 1024 ** 3, T: 1024 ** 4 };
        const match = /^(\d+(?:\.\d+)?)([BKMGTP]?)$/i.exec(sizeStr.trim());

        if (!match) {
            throw new Error(`Invalid size format: ${sizeStr}`);
        }

        const [ , value, unit ] = match;
        const bytes = parseFloat(value) * (units[unit.toUpperCase()] || 1);

        return Math.round(bytes);
    }

    hasIgnoreCase(text) {
        if (this.option.ignore) {
            const ignore = String(this.option.ignore).split('|');
            for (let i of ignore) {
                if (! i.includes('*')) {
                    i = `*${i}*`;
                }
                if (this.str.is(i, text)) {
                    return true;
                }
            }
        }
        return false;
    }

    fileLine(file, search) {
        const first = `[#${++this.fileNums}] `;
        this.info(first.green + this.replaceToColor(file, search));
        return String(first+file).length;
    }

    quote(str) {
        return this.str.trim(String(str).replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!>|:\\#]', 'g'), '\\$&')
            .replace(/\\\*/g, '|'), '|');
    }

    replaceToColor(str, value, countMatches = false) {
        if (! value) {
            return str;
        }
        const reg = new RegExp(`(${value})`, 'g');
        return String(str).replace(reg, (m) => {
            if (countMatches) this.matches++;
            return m.yellow;
        });
    }
}
