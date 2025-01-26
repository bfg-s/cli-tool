export interface Command {
    moment(): moment.Moment;
    lodash: {};
    path: {
        join: (...paths: string[]) => string;
    };
    pwd: string;
    program: Program;
    config: Config,
    fs: {
        copy: (src: string, dest: string) => void;
        statistic: (path: string) => {};
        base_path: (...path: string[]) => string;
        dirname: (path: string) => string;
        read_all_dir: (dir: string) => any[];
        read_dir: (dir: string) => string[];
        stat: (path: string) => {};
        exists: (path: string) => boolean;
        unlink: (path: string) => void;
        is_file: (file: string) => boolean;
        is_link: (path: string) => boolean;
        is_dir: (dir: string) => boolean;
        mkdir: (path: string) => string|undefined;
        put_contents: (file: string, content: string) => void;
        append_contents: (path: string, data: string, options?: {}) => void;
        get_contents: (file: string) => string;
        get_json_contents: (file: string, defaultJson?: any) => any;
        update_json: (file: string, key: string, value: any) => void;
        delete_json_key: (file: string, key: string) => void;
        pathinfo: (path: string, options: string|number) => any;
        basename: (path: string, suffix?: string) => string;
        path: (...paths: string[]) => string;
    };
    obj: {
        filter: (obj: any, eq: any) => any[];
        find: (obj: any, eq: any) => any;
        get_methods: (obj: any) => any[];
        get_element_attrs: (el: any) => object;
        observer: (target: any, events: any, revocable: boolean) => any;
        has: (str: string, obj: any) => any;
        get: (str: string, obj: any, defaultValue?: any) => any;
        set: (str: string, value: any, obj: any) => void;
        delete: (str: string, obj: any) => void;
        each: (target: any, callback: () => {}) => any;
        get_start_with: (target: any, start: string) => any;
        get_end_with: (target: any, end: string) => any
        flip: (trans: object) => object;
        first_key: (target: object) => string|number|null;
        last_key: (target: object) => string|number|null;
        first: (target: object) => any;
        last: (target: object) => any;
        merge_recursive: (target: object, ...sources: object[]) => any;
        dot: (obj: any, tgt: any, path: any[], useBrackets: boolean, keepArray: boolean, separator: string) => any;
        isClass: (data: any) => boolean;
        isArray: (obj: any) => boolean;
        isEmptyObject: (val: any) => boolean;
        isObject: (val: any) => boolean;
        isArrayOrObject: (val: any) => boolean;
    };
    str: {
        to_nodes: (html: string) => any;
        preg_match_all: (pattern: any, str: string) => any;
        replace_tags: (target: string, params: object, markers: string|string[]) => string;
        end_with: (str: string, end: string) => boolean;
        start_with: (str: string, start: string) => boolean;
        contains: (str: string, contain: string) => boolean;
        dirname: (path: string) => string;
        ucfirst: (str: string) => string;
        camel: (str: string, first: boolean) => string;
        snake: (str: string, separator: string) => string;
        translit: (str: string) => string;
        slug: (str: string, separator: string) => string;
        query_get: (name: string) => any;
        is: (pattern: string, text: string) => boolean;
        trim: (str: string, charlist: string) => string;
        number_format: (num: number, decimals: number, dec_point: string, thousands_sep: string) => string;
        http_build_query: (obj: object, num_prefix: string, temp_key: string) => string;
    };
    num: {
        isNumber: (num: any) => boolean;
    };
    git: Git;

    commandFile: string;
    commandFilePath: string;
    commandFindPath: string;

    arg: object,
    option: object,
    name: string;
    description: string;
    options: object;
    requiredOptions: object;
    required: object;
    verbose: boolean;
    quiet: boolean;

    phpBuilder (file: string): PhpBuilder;

    stub (stub: string, params: object): string;
    put_stub (file: string, stub: string, params?: object): Promise<void>;
    js_ext (dir?: string): "js" | "cjs";
    success (text: string): this;
    fail (text: string): this;
    warn (text: string): this;
    signed_exec (title: string, command: string, dir: string): Promise<string[]>;
    exec (command: string, out: string[], dir: string): Promise<void>;
    cmd (command: string, dir: string): Promise<string[]>;
    ask (question: string, defaultValue?: string, validate?: any): Promise<string>;
    confirm (message: string, defaultValue: boolean, active: string, inactive: string): Promise<boolean>;
    prompts (options: any): Promise<object>;
    sleep (ms?: number): Promise<void>;
    process (options: loading.Options|string): loading.Loading;
    tbl (options: object): any;
    table (rows: any[], options: object): this;
    scheme (rows: any[], options: object): this;
    comment (...data: any[]): this;
    info (...data: any[]): this;
    error (...data: any[]): this;
    exit (message: string, code: number): void;
    write (data: Uint8Array|string): this;
    line (...data: any[]): this;
    log (text: string, verbose: number): this;
}

declare interface Config {
    load (file: string, store?: string): Config;
    get (key: string, defaultValue?: any): any;
    set (key: string, value: any): void;
    has (key: string): boolean;
    setToStore (store: string, key: string, value: any): any;
    deleteFromStore (store: string, key: string): Config;
}

declare interface Git {
    changeDir (dir: string): Git;
    changeRemoteName (remoteName: string): Git;
    exists (): boolean;
    existsForCommit (): Promise<boolean>;
    getCurrentBranch (): Promise<string>;
    getLastCommitMessage (defaultValue?: string): Promise<string>;
    getLastTag (): Promise<string|null>;
    getLastVersion (): Promise<string|null>;
    addTag (tagName: string, message: string): Promise<void>;
    pushTag (): Promise<void>;
    generateMessageForCommit (): Promise<string>;
    pull (branch: string): Promise<void>;
    add (branch: string): Promise<void>;
    commit (branch: string, comment: string): Promise<void>;
    push (branch: string): Promise<void>;
    localeDropTag (tagName: string): Promise<void>;
    remoteDropTag (tagName: string): Promise<void>;
}

declare interface PhpBuilder {
    constructor (file: string): PhpBuilder;
    namespace (name: string): PhpBuilder;
    use (name: string): PhpBuilder;
    deleteUse (name: string): PhpBuilder;
    class (name?: string): PhpBuilder;
    anonymous (value?: boolean): PhpBuilder;
    abstract (value?: boolean): PhpBuilder;
    final (value?: boolean): PhpBuilder;
    readonly (value?: boolean): PhpBuilder;
    extends (extendsClass: string): PhpBuilder;
    implements (implementsClass: string): PhpBuilder;
    attribute (attributeName: string, ...args: any[]): PhpBuilder;
    trait (traitName: string): PhpBuilder;
    constant (name: string, value: any): PhpBuilder;
    publicConstant (name: string, value: any): PhpBuilder;
    protectedConstant (name: string, value: any): PhpBuilder;
    privateConstant (name: string, value: any): PhpBuilder;
    publicProperty (name: string, value?: any, comment?: string): PhpBuilder;
    protectedProperty (name: string, value?: any, comment?: string): PhpBuilder;
    privateProperty (name: string, value?: any, comment?: string): PhpBuilder;
    staticPublicProperty (name: string, value?: any, comment?: string): PhpBuilder;
    staticProtectedProperty (name: string, value?: any, comment?: string): PhpBuilder;
    staticPrivateProperty (name: string, value?: any, comment?: string): PhpBuilder;
    publicMethod (name: string, body?: string, comment?: string, type?: string): PhpBuilder;
    protectedMethod (name: string, body?: string, comment?: string, type?: string): PhpBuilder;
    privateMethod (name: string, body?: string, comment?: string, type?: string): PhpBuilder;
    staticPublicMethod (name: string, body?: string, comment?: string, type?: string): PhpBuilder;
    staticProtectedMethod (name: string, body?: string, comment?: string, type?: string): PhpBuilder;
    staticPrivateMethod (name: string, body?: string, comment?: string, type?: string): PhpBuilder;
    countOfMethods (): number;
    countOfProperties (): number;
    countOfConstants (): number;
    isExistsMethod (name: string): boolean;
    isExistsProperty (name: string): boolean;
    save (): Promise<void>;
}

