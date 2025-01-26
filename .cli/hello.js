module.exports = class Hello extends process.Command {

    commandName = 'hello';

    commandDescription = 'Hello command';

    handle() {

        this.info('Hello');
    }
}
