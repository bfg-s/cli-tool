const Table = require('cli-table3');
const loading =  require('loading-cli');
const prompts = require('prompts');
const { exec, spawn } = require('child_process');
const path = require('path');
const moment = require('moment');
const lodash = require('lodash');
const fs = require('./helpers/fs');
const obj = require('./helpers/obj');
const str = require('./helpers/str');
const num = require('./helpers/num');
const git = require('./helpers/git');

const PhpBuilder = require('bfg-js-comcode');

function promiseFromChildProcess(child, out = []) {
    return new Promise(function (resolve, reject) {
        child.addListener("error", reject);
        child.addListener("exit", resolve);
        child.stdout.on("data", (d) => out.push(d.trim().split(/\n/g)));
    }).catch((e) => {
        console.error(e);
        process.exit(1);
    });
}

module.exports = class Command {

    arg = {};

    option = {};

    /**
     * The argument may be <required> or [optional] or <dirs...> for array.
     * @returns {string}
     */
    get name() {
        return this.constructor.name.toLowerCase();
    }

    get description() {
        return 'Unknown command';
    }

    /**
     * Format: [
     *     [flags, description, defaultValue],
     *     ...
     * ]
     * @returns {*[]}
     */
    get options() {
        return [];
    }

    get requiredOptions() {
        return [];
    }

    get required() {
        return {};
    }

    get verbose() {
        return this.program.opts().verbose;
    }

    get quiet() {
        return this.program.opts().quiet;
    }

    constructor(program, config, commandFile, commandFindPath) {
        this.program = program;
        this.config = config;
        this.pwd = process.cwd();
        this.path = path;
        this.moment = moment;
        this.lodash = lodash;

        this.fs = new fs(this);
        this.str = new str(this);
        this.obj = new obj(this);
        this.num = new num(this);
        this.git = new git(this);

        this.commandFile = commandFile;
        this.commandFilePath = this.fs.dirname(commandFile);
        this.commandFindPath = commandFindPath;
    }

    handle () {

    }

    stub (stub, params = {}) {

        const file = this.fs.path(this.commandFilePath, 'stubs', `${stub}.stub`);

        if (!this.fs.is_file(file)) {
            this.exit(`File template [${file}] not found!`);
        }

        return this.str.replace_tags(
            this.fs.get_contents(file), params
        );
    }

    async put_stub (file, stub, params = {}) {

        return this.fs.put_contents(
            file,
            this.stub(stub, params)
        );
    }

    phpBuilder (file) {
        return new PhpBuilder(file);
    }

    success (text) {
        this.process(text.green).start().succeed();
        return this;
    }

    fail (text) {
        this.process(text.red).start().fail();
        return this;
    }

    warn (text) {
        this.process(text.yellow).start().warn();
        return this;
    }

    async signed_exec (title, command, dir = this.pwd) {
        command = Array.isArray(command) ? command.join(' ') : command;
        let out = [],
            process = this.process().start(title);

        try {
            await this.exec(command, out, dir);
            process.succeed();
        } catch (e) {
            process.fail(e.message);
        }

        return out.flat();
    }

    async exec (command, out = [], dir = this.pwd) {
        this.log(`Run cli command: ${command}`, 1);
        return await promiseFromChildProcess(exec(command, {cwd: dir}), out);
    }

    async spawn (command, args = [], dir = this.pwd) {
        this.log(`Run cli command: ${command} ${args.join(' ')}`, 1);
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {stdio: 'inherit', cwd: dir});

            let stdout = '';
            let stderr = '';

            if (child.stdout) {
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
            }

            if (child.stderr) {
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
            }

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`Process exited with code ${code}: ${stderr}`));
                }
            });

            child.on('error', (err) => {
                reject(err);
            });
        });
    }

    async cmd (command, dir = this.pwd) {
        let out = [];
        this.log(`Run cli command: ${command}`, 1);
        await this.exec(command, out, dir);
        return out.flat();
    }

    async ask (question, defaultValue = null, validate) {
        let result = await this.prompts({
            type: 'text',
            name: 'value',
            message: question,
            initial: defaultValue,
            validate: validate
        });
        return result.value
    }

    async confirm (message, defaultValue = true, active = 'yes', inactive = 'no') {
        let result = await this.prompts({
            type: 'toggle',
            name: 'value',
            message: message,
            initial: defaultValue,
            active, inactive
        });
        return result.value
    }

    async prompts (options) {
        return prompts(options);
    }

    process (options = {}) {
        return loading(options)
    }

    tbl (options = {}) {
        return new Table(options);
    }

    table (rows, options = {}) {
        if (!this.quiet) {
            let table = this.tbl(options);
            table.push(...rows);
            console.log(table.toString());
        }
        return this;
    }

    scheme (rows, options = {}) {
        options.chars = { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '',
            'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': '',
            'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': '',
            'right': '' , 'right-mid': '' , 'middle': ' '};
        options.style = { 'padding-left': 0, 'padding-right': 0 };
        this.table(rows, options);
        return this;
    }

    comment (...data) {
        data = data.map(p => typeof p === 'string' ? (p.yellow) : p);
        this.line(...data);
        return this;
    }

    info (...data) {
        data = data.map(p => typeof p === 'string' ? (p.green) : p);
        this.line(...data);
        return this;
    }

    error (...data) {
        data = data.map(p => typeof p === 'string' ? (p.white.bgRed) : p);
        this.line(...data);
        return this;
    }

    exit (message, code = 0) {

        if (message) {
            this.error(message);
        }

        process.exit(code);
    }

    line (...data) {
        if (!this.quiet) {
            console.log(...data);
        }
        return this;
    }

    log (text, verbose = 1) {
        if (this.verbose >= verbose) {
            this.line(text);
        }
        return this;
    }
}
