# Cli tool

This is a powerful and versatile tool designed to simplify the creation of command-line commands using the Node.js runtime. With an intuitive interface and robust functionality, it allows developers to build custom CLI commands effortlessly and with precision. Additionally, the library includes a comprehensive set of standard commands, thoughtfully crafted to enhance productivity and streamline common tasks. Whether you're a developer automating workflows or an administrator managing system operations, this tool provides a seamless and efficient solution to meet your command-line needs.

## Installation

```bash
npm install -g bfg-cli-tool
```

## Usage

### List all commands and help
To view a list of all available commands and access detailed help, simply execute the following command in your terminal:
```bash
cli
```
By default, the tool comes with a collection of preconfigured commands designed to handle various common tasks efficiently. These built-in commands serve as a foundation for both developers and administrators, streamlining workflows and automating repetitive actions. A detailed overview of these commands will be provided in the following sections.


### Completion install (bash, zsh, fish)
To enable command completion for the tool, you need to run the following command in the terminal:
```bash
cli completion:install
```
> Don't work in windows terminal

### Completion uninstall
To disable command completion for the tool, you need to run the following command in the terminal:
```bash
cli completion:uninstall
```
> Don't work in windows terminal

### Create new command
To create a new command, you need to run the following command in the terminal:
```bash
cli make:command <command-name>
```
```
-c, --command <command-signature>        Command name signature
-d, --description <command-description>  Command description
-f, --force                              Overwrite existing command
-i, --interface                          Create command ".ts" interface
```
The command will be created and available only in the folder in which you execute the command to create. If you want the command to be global, create commands in the user's home directory.

### Config (show, set, remove, edit)
To work with the configuration, you need to run the following command in the terminal:

#### set
Use the following command to set a configuration:
```bash
cli cfg:set <name> <value>
```
```
-s, --store <store>  Set store for config save (default: "tmp")
```

#### show
To show a configuration, use the following command:
```bash
cli cfg:show <name> 
```
You can show all configurations:
```bash
cli cfg:show
```

#### remove
To remove a configuration, use the following command:
```bash
cli cfg:remove <name>
```
```
-s, --store <store>  Set store for config save (default: "tmp")
```

#### edit
To edit a configuration file, use the following command:
```bash
cli cfg:edit
```
```
-s, --store <store>  Set store for config save (default: "tmp")
```

### Git (pull, push, reset, tag, untag)
To work with the git repository, you need to run the following command in the terminal:
```bash
cli git:<command> <args>
```
You can make aliases for the git command:
```bash
cli git:pull --alias pull
...
```

### Find in files or find file
To search for a file or text in a file, you need to run the following command in the terminal:
```bash
cli find [value-in-files]
```
```
-f, --file <file>       Select file mask to search
-i, --ignore <pattern>  Ignore pattern
-s, --max <size>        File max size in bytes or (1B, 1K, 1M, 1G, 1T)
-m, --min <size>        File min size in bytes or (1B, 1K, 1M, 1G, 1T)
-c, --created <date>    File created date
-u, --updated <date>    File updated date
-j, --json              Output as JSON
```
You can search for a file by name or text in a file. The search is recursive and is performed in the current directory.

### Parallel
To run commands in parallel, you need to run the following command in the terminal:
```bash
cli parallel <commands...>
```
```
-i, --immortal               Keep alive all process
-t, --tries <tries>          Tries to repeat command if error (no limit if 0) (default: 0)
-f, --file <file>            File to execute
-c, --create                 Create file with commands list
-g, --global                 Global file with commands list
-d, --directory <directory>  Directory to execute (default: "/Users/name")
```
You can run commands in parallel. The commands are executed in the order in which they are specified. If the `--immortal` option is specified, the commands will be executed again if an error occurs. The `--tries` option specifies the number of attempts to execute the command if an error occurs. If the `--file` option is specified, the commands will be read from the file. If the `--create` option is specified, a file with a list of commands will be created. If the `--global` option is specified, the file with the list of commands will be created in the user's home directory. The `--directory` option specifies the directory in which the commands will be executed.

#### Repeat command
For run command 10 times in parallel you can use the following prefix `x10`:
```bash
cli parallel "x10 command"
```
> `x` - should always be the first prefix if needed

#### Repeat command with tries
You can also specify the number of attempts to execute the command if an error occurs:
```bash
cli parallel "x10 command" --tries 3
```
Or specify tries for one or more commands you can use the following prefix `t3`:
```bash
cli parallel "x10 command1" "x10t3 command2" "t3 command3"
```
> Mandatory after `x10` if there is one.

#### Immortal command
If you want make immortal only for one or more commands, you can use the following prefix `@`:
```bash
cli parallel "command1" "x10@ command2" "@ command3"
```
> Mandatory after `t3` if there is one. Or after `x10` if there is one.

#### Switch off immortal
Also you can switch off immortal for one or more commands:
```bash
cli parallel "command1" "x10! command2" "! command3" --immortal
```
In this case only `command1` will be immortal.
> Mandatory after `@` if there is one. Or after `t3` if there is one. Or after `x10` if there is one.

#### Create file with commands list
If you want to create a file with a list of commands, you can use the following option `--create`:
```bash
cli parallel "command1" "x10 command2" "command3" --create --file my_commands
```
> The file will be created in the current directory.
After that, you can run the commands from the file:
```bash
cli parallel --file my_commands
```
