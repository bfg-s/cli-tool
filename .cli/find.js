const fs = require('fs');
const path = require('path');

module.exports = class Find extends process.Command {

    name = 'find <value> [file]';

    description = 'Find in files or find files';

    options = [
        ['-f, --find-file', 'Find file']
    ];

    option = {
        findFile: false
    };

    arg = {
        value: null,
        file: null
    };

    async handle() {

        const startTime = Date.now();

        this.info('Searching...');

        let result = [];

        if (this.option.findFile && ! this.arg.file) {

            result = await this.findFiles(this.arg.value);

        } else {

            result = await this.findInFiles(this.arg.value);
        }

        const endTime = Date.now();
        const time = (endTime - startTime) / 1000;
        this.success(`Time: ${time} sec`);

        if (! result.length) {
            this.warn('Nothing found!');
        } else {
            this.success('Found results: ' + result.length);
        }
    }

    quote(str) {
        return this.str.trim(String(str).replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!>|:\\#]', 'g'), '\\$&')
            .replace(/\\\*/g, '|'), '|');
    }

    async findFiles(fileMask, succeed) {
        const dir = this.fs.base_path();
        const vals = this.quote(fileMask);
        return await this.read_all_dir_promise(dir, async (file) => {
            const relativePath = file.replace(dir + '/', '');
            if (
                this.str.is(fileMask, relativePath)
                && !relativePath.startsWith('.git')
                && !relativePath.startsWith('.idea')
                && !relativePath.startsWith('node_modules')
                && !relativePath.startsWith('vendor')
            ) {
                const reg = new RegExp(`(${vals})`, 'g');
                this.info(file.replace(reg, (m) => m.yellow));
                return true;
            }
            return false;
        });
    }

    async findInFiles(value) {
        const dir = this.fs.base_path();
        const vals = this.quote(value);
        return await this.read_all_dir_promise(dir, async (file) => {
            const relativePath = file.replace(dir + '/', '');
            if (
                !relativePath.startsWith('.git')
                && !relativePath.startsWith('.idea')
                && !relativePath.startsWith('node_modules')
                && !relativePath.startsWith('vendor')
            ) {
                let search = null;
                if (this.arg.file && ! this.str.is(this.arg.file, relativePath)) {
                    return ;
                } else if (this.arg.file) {
                    search = this.quote(this.arg.file);
                }
                return await this.readFileContentStream(file, (content) => {

                    if (this.str.is(value, content)) {

                        if (search) {
                            const reg = new RegExp(`(${search})`, 'g');
                            this.info(file.replace(reg, (m) => m.yellow));
                        } else {
                            this.info(file);
                        }
                        content.split('\n').forEach((line, n) => {
                            if (this.str.is(value, line)) {
                                const reg = new RegExp(`(${vals})`, 'g');
                                this.info(`[${n+1}]  ${line.replace(reg, (m) => m.yellow)}`);
                            }
                        });
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
}
