/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';




// Variables
const _ = require('lodash'),
    mongoose = require('mongoose'),
    converter = require('./converter'),
    table = require('./table'),
    sequence = require('./sequence'),
    suite = require('./suite');


/**
 * KarmiaDatabaseAdapter
 *
 * @class
 */
class KarmiaDatabaseAdapter {

    /**
     * constructor
     *
     * @construct KarmiaDatabaseAdapter
     * @param     {Object} config
     */
    constructor(config) {
        const self = this;
        self.connection = mongoose.createConnection();
        self.schemas = {};
        self.models = {};
        self.suites = {};
        self.host = config.host || 'localhost';
        self.port = config.port || 27017;
        self.database = config.database || 'test';
        self.options = config.options || {};
        self.user = config.user;
        self.password = config.password;
    }


    /**
     * Get connection
     *
     * @returns {*}
     */
    getConnection() {
        const self = this;

        return self.connection;
    }


    /**
     * Connect to database
     *
     * @param {Function} callback
     */
    connect(callback) {
        const self = this,
            options = _.merge({}, self.options);
        options.user = options.user || self.user;
        options.pass = options.pass || options.password || self.password;

        self.connection.open(self.host, self.database, self.port, options, callback);
    }


    /**
     * Get table object
     *
     * @param   {string} name
     * @returns {KarmiaDatabaseTable}
     */
    table(name) {
        const self = this;

        return self.models[name];
    }


    /**
     * Get table suite object
     *
     * @param   {string} name
     * @returns {KarmiaDatabaseSuite}
     */
    suite(name) {
        const self = this;
        self.suites[name] = self.suites[name] || suite(self, name);

        return self.suites[name];
    }


    /**
     * Get sequence object
     *
     * @param   {string} key
     * @returns {KarmiaDatabaseSequence}
     */
    sequence(key) {
        const self = this;

        return sequence(self, key);
    }


    /**
     * Configure tables
     *
     * @param {Object} definitions
     * @param {Function} callback
     */
    setup(definitions, callback) {
        const self = this;
        _.forEach(converter.schema.convert(definitions), function (value, key) {
            const options = value.options || {};
            if (!_.has(options, 'timestamps')) {
                options.timestamps = {
                    createdAt: 'created_at',
                    updatedAt: 'updated_at'
                };
            }

            const schema = new mongoose.Schema(value.schema, options);
            _.forEach(value.indexes, function (index) {
                schema.index(index.fields, index.options || {index: true});
            });

            if (value.ttl) {
                schema.index('created_at', {index: true}, value.ttl);
            }

            self.schemas[key] = value;
            self.models[key] = table(self.connection.model(key, schema), value.key, value.ttl);
        });

        callback();
    }
}



// Export module
module.exports = function (config) {
    return new KarmiaDatabaseAdapter(config);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