declare namespace loading {
    interface Options {
        text?: string;
        color?: string;
        interval?: number;
        frames?: string[];
    }
    interface Loading {
        /**
         * Change the text after the spinner.
         */
        text: string;
        /**
         * Change the spinner color.
         */
        color: string;
        /**
         * Start the spinner.
         * @param text - Set the current text.
         */
        start(text?: string): Loading;
        /**
         * Stop and clear the spinner.
         * @returns The spinner instance.
         */
        stop(): Loading;
        /**
         * Clear the spinner.
         * @returns The spinner instance.
         */
        clear(): Loading;
        /**
         * Stop the spinner, change it to a green `✔` and persist the current text, or `text` if provided.
         * @param text - Will persist text if provided.
         * @returns The spinner instance.
         */
        succeed(text?: string): Loading;

        /**
         * Stop the spinner, change it to a red `✖` and persist the current text, or `text` if provided.
         * @param text - Will persist text if provided.
         * @returns The spinner instance.
         */
        fail(text?: string): Loading;
        /**
         * Stop the spinner, change it to a yellow `⚠` and persist the current text, or `text` if provided.
         * @param text - Will persist text if provided.
         * @returns The spinner instance.
         */
        warn(text?: string): Loading;

        /**
         * Stop the spinner, change it to a blue `ℹ` and persist the current text, or `text` if provided.
         * @param text - Will persist text if provided.
         * @returns The spinner instance.
         */
        info(text?: string): Loading;

        /**
         * Manually render a new frame.
         * @returns The spinner instance.
         */
        render(): Loading;
        /**
         * Get a new frame.
         * @returns The spinner instance text.
         */
        frame(): string;
    }
}

declare const loading: {
    (options?: loading.Options | string): loading.Loading;
}

export interface Program {
    args: string[];
    processedArgs: any[];
    readonly commands: readonly Program[];
    readonly options: readonly Option[];
    readonly registeredArguments: readonly Argument[];
    parent: Program | null;

    constructor(name?: string): any;

    /**
     * Set the program version to `str`.
     *
     * This method auto-registers the "-V, --version" flag
     * which will print the version number when passed.
     *
     * You can optionally supply the  flags and description to override the defaults.
     */
    version(str: string, flags?: string, description?: string): this;
    /**
     * Get the program version.
     */
    version(): string | undefined;

    /**
     * Define a command, implemented using an action handler.
     *
     * @remarks
     * The command description is supplied using `.description`, not as a parameter to `.command`.
     *
     * @example
     * ```ts
     * program
     *   .command('clone <source> [destination]')
     *   .description('clone a repository into a newly created directory')
     *   .action((source, destination) => {
     *     console.log('clone command called');
     *   });
     * ```
     *
     * @param nameAndArgs - command name and arguments, args are  `<required>` or `[optional]` and last may also be `variadic...`
     * @param opts - configuration options
     * @returns new command
     */
    command(
        nameAndArgs: string,
        opts?: CommandOptions,
    ): ReturnType<this['createCommand']>;
    /**
     * Define a command, implemented in a separate executable file.
     *
     * @remarks
     * The command description is supplied as the second parameter to `.command`.
     *
     * @example
     * ```ts
     *  program
     *    .command('start <service>', 'start named service')
     *    .command('stop [service]', 'stop named service, or all if no name supplied');
     * ```
     *
     * @param nameAndArgs - command name and arguments, args are  `<required>` or `[optional]` and last may also be `variadic...`
     * @param description - description of executable command
     * @param opts - configuration options
     * @returns `this` command for chaining
     */
    command(
        nameAndArgs: string,
        description: string,
        opts?: ExecutableCommandOptions,
    ): this;

    /**
     * Factory routine to create a new unattached command.
     *
     * See .command() for creating an attached subcommand, which uses this routine to
     * create the command. You can override createCommand to customise subcommands.
     */
    createCommand(name?: string): Program;

    /**
     * Add a prepared subcommand.
     *
     * See .command() for creating an attached subcommand which inherits settings from its parent.
     *
     * @returns `this` command for chaining
     */
    addCommand(cmd: Program, opts?: CommandOptions): this;

    /**
     * Factory routine to create a new unattached argument.
     *
     * See .argument() for creating an attached argument, which uses this routine to
     * create the argument. You can override createArgument to return a custom argument.
     */
    createArgument(name: string, description?: string): Argument;

    /**
     * Define argument syntax for command.
     *
     * The default is that the argument is required, and you can explicitly
     * indicate this with <> around the name. Put [] around the name for an optional argument.
     *
     * @example
     * ```
     * program.argument('<input-file>');
     * program.argument('[output-file]');
     * ```
     *
     * @returns `this` command for chaining
     */
    argument<T>(
        flags: string,
        description: string,
        fn: (value: string, previous: T) => T,
        defaultValue?: T,
    ): this;
    argument(name: string, description?: string, defaultValue?: unknown): this;

    /**
     * Define argument syntax for command, adding a prepared argument.
     *
     * @returns `this` command for chaining
     */
    addArgument(arg: Argument): this;

    /**
     * Define argument syntax for command, adding multiple at once (without descriptions).
     *
     * See also .argument().
     *
     * @example
     * ```
     * program.arguments('<cmd> [env]');
     * ```
     *
     * @returns `this` command for chaining
     */
    arguments(names: string): this;

    /**
     * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
     *
     * @example
     * ```ts
     * program.helpCommand('help [cmd]');
     * program.helpCommand('help [cmd]', 'show help');
     * program.helpCommand(false); // suppress default help command
     * program.helpCommand(true); // add help command even if no subcommands
     * ```
     */
    helpCommand(nameAndArgs: string, description?: string): this;
    helpCommand(enable: boolean): this;

    /**
     * Add prepared custom help command.
     */
    addHelpCommand(cmd: Program): this;
    /** @deprecated since v12, instead use helpCommand */
    addHelpCommand(nameAndArgs: string, description?: string): this;
    /** @deprecated since v12, instead use helpCommand */
    addHelpCommand(enable?: boolean): this;

    /**
     * Add hook for life cycle event.
     */
    hook(
        event: HookEvent,
        listener: (
            thisCommand: Program,
            actionCommand: Program,
        ) => void | Promise<void>,
    ): this;

    /**
     * Register callback to use as replacement for calling process.exit.
     */
    exitOverride(callback?: (err: CommanderError) => never | void): this;

    /**
     * Display error message and exit (or call exitOverride).
     */
    error(message: string, errorOptions?: ErrorOptions): never;

    /**
     * You can customise the help with a subclass of Help by overriding createHelp,
     * or by overriding Help properties using configureHelp().
     */
    createHelp(): Help;

