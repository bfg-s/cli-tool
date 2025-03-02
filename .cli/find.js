const fs = require('fs');
const path = require('path');

module.exports = class Find extends process.Command {

    commandName = 'find [value-in-files]';

    commandDescription = 'Find in files or find files';

    commandOptions = [
        ['-f, --file <file>', 'Select file mask to search'],
        ['-i, --ignore <pattern>', 'Ignore pattern'],
        ['-s, --max <size>', 'File max size in bytes or (1B, 1K, 1M, 1G, 1T)'],
        ['-m, --min <size>', 'File min size in bytes or (1B, 1K, 1M, 1G, 1T)'],
        ['-c, --created <date>', 'File created date'],
        ['-u, --updated <date>', 'File updated date'],
        ['-j, --json', 'Output as JSON'],
    ];

    options = {
        file: null,
        ignore: null,
        max: null,
        min: null,
        created: null,
        updated: null,
        json: false,
    };

    arguments = {
        valueInFiles: null,
    };

    matches = 0;

    fileNums = 0;

    async handle() {

        this.prepareOptions();

        let result = [];

        if (this.arguments.valueInFiles) {
            result = await this.findInFiles(this.arguments.valueInFiles);
            if (! this.options.json && result.length) {
                this.line(`Matches: `.green + this.matches);
            }
        } else {
            result = await this.findFiles(this.options.file || '*');
        }

        const endTime = Date.now();
        const time = (endTime - this.program.startTime) / 1000;

        if (! this.options.json) {

            if (! result.length) {
                this.warn('Nothing found!');
            } else {
                this.line('Files: '.green + result.length);
            }

            this.line(`Time: `.green + `${time} sec`);
        } else {
            this.line(JSON.stringify({
                result,
                dir: this.fs.base_path(),
                ...(this.arguments.valueInFiles ? {matches: this.matches} : {}),
                files: result.length,
                time,
            }, null, 2));
        }
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
                return {
                    file
                };
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
                if (this.options.file && ! this.str.is(this.options.file, relativePath)) {
                    return false;
                } else if (this.options.file) {
                    searchInFile = this.quote(this.options.file);
                }
                let linesCount = 1;
                return await this.readFileContentStream(file, (content) => {

                    if (this.str.is(value, content)) {
                        const first = `[#${++this.fileNums}]`;
                        const findRows = [];
                        const lines = content.split('\n');
                        lines.forEach((line, n) => {
                            if (this.str.is(value, line)) {
                                if (! this.options.json) {
                                    const terminalWidth = process.stdout.columns || 80;
                                    this.line(first.green, `${file}:${linesCount}`);
                                    if (lines[n-1] && String(lines[n-1]).length <= (terminalWidth - `${linesCount-1}:`.length - 1) && ! this.str.is(value, lines[n-1])) {
                                        this.line(`${linesCount-1}|`, `${lines[n-1]}`);
                                    }
                                    const lineNum = `${linesCount}>`;
                                    if (searchInContent) line = this.trimTextToTerminalWidth(line, searchInContent, lineNum.length+1);
                                    this.line(lineNum.green, `${this.replaceToColor(line, searchInContent, true)}`);
                                    if (lines[n+1] && String(lines[n+1]).length <= (terminalWidth - `${linesCount+1}:`.length - 1) && ! this.str.is(value, lines[n+1])) {
                                        this.line(`${linesCount+1}|`, `${lines[n+1]}`);
                                    }
                                } else {
                                    this.replaceToColor(line, searchInContent, true);
                                }
                                findRows.push({line: n, content: line});
                            }
                            linesCount++;
                        });
                        return findRows.length ? {
                            file, lines: findRows
                        } : false;
                    }
                    return false;
                });
            }
        });
    }

    trimTextToTerminalWidth(text, centerWord, correct = 0) {
        centerWord = centerWord.split('|')[0];
        const terminalWidth = (process.stdout.columns || 80) - correct;
        const ellipsis = '…';

        // Если текст уже вмещается — просто возвращаем его
        if (text.length <= terminalWidth) {
            return text;
        }

        const centerIndex = text.indexOf(centerWord);
        if (centerIndex === -1) {
            throw new Error(`Слово "${centerWord}" не найдено в строке.`);
        }

        const halfWidth = Math.floor(terminalWidth / 2);
        const leftPart = text.slice(0, centerIndex);
        const rightPart = text.slice(centerIndex + centerWord.length);

        let leftTrimmed = leftPart;
        let rightTrimmed = rightPart;

        // Сколько символов остаётся на боковые части после учёта слова и троеточий
        const availableSpace = terminalWidth - centerWord.length;
        const halfAvailable = Math.floor(availableSpace / 2);

        if (leftPart.length > halfAvailable) {
            leftTrimmed = ellipsis + leftPart.slice(-halfAvailable + 1);
        }
        if (rightPart.length > halfAvailable) {
            rightTrimmed = rightPart.slice(0, halfAvailable - 1) + ellipsis;
        }

        return leftTrimmed + centerWord + rightTrimmed;
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
                        if (this.options.max && stat.size >= this.options.max) {
                            return null;
                        }
                        if (this.options.min && stat.size <= this.options.min) {
                            return null;
                        }
                        if (this.options.created && (stat.birthtime <= this.options.created.from || stat.birthtime >= this.options.created.to)) {
                            return null;
                        }
                        if (this.options.updated && (stat.mtime <= this.options.updated.from || stat.mtime >= this.options.updated.to)) {
                            return null;
                        }
                        const r = await cb(name, stat);
                        return r ? [r] : null;
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
            let resolveData = false;
            stream.on('data', (chunk) => {
                if (chunk instanceof Buffer) {
                    chunk = chunk.toString('utf8');
                }
                const r = data(chunk);
                if (r) resolveData = r;
            });
            stream.on('end', () => resolve(resolveData));
            stream.on('error', reject);
        });
    }

    prepareOptions () {
        if (this.options.max) this.options.max = this.parseSizeToBytes(this.options.max);
        if (this.options.min) this.options.min = this.parseSizeToBytes(this.options.min);
        if (this.options.created) {
            const created = this.options.created.split(' - ');
            this.options.created = {
                from: this.parseRelativeDate(created[0]),
                to: created[1] ? this.parseRelativeDate(created[1]) : this.parseRelativeDate(created[0]),
            };
            if (! created[1]) {
                this.options.created.to.setHours(23, 59, 59);
            }
        }
        if (this.options.updated) {
            const updated = this.options.updated.split(' - ');
            this.options.updated = {
                from: this.parseRelativeDate(updated[0]),
                to: updated[1] ? this.parseRelativeDate(updated[1]) : this.parseRelativeDate(updated[0]),
            };
            if (! updated[1]) {
                this.options.updated.to.setHours(23, 59, 59);
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
                    this.exit(`Unsupported unit: ${unit}`);
            }

            return result;
        }

        this.exit(`Invalid date format: ${input}`);
    }

    parseSizeToBytes(sizeStr) {
        const units = { B: 1, K: 1024, M: 1024 ** 2, G: 1024 ** 3, T: 1024 ** 4 };
        const match = /^(\d+(?:\.\d+)?)([BKMGTP]?)$/i.exec(sizeStr.trim());

        if (!match) {
            this.exit(`Invalid size format: ${sizeStr}`);
        }

        const [ , value, unit ] = match;
        const bytes = parseFloat(value) * (units[unit.toUpperCase()] || 1);

        return Math.round(bytes);
    }

    hasIgnoreCase(text) {
        if (this.options.ignore) {
            const ignore = String(this.options.ignore).split('|');
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
        if (! this.options.json) {
            this.info(first.green + this.replaceToColor(file, search));
        }
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
