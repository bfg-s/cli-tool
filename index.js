#!/usr/bin/env node

const application = require('./application');

(async () => {
    await application(true);
})();