    /**
     * You can customise the help by overriding Help properties using configureHelp(),
     * or with a subclass of Help by overriding createHelp().
     */
    configureHelp(configuration: HelpConfiguration): this;
    /** Get configuration */
    configureHelp(): HelpConfiguration;

    /**
     * The default output goes to stdout and stderr. You can customise this for special
     * applications. You can also customise the display of errors by overriding outputError.
     *
     * The configuration properties are all functions:
     * ```
     * // functions to change where being written, stdout and stderr
     * writeOut(str)
     * writeErr(str)
     * // matching functions to specify width for wrapping help
     * getOutHelpWidth()
     * getErrHelpWidth()
     * // functions based on what is being written out
     * outputError(str, write) // used for displaying errors, and not used for displaying help
     * ```
     */
    configureOutput(configuration: OutputConfiguration): this;
    /** Get configuration */
    configureOutput(): OutputConfiguration;

    /**
     * Copy settings that are useful to have in common across root command and subcommands.
     *
     * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
     */
    copyInheritedSettings(sourceCommand: Program): this;

    /**
     * Display the help or a custom message after an error occurs.
     */
    showHelpAfterError(displayHelp?: boolean | string): this;

    /**
     * Display suggestion of similar commands for unknown commands, or options for unknown options.
     */
    showSuggestionAfterError(displaySuggestion?: boolean): this;

    /**
     * Register callback `fn` for the command.
     *
     * @example
     * ```
     * program
     *   .command('serve')
     *   .description('start service')
     *   .action(function() {
     *     // do work here
     *   });
     * ```
     *
     * @returns `this` command for chaining
     */
    action(fn: (this: this, ...args: any[]) => void | Promise<void>): this;

    /**
     * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
     *
     * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
     * option-argument is indicated by `<>` and an optional option-argument by `[]`.
     *
     * See the README for more details, and see also addOption() and requiredOption().
     *
     * @example
     *
     * ```js
     * program
     *     .option('-p, --pepper', 'add pepper')
     *     .option('-p, --pizza-type <TYPE>', 'type of pizza') // required option-argument
     *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
     *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
     * ```
     *
     * @returns `this` command for chaining
     */
    option(
        flags: string,
        description?: string,
        defaultValue?: string | boolean | string[],
    ): this;
    option<T>(
        flags: string,
        description: string,
        parseArg: (value: string, previous: T) => T,
        defaultValue?: T,
    ): this;
    /** @deprecated since v7, instead use choices or a custom function */
    option(
        flags: string,
        description: string,
        regexp: RegExp,
        defaultValue?: string | boolean | string[],
    ): this;

    /**
     * Define a required option, which must have a value after parsing. This usually means
     * the option must be specified on the command line. (Otherwise the same as .option().)
     *
     * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
     */
    requiredOption(
        flags: string,
        description?: string,
        defaultValue?: string | boolean | string[],
    ): this;
    requiredOption<T>(
        flags: string,
        description: string,
        parseArg: (value: string, previous: T) => T,
        defaultValue?: T,
    ): this;
    /** @deprecated since v7, instead use choices or a custom function */
    requiredOption(
        flags: string,
        description: string,
        regexp: RegExp,
        defaultValue?: string | boolean | string[],
    ): this;

    /**
     * Factory routine to create a new unattached option.
     *
     * See .option() for creating an attached option, which uses this routine to
     * create the option. You can override createOption to return a custom option.
     */

    createOption(flags: string, description?: string): Option;

    /**
     * Add a prepared Option.
     *
     * See .option() and .requiredOption() for creating and attaching an option in a single call.
     */
    addOption(option: Option): this;

    /**
     * Whether to store option values as properties on command object,
     * or store separately (specify false). In both cases the option values can be accessed using .opts().
     *
     * @returns `this` command for chaining
     */
    storeOptionsAsProperties<T extends OptionValues>(): this & T;
    storeOptionsAsProperties<T extends OptionValues>(
        storeAsProperties: true,
    ): this & T;
    storeOptionsAsProperties(storeAsProperties?: boolean): this;

    /**
     * Retrieve option value.
     */
    getOptionValue(key: string): any;

    /**
     * Store option value.
     */
    setOptionValue(key: string, value: unknown): this;

    /**
     * Store option value and where the value came from.
     */
    setOptionValueWithSource(
        key: string,
        value: unknown,
        source: OptionValueSource,
    ): this;

    /**
     * Get source of option value.
     */
    getOptionValueSource(key: string): OptionValueSource | undefined;

    /**
     * Get source of option value. See also .optsWithGlobals().
     */
    getOptionValueSourceWithGlobals(key: string): OptionValueSource | undefined;

    /**
     * Alter parsing of short flags with optional values.
     *
     * @example
     * ```
     * // for `.option('-f,--flag [value]'):
     * .combineFlagAndOptionalValue(true)  // `-f80` is treated like `--flag=80`, this is the default behaviour
     * .combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
     * ```
     *
     * @returns `this` command for chaining
     */
    combineFlagAndOptionalValue(combine?: boolean): this;

    /**
     * Allow unknown options on the command line.
     *
     * @returns `this` command for chaining
     */
    allowUnknownOption(allowUnknown?: boolean): this;

    /**
     * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
     *
     * @returns `this` command for chaining
     */
    allowExcessArguments(allowExcess?: boolean): this;

    /**
     * Enable positional options. Positional means global options are specified before subcommands which lets
     * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
     *
     * The default behaviour is non-positional and global options may appear anywhere on the command line.
     *
     * @returns `this` command for chaining
     */
    enablePositionalOptions(positional?: boolean): this;

    /**
     * Pass through options that come after command-arguments rather than treat them as command-options,
     * so actual command-options come before command-arguments. Turning this on for a subcommand requires
     * positional options to have been enabled on the program (parent commands).
     *
     * The default behaviour is non-positional and options may appear before or after command-arguments.
     *
     * @returns `this` command for chaining
     */
    passThroughOptions(passThrough?: boolean): this;

    /**
     * Parse `argv`, setting options and invoking commands when defined.
     *
     * Use parseAsync instead of parse if any of your action handlers are async.
     *
     * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
     *
     * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
     * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
     * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
     * - `'user'`: just user arguments
     *
     * @example
     * ```
     * program.parse(); // parse process.argv and auto-detect electron and special node flags
     * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
     * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
     * ```
     *
     * @returns `this` command for chaining
     */
    parse(argv?: readonly string[], parseOptions?: ParseOptions): this;

    /**
     * Parse `argv`, setting options and invoking commands when defined.
     *
     * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
     *
     * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
     * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
     * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
     * - `'user'`: just user arguments
     *
     * @example
     * ```
     * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
     * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
     * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
     * ```
     *
     * @returns Promise
     */
    parseAsync(
        argv?: readonly string[],
        parseOptions?: ParseOptions,
    ): Promise<this>;

    /**
     * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
     * Not usually called directly, but available for subclasses to save their custom state.
     *
     * This is called in a lazy way. Only commands used in parsing chain will have state saved.
     */
    saveStateBeforeParse(): void;

    /**
     * Restore state before parse for calls after the first.
     * Not usually called directly, but available for subclasses to save their custom state.
     *
     * This is called in a lazy way. Only commands used in parsing chain will have state restored.
     */
    restoreStateBeforeParse(): void;

