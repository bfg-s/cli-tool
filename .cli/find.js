const fs = require('fs');
const path = require('path');

module.exports = class Find extends process.Command {

    name = 'find [value]';

    description = 'Find in files or find files';

    options = [
        ['-f, --file <file>', 'Select file mask to search'],
    ];

    option = {
        file: null,
    };

    arg = {
        value: null,
    };

    matches = 0;

    fileNums = 0;

    async handle() {

        let result = [];

        if (this.option.file && ! this.arg.value) {

            result = await this.findFiles(this.option.file);

        } else {

            result = await this.findInFiles(this.arg.value);
            this.info(`Matches: `.green + this.matches);
        }

        if (! result.length) {
            this.warn('Nothing found!');
        } else {
            this.line('Files: '.green + result.length);
        }

        const endTime = Date.now();
        const time = (endTime - this.program.startTime) / 1000;
        this.info(`Time: `.green + `${time} sec`);
    }

    async findFiles(fileMask) {
        const dir = this.fs.base_path();
        const searchInFile = this.quote(fileMask);
        return await this.read_all_dir_promise(dir, async (file) => {
            const relativePath = file.replace(dir + path.sep, '');
            if (
                !relativePath.startsWith('.git')
                && !relativePath.startsWith('.idea')
                && !relativePath.startsWith('node_modules')
                && !relativePath.startsWith('vendor')
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
        return await this.read_all_dir_promise(dir, async (file) => {
            const relativePath = file.replace(dir + path.sep, '');
            if (
                !relativePath.startsWith('.git')
                && !relativePath.startsWith('.idea')
                && !relativePath.startsWith('node_modules')
                && !relativePath.startsWith('vendor')
            ) {
                let searchInFile = null;
                if (this.option.file && ! this.str.is(this.option.file, relativePath)) {
                    return ;
                } else if (this.option.file) {
                    searchInFile = this.quote(this.option.file);
                }
                return await this.readFileContentStream(file, (content) => {

                    if (this.str.is(value, content)) {

                        let lenFileLine = this.fileLine(file, searchInFile);
                        content.split('\n').forEach((line, n) => {
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
                        const name = path.join(dir, file);
                        const stat = await fs.promises.stat(name);
                        if (stat.isDirectory() && !stat.isSymbolicLink()) {
                            try {
                                return await this.read_all_dir_promise(name, cb);
                            } catch (e) {
                                return null;
                            }
                        }
                        const r = await cb(name);
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
