const fs = require('fs-extra');
const Generator = require('yeoman-generator');
const path = require('path');
const yosay = require('yosay');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.option('skip-welcome-message', {
            desc: 'Skips the welcome message',
            type: Boolean
        });

        this.option('skip-install', {
            desc: 'Skips the the installation of dependencies',
            type: Boolean
        });

        this.option('skip-git', {
            desc: 'Skips setup of the current folder as a git repository',
            type: Boolean
        });
    }

    initializing() {
        this.pkg = require('../../package.json');

        let packageConfig = fs.readJsonSync(path.resolve(__dirname, 'templates/_package.json'));

        packageConfig = {
            ...packageConfig,
            ...{
                'skip-main': true,
                'skip-test': true,
            }
        };

        this.composeWith(require.resolve('generator-npm-init/app'), packageConfig);
        if (!this.options['skip-git']) {
            this.composeWith(require.resolve('generator-git-init'));
        }
    }

    prompting() {
        if (!this.options['skip-welcome-message']) {
            this.log(yosay('\'Allo \'allo! Out of the box I include ExpressJS, middleware, and tools to build your microservice.'));
        }
    }

    writing() {
        this._writeApplication();
    }

    _writeApplication() {
        const filelistConfig = fs.readJsonSync(path.resolve(__dirname, 'filelist.json'));

        for (let fileInfo of filelistConfig.files) {
            this.fs.copyTpl(
                this.templatePath(fileInfo.local),
                this.destinationPath(fileInfo.destinationPath ? fileInfo.destinationPath : fileInfo.local), {});
        }
    }

    install() {
        if (!this.options['skip-install']) {
            this.installDependencies({
                bower: false,
                npm: true
            });
        }
    }
};