    /**
     * Parse options from `argv` removing known options,
     * and return argv split into operands and unknown arguments.
     *
     * Side effects: modifies command by storing options. Does not reset state if called again.
     *
     *     argv => operands, unknown
     *     --known kkk op => [op], []
     *     op --known kkk => [op], []
     *     sub --unknown uuu op => [sub], [--unknown uuu op]
     *     sub -- --unknown uuu op => [sub --unknown uuu op], []
     */
    parseOptions(argv: string[]): ParseOptionsResult;

    /**
     * Return an object containing local option values as key-value pairs
     */
    opts<T extends OptionValues>(): T;

    /**
     * Return an object containing merged local and global option values as key-value pairs.
     */
    optsWithGlobals<T extends OptionValues>(): T;

    /**
     * Set the description.
     *
     * @returns `this` command for chaining
     */

    description(str: string): this;
    /** @deprecated since v8, instead use .argument to add command argument with description */
    description(str: string, argsDescription: Record<string, string>): this;
    /**
     * Get the description.
     */
    description(): string;

    /**
     * Set the summary. Used when listed as subcommand of parent.
     *
     * @returns `this` command for chaining
     */

    summary(str: string): this;
    /**
     * Get the summary.
     */
    summary(): string;

    /**
     * Set an alias for the command.
     *
     * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
     *
     * @returns `this` command for chaining
     */
    alias(alias: string): this;
    /**
     * Get alias for the command.
     */
    alias(): string;

    /**
     * Set aliases for the command.
     *
     * Only the first alias is shown in the auto-generated help.
     *
     * @returns `this` command for chaining
     */
    aliases(aliases: readonly string[]): this;
    /**
     * Get aliases for the command.
     */
    aliases(): string[];

    /**
     * Set the command usage.
     *
     * @returns `this` command for chaining
     */
    usage(str: string): this;
    /**
     * Get the command usage.
     */
    usage(): string;

    /**
     * Set the name of the command.
     *
     * @returns `this` command for chaining
     */
    name(str: string): this;
    /**
     * Get the name of the command.
     */
    name(): string;

    /**
     * Set the name of the command from script filename, such as process.argv[1],
     * or require.main.filename, or __filename.
     *
     * (Used internally and public although not documented in README.)
     *
     * @example
     * ```ts
     * program.nameFromFilename(require.main.filename);
     * ```
     *
     * @returns `this` command for chaining
     */
    nameFromFilename(filename: string): this;

    /**
     * Set the directory for searching for executable subcommands of this command.
     *
     * @example
     * ```ts
     * program.executableDir(__dirname);
     * // or
     * program.executableDir('subcommands');
     * ```
     *
     * @returns `this` command for chaining
     */
    executableDir(path: string): this;
    /**
     * Get the executable search directory.
     */
    executableDir(): string | null;

    /**
     * Output help information for this command.
     *
     * Outputs built-in help, and custom text added using `.addHelpText()`.
     *
     */
    outputHelp(context?: HelpContext): void;
    /** @deprecated since v7 */
    outputHelp(cb?: (str: string) => string): void;

    /**
     * Return command help documentation.
     */
    helpInformation(context?: HelpContext): string;

    /**
     * You can pass in flags and a description to override the help
     * flags and help description for your command. Pass in false
     * to disable the built-in help option.
     */
    helpOption(flags?: string | boolean, description?: string): this;

    /**
     * Supply your own option to use for the built-in help option.
     * This is an alternative to using helpOption() to customise the flags and description etc.
     */
    addHelpOption(option: Option): this;

    /**
     * Output help information and exit.
     *
     * Outputs built-in help, and custom text added using `.addHelpText()`.
     */
    help(context?: HelpContext): never;
    /** @deprecated since v7 */
    help(cb?: (str: string) => string): never;

    /**
     * Add additional text to be displayed with the built-in help.
     *
     * Position is 'before' or 'after' to affect just this command,
     * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
     */
    addHelpText(position: AddHelpTextPosition, text: string): this;
    addHelpText(
        position: AddHelpTextPosition,
        text: (context: AddHelpTextContext) => string,
    ): this;

    /**
     * Add a listener (callback) for when events occur. (Implemented using EventEmitter.)
     */
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

export interface ErrorOptions {
    // optional parameter for error()
    /** an id string representing the error */
    code?: string;
    /** suggested exit code which could be used with process.exit */
    exitCode?: number;
}

export interface ExecutableCommandOptions extends CommandOptions {
    executableFile?: string;
}

export type HookEvent = 'preSubcommand' | 'preAction' | 'postAction';

export interface CommanderError extends Error {
    code: string;
    exitCode: number;
    message: string;
    nestedError?: string;

    /**
     * Constructs the CommanderError class
     * @param exitCode - suggested exit code which could be used with process.exit
     * @param code - an id string representing the error
     * @param message - human-readable description of the error
     */
    constructor(exitCode: number, code: string, message: string): any;
}

export interface OutputConfiguration {
    writeOut?(str: string): void;
    writeErr?(str: string): void;
    outputError?(str: string, write: (str: string) => void): void;

    getOutHelpWidth?(): number;
    getErrHelpWidth?(): number;

    getOutHasColors?(): boolean;
    getErrHasColors?(): boolean;
    stripColor?(str: string): string;
}

export type HelpConfiguration = Partial<Help>;

export interface Help {
    /** output helpWidth, long lines are wrapped to fit */
    helpWidth?: number;
    minWidthToWrap: number;
    sortSubcommands: boolean;
    sortOptions: boolean;
    showGlobalOptions: boolean;

    constructor(): any;

    /*
     * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
     * and just before calling `formatHelp()`.
     *
     * Commander just uses the helpWidth and the others are provided for subclasses.
     */
    prepareContext(contextOptions: {
        error?: boolean;
        helpWidth?: number;
        outputHasColors?: boolean;
    }): void;

    /** Get the command term to show in the list of subcommands. */
    subcommandTerm(cmd: Program): string;
    /** Get the command summary to show in the list of subcommands. */
    subcommandDescription(cmd: Program): string;
    /** Get the option term to show in the list of options. */
    optionTerm(option: Option): string;
    /** Get the option description to show in the list of options. */
    optionDescription(option: Option): string;
    /** Get the argument term to show in the list of arguments. */
    argumentTerm(argument: Argument): string;
    /** Get the argument description to show in the list of arguments. */
    argumentDescription(argument: Argument): string;

    /** Get the command usage to be displayed at the top of the built-in help. */
    commandUsage(cmd: Program): string;
    /** Get the description for the command. */
    commandDescription(cmd: Program): string;

    /** Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one. */
    visibleCommands(cmd: Program): Program[];
    /** Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one. */
    visibleOptions(cmd: Program): Option[];
    /** Get an array of the visible global options. (Not including help.) */
    visibleGlobalOptions(cmd: Program): Option[];
    /** Get an array of the arguments which have descriptions. */
    visibleArguments(cmd: Program): Argument[];

    /** Get the longest command term length. */
    longestSubcommandTermLength(cmd: Program, helper: Help): number;
    /** Get the longest option term length. */
    longestOptionTermLength(cmd: Program, helper: Help): number;
    /** Get the longest global option term length. */
    longestGlobalOptionTermLength(cmd: Program, helper: Help): number;
    /** Get the longest argument term length. */
    longestArgumentTermLength(cmd: Program, helper: Help): number;

    /** Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations. */
    displayWidth(str: string): number;

    /** Style the titles. Called with 'Usage:', 'Options:', etc. */
    styleTitle(title: string): string;

