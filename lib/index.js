/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
"use strict";



// Variables
const converter = require('./converter'),
    sequence = require('./sequence'),
    suite = require('./suite'),
    table = require('./table');


/**
 * KarmiaDatabase
 *
 * @class
 */
class KarmiaDatabase {
    /**
     * Constructor
     *
     * @param {Object} adapter
     * @param {Object} options
     * @constructs KarmiaDatabase
     */
    constructor(adapter, options) {
        const self = this;

        self.adapter = adapter;
        self.config = options || {};

        self.converter = converter(options.converter || options);
    }

    /**
     * Get database connection
     *
     * @returns {Object}
     */
    getConnection() {
        const self = this;

        return self.adapter.getConnection();
    }

    /**
     * Connect to database
     *
     * @param {Function} callback
     */
    connect(callback) {
        const self = this;

        return self.adapter.connect(callback);
    }

    /**
     * Disconnect from database
     *
     * @param {Function} callback
     */
    disconnect(callback) {
        const self = this;

        return self.adapter.disconnect(callback);
    }

    /**
     * Define schemas
     *
     * @param {string} table
     * @param {Object} schema
     */
    define(table, schema) {
        /**
         * Merge schemas
         *
         * @param   {Object} target
         * @param   {Object} source
         * @returns {Object}
         */
        function merge (target, source) {
            return Object.keys(source).reduce(function (collection, key) {
                if (Object.getPrototypeOf(source[key]) === Object.prototype) {
                    collection[key] = merge(collection[key] || {}, source[key]);
                } else {
                    collection[key] = source[key];
                }

                return collection;
            }, Object.assign({}, target));
        }


        const self = this;
        self.schemas = self.schemas || {};

        let definitions = {};
        if (table instanceof Object) {
            definitions = table;
        } else {
            definitions[table] = schema;
        }

        Object.keys(definitions).forEach(function (key) {
            self.schemas[key] = merge(self.schemas[key] || {}, definitions[key]);
        });

        return self;
    }

    /**
     * Sync database
     *
     * @param {Function} callback
     */
    sync(callback) {
        const self = this;
        Object.keys(self.schemas).forEach(function (key) {
            self.adapter.define(key, self.schemas[key]);
        });

        return self.adapter.sync().then(function () {
            self.tables = Object.keys(self.adapter.tables).reduce(function (collection, key) {
                collection[key] = table(self.adapter, key);

                return collection;
            }, {});

            return (callback) ? callback() : Promise.resolve();
        }).catch(function (error) {
            return (callback) ? callback(error) : Promise.reject(error);
        });
    }

    /**
     * Sync database
     *
     * @deprecated
     * @param {Function}callback
     */
    setup(callback) {
        const self = this;

        return self.sync(callback);
    }

    /**
     * Get table
     *
     * @param   {string} name
     * @returns {Object}
     */
    table(name) {
        const self = this;

        return self.tables[name];
    }

    /**
     * Get sequence
     *
     * @param   {string} key
     * @param   {Object} options
     * @returns {Object}
     */
    sequence(key, options) {
        const self = this;
        self.sequence = self.sequence || {};
        self.sequence[key] = self.sequence[key] || sequence(self.adapter, key, options);

        return self.sequence[key];
    }

    /**
     * Get table suite
     *
     * @param   {string} name
     * @returns {Object}
     */
    suite(name) {
        const self = this;
        self.suites = self.suites || {};
        self.suites[name] = self.suites[name] || suite(self.adapter, name);

        return self.suites[name];
    }
}


// Export module
module.exports = function (adapter, options) {
    return new KarmiaDatabase(adapter, options || {});
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
