module.exports = class Router {
    constructor(routePath, app, client) {
        if (app === null) throw new Error('Missing required App!');

        this.app = app;
        this.client = client;
        this.routePath = routePath;
        this._routes = [];
        this.registerServices();
    }

    get services() { return {}; }

    registerServices() {
        const services = this.services;
        Object.keys(services).forEach(fullPath => {
            const serviceFunc = services[fullPath];
            const pathItems = fullPath.split(' ');
            const verb = (pathItems.length > 1 ? pathItems[0] : 'get').toLowerCase();
            const path = this.routePath + (pathItems.length > 1 ? pathItems[1] : fullPath);

            this.app[verb](path, this[serviceFunc].bind(this));
        });
    }
};