    /** Usage: <str> */
    styleUsage(str: string): string;
    /** Style for command name in usage string.  */
    styleCommandText(str: string): string;

    styleCommandDescription(str: string): string;
    styleOptionDescription(str: string): string;
    styleSubcommandDescription(str: string): string;
    styleArgumentDescription(str: string): string;
    /** Base style used by descriptions. */
    styleDescriptionText(str: string): string;

    styleOptionTerm(str: string): string;
    styleSubcommandTerm(str: string): string;
    styleArgumentTerm(str: string): string;

    /** Base style used in terms and usage for options. */
    styleOptionText(str: string): string;
    /** Base style used in terms and usage for subcommands. */
    styleSubcommandText(str: string): string;
    /** Base style used in terms and usage for arguments. */
    styleArgumentText(str: string): string;

    /** Calculate the pad width from the maximum term length. */
    padWidth(cmd: Program, helper: Help): number;

    /**
     * Wrap a string at whitespace, preserving existing line breaks.
     * Wrapping is skipped if the width is less than `minWidthToWrap`.
     */
    boxWrap(str: string, width: number): string;

    /** Detect manually wrapped and indented strings by checking for line break followed by whitespace. */
    preformatted(str: string): boolean;

    /**
     * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
     *
     * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
     *   TTT    DDD DDDD
     *          DD DDD
     */
    formatItem(
        term: string,
        termWidth: number,
        description: string,
        helper: Help,
    ): string;

    /** Generate the built-in help text. */
    formatHelp(cmd: Program, helper: Help): string;
}

type LiteralUnion<LiteralType, BaseType extends string | number> =
    | LiteralType
    | (BaseType & Record<never, never>);

export type OptionValueSource =
    | LiteralUnion<'default' | 'config' | 'env' | 'cli' | 'implied', string>
    | undefined;

export interface ParseOptions {
    from: 'node' | 'electron' | 'user';
}

export interface ParseOptionsResult {
    operands: string[];
    unknown: string[];
}

export interface HelpContext {
    // optional parameter for .help() and .outputHelp()
    error: boolean;
}

export interface AddHelpTextContext {
    // passed to text function used with .addHelpText()
    error: boolean;
    command: Command;
}

export type AddHelpTextPosition = 'beforeAll' | 'before' | 'after' | 'afterAll';

export interface CommandOptions {
    hidden?: boolean;
    isDefault?: boolean;
    /** @deprecated since v7, replaced by hidden */
    noHelp?: boolean;
}

export type OptionValues = Record<string, any>;

export interface Argument {
    description: string;
    required: boolean;
    variadic: boolean;
    defaultValue?: any;
    defaultValueDescription?: string;
    argChoices?: string[];

    /**
     * Initialize a new command argument with the given name and description.
     * The default is that the argument is required, and you can explicitly
     * indicate this with <> around the name. Put [] around the name for an optional argument.
     */
    constructor(arg: string, description?: string): any;

    /**
     * Return argument name.
     */
    name(): string;

    /**
     * Set the default value, and optionally supply the description to be displayed in the help.
     */
    default(value: unknown, description?: string): this;

    /**
     * Set the custom handler for processing CLI command arguments into argument values.
     */
    argParser<T>(fn: (value: string, previous: T) => T): this;

    /**
     * Only allow argument value to be one of choices.
     */
    choices(values: readonly string[]): this;

    /**
     * Make argument required.
     */
    argRequired(): this;

    /**
     * Make argument optional.
     */
    argOptional(): this;
}

export interface Option {
    flags: string;
    description: string;

    required: boolean; // A value must be supplied when the option is specified.
    optional: boolean; // A value is optional when the option is specified.
    variadic: boolean;
    mandatory: boolean; // The option must have a value after parsing, which usually means it must be specified on command line.
    short?: string;
    long?: string;
    negate: boolean;
    defaultValue?: any;
    defaultValueDescription?: string;
    presetArg?: unknown;
    envVar?: string;
    parseArg?: <T>(value: string, previous: T) => T;
    hidden: boolean;
    argChoices?: string[];

    constructor(flags: string, description?: string): any;

    /**
     * Set the default value, and optionally supply the description to be displayed in the help.
     */
    default(value: unknown, description?: string): this;

    /**
     * Preset to use when option used without option-argument, especially optional but also boolean and negated.
     * The custom processing (parseArg) is called.
     *
     * @example
     * ```ts
     * new Option('--color').default('GREYSCALE').preset('RGB');
     * new Option('--donate [amount]').preset('20').argParser(parseFloat);
     * ```
     */
    preset(arg: unknown): this;

    /**
     * Add option name(s) that conflict with this option.
     * An error will be displayed if conflicting options are found during parsing.
     *
     * @example
     * ```ts
     * new Option('--rgb').conflicts('cmyk');
     * new Option('--js').conflicts(['ts', 'jsx']);
     * ```
     */
    conflicts(names: string | string[]): this;

    /**
     * Specify implied option values for when this option is set and the implied options are not.
     *
     * The custom processing (parseArg) is not called on the implied values.
     *
     * @example
     * program
     *   .addOption(new Option('--log', 'write logging information to file'))
     *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
     */
    implies(optionValues: OptionValues): this;

    /**
     * Set environment variable to check for option value.
     *
     * An environment variables is only used if when processed the current option value is
     * undefined, or the source of the current value is 'default' or 'config' or 'env'.
     */
    env(name: string): this;

    /**
     * Set the custom handler for processing CLI option arguments into option values.
     */
    argParser<T>(fn: (value: string, previous: T) => T): this;

    /**
     * Whether the option is mandatory and must have a value after parsing.
     */
    makeOptionMandatory(mandatory?: boolean): this;

    /**
     * Hide option in help.
     */
    hideHelp(hide?: boolean): this;

    /**
     * Only allow option value to be one of choices.
     */
    choices(values: readonly string[]): this;

    /**
     * Return option name.
     */
    name(): string;

    /**
     * Return option name, in a camelcase format that can be used
     * as an object attribute key.
     */
    attributeName(): string;

    /**
     * Return whether a boolean option.
     *
     * Options are one of boolean, negated, required argument, or optional argument.
     */
    isBoolean(): boolean;
}

declare namespace moment {
    type RelativeTimeKey = 's' | 'ss' | 'm' | 'mm' | 'h' | 'hh' | 'd' | 'dd' | 'w' | 'ww' | 'M' | 'MM' | 'y' | 'yy';
    type CalendarKey = 'sameDay' | 'nextDay' | 'lastDay' | 'nextWeek' | 'lastWeek' | 'sameElse' | string;
    type LongDateFormatKey = 'LTS' | 'LT' | 'L' | 'LL' | 'LLL' | 'LLLL' | 'lts' | 'lt' | 'l' | 'll' | 'lll' | 'llll';

    interface Locale {
        calendar(key?: CalendarKey, m?: Moment, now?: Moment): string;

        longDateFormat(key: LongDateFormatKey): string;
        invalidDate(): string;
        ordinal(n: number): string;

        preparse(inp: string): string;
        postformat(inp: string): string;
        relativeTime(n: number, withoutSuffix: boolean,
                     key: RelativeTimeKey, isFuture: boolean): string;
        pastFuture(diff: number, absRelTime: string): string;
        set(config: Object): void;

