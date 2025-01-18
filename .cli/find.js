module.exports = class Find extends process.Command {

    name = 'find <value>';

    description = 'Find';

    options = [
        ['-f, --file', 'Find file']
    ];

    option = {
        file: false
    };

    arg = {
        value: null
    };

    handle() {

        this.info('Searching...');

        let result = [];

        if (this.option.file) {

            result = this.findFiles(this.arg.value);

        } else {

            result = this.findInFiles(this.arg.value);
        }

        if (! result.length) {

            this.warn('Nothing found!');
        }
    }

    findFiles(fileMask) {
        const dir = this.fs.base_path();
        const files = this.fs.read_all_dir(dir);
        const result = [];
        files.forEach((file) => {
            const relativePath = file.replace(dir + '/', '');
            if (
                this.str.is(fileMask, relativePath)
                && !relativePath.startsWith('.git')
                && !relativePath.startsWith('.idea')
                && !relativePath.startsWith('node_modules')
                && !relativePath.startsWith('vendor')
            ) {
                this.info(file);
                result.push(file);
            }
        });
        return result;
    }

    findInFiles(value) {
        const dir = this.fs.base_path();
        const files = this.fs.read_all_dir(dir);
        const result = [];
        files.forEach((file) => {
            const relativePath = file.replace(dir + '/', '');
            if (
                //content.includes(value)
                !relativePath.startsWith('.git')
                && !relativePath.startsWith('.idea')
                && !relativePath.startsWith('node_modules')
                && !relativePath.startsWith('vendor')
            ) {
                const content = this.fs.get_contents(file);

                if (this.str.is(value, content)) {

                    this.info(file);
                    content.split('\n').forEach((line, n) => {
                        if (this.str.is(value, line)) {
                            this.info(`[${n+1}]  ${line}`);
                        }
                    });
                    result.push({
                        file: file,
                        findLine: content.split('\n').filter((line) => line.includes(value))
                    });
                }
            }
        });
        return result;
    }
}
