# Cli tool

This is a special tool with which you can easily and comfortably create a command in the Nodejs language.

## Installation

```bash
npm install -g bfg-cli-tool
```

## Usage

### List all commands and help
To list all commands and help, you need to run the following command in the terminal:
```bash
cli
```
By default, the extension has a set of ready-made commands, which will be discussed further.

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
cli find <value-or-file> [file]
```
```
-f, --find-file      Find file
```
On example:
```bash
cli find "*search value in files*" 
cli find -f "*.js"
```
Or use together:
```bash
cli find "const*" "*.js"
```
The command will search constants in all js files.

### Config (show, set)
To work with the configuration, you need to run the following command in the terminal:
```bash
cli cfg:set <name> <value>
cli cfg:show <name> 
```