        months(): string[];
        months(m: Moment, format?: string): string;
        monthsShort(): string[];
        monthsShort(m: Moment, format?: string): string;
        monthsParse(monthName: string, format: string, strict: boolean): number;
        monthsRegex(strict: boolean): RegExp;
        monthsShortRegex(strict: boolean): RegExp;

        week(m: Moment): number;
        firstDayOfYear(): number;
        firstDayOfWeek(): number;

        weekdays(): string[];
        weekdays(m: Moment, format?: string): string;
        weekdaysMin(): string[];
        weekdaysMin(m: Moment): string;
        weekdaysShort(): string[];
        weekdaysShort(m: Moment): string;
        weekdaysParse(weekdayName: string, format: string, strict: boolean): number;
        weekdaysRegex(strict: boolean): RegExp;
        weekdaysShortRegex(strict: boolean): RegExp;
        weekdaysMinRegex(strict: boolean): RegExp;

        isPM(input: string): boolean;
        meridiem(hour: number, minute: number, isLower: boolean): string;
    }

    interface StandaloneFormatSpec {
        format: string[];
        standalone: string[];
        isFormat?: RegExp;
    }

    interface WeekSpec {
        dow: number;
        doy?: number;
    }

    type CalendarSpecVal = string | ((m?: MomentInput, now?: Moment) => string);
    interface CalendarSpec {
        sameDay?: CalendarSpecVal;
        nextDay?: CalendarSpecVal;
        lastDay?: CalendarSpecVal;
        nextWeek?: CalendarSpecVal;
        lastWeek?: CalendarSpecVal;
        sameElse?: CalendarSpecVal;

        // any additional properties might be used with moment.calendarFormat
        [x: string]: CalendarSpecVal | undefined;
    }

    type RelativeTimeSpecVal = (
        string |
        ((n: number, withoutSuffix: boolean,
          key: RelativeTimeKey, isFuture: boolean) => string)
        );
    type RelativeTimeFuturePastVal = string | ((relTime: string) => string);

    interface RelativeTimeSpec {
        future?: RelativeTimeFuturePastVal;
        past?: RelativeTimeFuturePastVal;
        s?: RelativeTimeSpecVal;
        ss?: RelativeTimeSpecVal;
        m?: RelativeTimeSpecVal;
        mm?: RelativeTimeSpecVal;
        h?: RelativeTimeSpecVal;
        hh?: RelativeTimeSpecVal;
        d?: RelativeTimeSpecVal;
        dd?: RelativeTimeSpecVal;
        w?: RelativeTimeSpecVal;
        ww?: RelativeTimeSpecVal;
        M?: RelativeTimeSpecVal;
        MM?: RelativeTimeSpecVal;
        y?: RelativeTimeSpecVal;
        yy?: RelativeTimeSpecVal;
    }

    interface LongDateFormatSpec {
        LTS: string;
        LT: string;
        L: string;
        LL: string;
        LLL: string;
        LLLL: string;

        // lets forget for a sec that any upper/lower permutation will also work
        lts?: string;
        lt?: string;
        l?: string;
        ll?: string;
        lll?: string;
        llll?: string;
    }

    type MonthWeekdayFn = (momentToFormat: Moment, format?: string) => string;
    type WeekdaySimpleFn = (momentToFormat: Moment) => string;

    interface LocaleSpecification {
        months?: string[] | StandaloneFormatSpec | MonthWeekdayFn;
        monthsShort?: string[] | StandaloneFormatSpec | MonthWeekdayFn;

        weekdays?: string[] | StandaloneFormatSpec | MonthWeekdayFn;
        weekdaysShort?: string[] | StandaloneFormatSpec | WeekdaySimpleFn;
        weekdaysMin?: string[] | StandaloneFormatSpec | WeekdaySimpleFn;

        meridiemParse?: RegExp;
        meridiem?: (hour: number, minute:number, isLower: boolean) => string;

        isPM?: (input: string) => boolean;

        longDateFormat?: LongDateFormatSpec;
        calendar?: CalendarSpec;
        relativeTime?: RelativeTimeSpec;
        invalidDate?: string;
        ordinal?: (n: number) => string;
        ordinalParse?: RegExp;

        week?: WeekSpec;

        // Allow anything: in general any property that is passed as locale spec is
        // put in the locale object so it can be used by locale functions
        [x: string]: any;
    }

    interface MomentObjectOutput {
        years: number;
        /* One digit */
        months: number;
        /* Day of the month */
        date: number;
        hours: number;
        minutes: number;
        seconds: number;
        milliseconds: number;
    }
    interface argThresholdOpts {
        ss?: number;
        s?: number;
        m?: number;
        h?: number;
        d?: number;
        w?: number | null;
        M?: number;
    }

    interface Duration {
        clone(): Duration;

        humanize(argWithSuffix?: boolean, argThresholds?: argThresholdOpts): string;

        humanize(argThresholds?: argThresholdOpts): string;

        abs(): Duration;

        as(units: unitOfTime.Base): number;
        get(units: unitOfTime.Base): number;

        milliseconds(): number;
        asMilliseconds(): number;

        seconds(): number;
        asSeconds(): number;

        minutes(): number;
        asMinutes(): number;

        hours(): number;
        asHours(): number;

        days(): number;
        asDays(): number;

        weeks(): number;
        asWeeks(): number;

        months(): number;
        asMonths(): number;

        years(): number;
        asYears(): number;

        add(inp?: DurationInputArg1, unit?: DurationInputArg2): Duration;
        subtract(inp?: DurationInputArg1, unit?: DurationInputArg2): Duration;

        locale(): string;
        locale(locale: LocaleSpecifier): Duration;
        localeData(): Locale;

        toISOString(): string;
        toJSON(): string;

        isValid(): boolean;

        /**
         * @deprecated since version 2.8.0
         */
        lang(locale: LocaleSpecifier): Moment;
        /**
         * @deprecated since version 2.8.0
         */
        lang(): Locale;
        /**
         * @deprecated
         */
        toIsoString(): string;
    }

    interface MomentRelativeTime {
        future: any;
        past: any;
        s: any;
        ss: any;
        m: any;
        mm: any;
        h: any;
        hh: any;
        d: any;
        dd: any;
        M: any;
        MM: any;
        y: any;
        yy: any;
    }

    interface MomentLongDateFormat {
        L: string;
        LL: string;
        LLL: string;
        LLLL: string;
        LT: string;
        LTS: string;

        l?: string;
        ll?: string;
        lll?: string;
        llll?: string;
        lt?: string;
        lts?: string;
    }

    interface MomentParsingFlags {
        empty: boolean;
        unusedTokens: string[];
        unusedInput: string[];
        overflow: number;
        charsLeftOver: number;
        nullInput: boolean;
        invalidMonth: string | null;
        invalidFormat: boolean;
        userInvalidated: boolean;
        iso: boolean;
        parsedDateParts: any[];
        meridiem: string | null;
    }

    interface MomentParsingFlagsOpt {
        empty?: boolean;
        unusedTokens?: string[];
        unusedInput?: string[];
        overflow?: number;
        charsLeftOver?: number;
        nullInput?: boolean;
        invalidMonth?: string;
        invalidFormat?: boolean;
        userInvalidated?: boolean;
        iso?: boolean;
        parsedDateParts?: any[];
        meridiem?: string | null;
    }

    interface MomentBuiltinFormat {
        __momentBuiltinFormatBrand: any;
    }

    type MomentFormatSpecification = string | MomentBuiltinFormat | (string | MomentBuiltinFormat)[];

    namespace unitOfTime {
        type Base = (
            "year" | "years" | "y" |
            "month" | "months" | "M" |
            "week" | "weeks" | "w" |
            "day" | "days" | "d" |
            "hour" | "hours" | "h" |
            "minute" | "minutes" | "m" |
            "second" | "seconds" | "s" |
            "millisecond" | "milliseconds" | "ms"
            );

        type _quarter = "quarter" | "quarters" | "Q";
        type _isoWeek = "isoWeek" | "isoWeeks" | "W";
        type _date = "date" | "dates" | "D";
        type DurationConstructor = Base | _quarter;

        type DurationAs = Base;

        type StartOf = Base | _quarter | _isoWeek | _date | null;

        type Diff = Base | _quarter;

        type MomentConstructor = Base | _date;

        type All = Base | _quarter | _isoWeek | _date |
            "weekYear" | "weekYears" | "gg" |
            "isoWeekYear" | "isoWeekYears" | "GG" |
            "dayOfYear" | "dayOfYears" | "DDD" |
            "weekday" | "weekdays" | "e" |
            "isoWeekday" | "isoWeekdays" | "E";
    }

    interface MomentInputObject {
        years?: number;
        year?: number;
        y?: number;

        months?: number;
        month?: number;
        M?: number;

        days?: number;
        day?: number;
        d?: number;

        dates?: number;
        date?: number;
        D?: number;

        hours?: number;
        hour?: number;
        h?: number;

        minutes?: number;
        minute?: number;
        m?: number;

        seconds?: number;
        second?: number;
        s?: number;

        milliseconds?: number;
        millisecond?: number;
        ms?: number;
    }

    interface DurationInputObject extends MomentInputObject {
        quarters?: number;
        quarter?: number;
        Q?: number;

        weeks?: number;
        week?: number;
        w?: number;
    }

    interface MomentSetObject extends MomentInputObject {
        weekYears?: number;
        weekYear?: number;
        gg?: number;

        isoWeekYears?: number;
        isoWeekYear?: number;
        GG?: number;

        quarters?: number;
        quarter?: number;
        Q?: number;

        weeks?: number;
        week?: number;
        w?: number;

        isoWeeks?: number;
        isoWeek?: number;
        W?: number;

        dayOfYears?: number;
        dayOfYear?: number;
        DDD?: number;

        weekdays?: number;
        weekday?: number;
        e?: number;

        isoWeekdays?: number;
        isoWeekday?: number;
        E?: number;
    }

    interface FromTo {
        from: MomentInput;
        to: MomentInput;
    }

    type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | null | undefined;
    type DurationInputArg1 = Duration | number | string | FromTo | DurationInputObject | null | undefined;
    type DurationInputArg2 = unitOfTime.DurationConstructor;
    type LocaleSpecifier = string | Moment | Duration | string[] | boolean;

    interface MomentCreationData {
        input: MomentInput;
        format?: MomentFormatSpecification;
        locale: Locale;
        isUTC: boolean;
        strict?: boolean;
    }

    interface Moment extends Object {
        format(format?: string): string;

        startOf(unitOfTime: unitOfTime.StartOf): Moment;
        endOf(unitOfTime: unitOfTime.StartOf): Moment;

        add(amount?: DurationInputArg1, unit?: DurationInputArg2): Moment;
        /**
         * @deprecated reverse syntax
         */
        add(unit: unitOfTime.DurationConstructor, amount: number|string): Moment;

        subtract(amount?: DurationInputArg1, unit?: DurationInputArg2): Moment;
        /**
         * @deprecated reverse syntax
         */
        subtract(unit: unitOfTime.DurationConstructor, amount: number|string): Moment;

        calendar(): string;
        calendar(formats: CalendarSpec): string;
        calendar(time?: MomentInput, formats?: CalendarSpec): string;

        clone(): Moment;

        /**
         * @return Unix timestamp in milliseconds
         */
        valueOf(): number;

        // current date/time in local mode
        local(keepLocalTime?: boolean): Moment;
        isLocal(): boolean;

        // current date/time in UTC mode
        utc(keepLocalTime?: boolean): Moment;
        isUTC(): boolean;
        /**
         * @deprecated use isUTC
         */
        isUtc(): boolean;

        parseZone(): Moment;
        isValid(): boolean;
        invalidAt(): number;

        hasAlignedHourOffset(other?: MomentInput): boolean;

        creationData(): MomentCreationData;
        parsingFlags(): MomentParsingFlags;

        year(y: number): Moment;
        year(): number;
        /**
         * @deprecated use year(y)
         */
        years(y: number): Moment;
        /**
         * @deprecated use year()
         */
        years(): number;
        quarter(): number;
        quarter(q: number): Moment;
        quarters(): number;
        quarters(q: number): Moment;
        month(M: number|string): Moment;
        month(): number;
        /**
         * @deprecated use month(M)
         */
        months(M: number|string): Moment;
        /**
         * @deprecated use month()
         */
        months(): number;
        day(d: number|string): Moment;
        day(): number;
        days(d: number|string): Moment;
        days(): number;
        date(d: number): Moment;
        date(): number;
        /**
         * @deprecated use date(d)
         */
        dates(d: number): Moment;
        /**
         * @deprecated use date()
         */
        dates(): number;
        hour(h: number): Moment;
        hour(): number;
        hours(h: number): Moment;
        hours(): number;
        minute(m: number): Moment;
        minute(): number;
        minutes(m: number): Moment;
        minutes(): number;
        second(s: number): Moment;
        second(): number;
        seconds(s: number): Moment;
        seconds(): number;
        millisecond(ms: number): Moment;
        millisecond(): number;
        milliseconds(ms: number): Moment;
        milliseconds(): number;
        weekday(): number;
        weekday(d: number): Moment;
        isoWeekday(): number;
        isoWeekday(d: number|string): Moment;
        weekYear(): number;
        weekYear(d: number): Moment;
        isoWeekYear(): number;
        isoWeekYear(d: number): Moment;
        week(): number;
        week(d: number): Moment;
        weeks(): number;
        weeks(d: number): Moment;
        isoWeek(): number;
        isoWeek(d: number): Moment;
        isoWeeks(): number;
        isoWeeks(d: number): Moment;
        weeksInYear(): number;
        isoWeeksInYear(): number;
        isoWeeksInISOWeekYear(): number;
        dayOfYear(): number;
        dayOfYear(d: number): Moment;

        from(inp: MomentInput, suffix?: boolean): string;
        to(inp: MomentInput, suffix?: boolean): string;
        fromNow(withoutSuffix?: boolean): string;
        toNow(withoutPrefix?: boolean): string;

        diff(b: MomentInput, unitOfTime?: unitOfTime.Diff, precise?: boolean): number;

        toArray(): [number, number, number, number, number, number, number];
        toDate(): Date;
        toISOString(keepOffset?: boolean): string;
        inspect(): string;
        toJSON(): string;
        unix(): number;

        isLeapYear(): boolean;
        /**
         * @deprecated in favor of utcOffset
         */
        zone(): number;
        zone(b: number|string): Moment;
        utcOffset(): number;
        utcOffset(b: number|string, keepLocalTime?: boolean): Moment;
        isUtcOffset(): boolean;
        daysInMonth(): number;
        isDST(): boolean;

        zoneAbbr(): string;
        zoneName(): string;

        isBefore(inp?: MomentInput, granularity?: unitOfTime.StartOf): boolean;
        isAfter(inp?: MomentInput, granularity?: unitOfTime.StartOf): boolean;
        isSame(inp?: MomentInput, granularity?: unitOfTime.StartOf): boolean;
        isSameOrAfter(inp?: MomentInput, granularity?: unitOfTime.StartOf): boolean;
        isSameOrBefore(inp?: MomentInput, granularity?: unitOfTime.StartOf): boolean;
        isBetween(a: MomentInput, b: MomentInput, granularity?: unitOfTime.StartOf, inclusivity?: "()" | "[)" | "(]" | "[]"): boolean;

        /**
         * @deprecated as of 2.8.0, use locale
         */
        lang(language: LocaleSpecifier): Moment;
        /**
         * @deprecated as of 2.8.0, use locale
         */
        lang(): Locale;

        locale(): string;
        locale(locale: LocaleSpecifier): Moment;

        localeData(): Locale;

        /**
         * @deprecated no reliable implementation
         */
        isDSTShifted(): boolean;

        // NOTE(constructor): Same as moment constructor
        /**
         * @deprecated as of 2.7.0, use moment.min/max
         */
        max(inp?: MomentInput, format?: MomentFormatSpecification, strict?: boolean): Moment;
        /**
         * @deprecated as of 2.7.0, use moment.min/max
         */
        max(inp?: MomentInput, format?: MomentFormatSpecification, language?: string, strict?: boolean): Moment;

        // NOTE(constructor): Same as moment constructor
        /**
         * @deprecated as of 2.7.0, use moment.min/max
         */
        min(inp?: MomentInput, format?: MomentFormatSpecification, strict?: boolean): Moment;
        /**
         * @deprecated as of 2.7.0, use moment.min/max
         */
        min(inp?: MomentInput, format?: MomentFormatSpecification, language?: string, strict?: boolean): Moment;

        get(unit: unitOfTime.All): number;
        set(unit: unitOfTime.All, value: number): Moment;
        set(objectLiteral: MomentSetObject): Moment;

        toObject(): MomentObjectOutput;
    }

    export var version: string;
    export var fn: Moment;

    // NOTE(constructor): Same as moment constructor
    /**
     * @param strict Strict parsing disables the deprecated fallback to the native Date constructor when
     * parsing a string.
     */
    export function utc(inp?: MomentInput, strict?: boolean): Moment;
    /**
     * @param strict Strict parsing requires that the format and input match exactly, including delimiters.
     * Strict parsing is frequently the best parsing option. For more information about choosing strict vs
     * forgiving parsing, see the [parsing guide](https://momentjs.com/guides/#/parsing/).
     */
    export function utc(inp?: MomentInput, format?: MomentFormatSpecification, strict?: boolean): Moment;
    /**
     * @param strict Strict parsing requires that the format and input match exactly, including delimiters.
     * Strict parsing is frequently the best parsing option. For more information about choosing strict vs
     * forgiving parsing, see the [parsing guide](https://momentjs.com/guides/#/parsing/).
     */
    export function utc(inp?: MomentInput, format?: MomentFormatSpecification, language?: string, strict?: boolean): Moment;

    export function unix(timestamp: number): Moment;

    export function invalid(flags?: MomentParsingFlagsOpt): Moment;
    export function isMoment(m: any): m is Moment;
    export function isDate(m: any): m is Date;
    export function isDuration(d: any): d is Duration;

    /**
     * @deprecated in 2.8.0
     */
    export function lang(language?: string): string;
    /**
     * @deprecated in 2.8.0
     */
    export function lang(language?: string, definition?: Locale): string;

    export function locale(language?: string): string;
    export function locale(language?: string[]): string;
    export function locale(language?: string, definition?: LocaleSpecification | null | undefined): string;

    export function localeData(key?: string | string[]): Locale;

    export function duration(inp?: DurationInputArg1, unit?: DurationInputArg2): Duration;

    // NOTE(constructor): Same as moment constructor
    export function parseZone(inp?: MomentInput, format?: MomentFormatSpecification, strict?: boolean): Moment;
    export function parseZone(inp?: MomentInput, format?: MomentFormatSpecification, language?: string, strict?: boolean): Moment;

    export function months(): string[];
    export function months(index: number): string;
    export function months(format: string): string[];
    export function months(format: string, index: number): string;
    export function monthsShort(): string[];
    export function monthsShort(index: number): string;
    export function monthsShort(format: string): string[];
    export function monthsShort(format: string, index: number): string;

    export function weekdays(): string[];
    export function weekdays(index: number): string;
    export function weekdays(format: string): string[];
    export function weekdays(format: string, index: number): string;
    export function weekdays(localeSorted: boolean): string[];
    export function weekdays(localeSorted: boolean, index: number): string;
    export function weekdays(localeSorted: boolean, format: string): string[];
    export function weekdays(localeSorted: boolean, format: string, index: number): string;
    export function weekdaysShort(): string[];
    export function weekdaysShort(index: number): string;
    export function weekdaysShort(format: string): string[];
    export function weekdaysShort(format: string, index: number): string;
    export function weekdaysShort(localeSorted: boolean): string[];
    export function weekdaysShort(localeSorted: boolean, index: number): string;
    export function weekdaysShort(localeSorted: boolean, format: string): string[];
    export function weekdaysShort(localeSorted: boolean, format: string, index: number): string;
    export function weekdaysMin(): string[];
    export function weekdaysMin(index: number): string;
    export function weekdaysMin(format: string): string[];
    export function weekdaysMin(format: string, index: number): string;
    export function weekdaysMin(localeSorted: boolean): string[];
    export function weekdaysMin(localeSorted: boolean, index: number): string;
    export function weekdaysMin(localeSorted: boolean, format: string): string[];
    export function weekdaysMin(localeSorted: boolean, format: string, index: number): string;

    export function min(moments: Moment[]): Moment;
    export function min(...moments: Moment[]): Moment;
    export function max(moments: Moment[]): Moment;
    export function max(...moments: Moment[]): Moment;

    /**
     * Returns unix time in milliseconds. Overwrite for profit.
     */
    export function now(): number;

    export function defineLocale(language: string, localeSpec: LocaleSpecification | null): Locale;
    export function updateLocale(language: string, localeSpec: LocaleSpecification | null): Locale;

    export function locales(): string[];

    export function normalizeUnits(unit: unitOfTime.All): string;
    export function relativeTimeThreshold(threshold: string): number | boolean;
    export function relativeTimeThreshold(threshold: string, limit: number): boolean;
    export function relativeTimeRounding(fn: (num: number) => number): boolean;
    export function relativeTimeRounding(): (num: number) => number;
    export function calendarFormat(m: Moment, now: Moment): string;

    export function parseTwoDigitYear(input: string): number;
    /**
     * Constant used to enable explicit ISO_8601 format parsing.
     */
    export var ISO_8601: MomentBuiltinFormat;
    export var RFC_2822: MomentBuiltinFormat;

    export var defaultFormat: string;
    export var defaultFormatUtc: string;

    export var suppressDeprecationWarnings: boolean;
    export var deprecationHandler: ((name: string | null, msg: string) => void) | null | undefined;

    export var HTML5_FMT: {
        DATETIME_LOCAL: string,
        DATETIME_LOCAL_SECONDS: string,
        DATETIME_LOCAL_MS: string,
        DATE: string,
        TIME: string,
        TIME_SECONDS: string,
        TIME_MS: string,
        WEEK: string,
        MONTH: string
    };

}
