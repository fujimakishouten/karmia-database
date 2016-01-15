/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';




// Variables
const adapters = require('./adapter');


/**
 * KarmiaDatabase
 *
 * @class
 */
class KarmiaDatabase {

    /**
     * Constructor
     *
     * @constructs KarmiaDatabase
     * @param      {string} type
     * @param      {Object} config
     */
    constructor(type, config) {
        const self = this;
        self.adapter = adapters[type](config);
    }


    /**
     * Get connection
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

        self.adapter.connect(callback);
    }


    /**
     * Get table object
     *
     * @param   {string} name
     * @returns {Object}
     */
    table(name) {
        const self = this;

        return self.adapter.table(name);
    }


    /**
     * Get table suite object
     *
     * @param   {string} name
     * @returns {Object}
     */
    suite(name) {
        const self = this;

        return self.adapter.suite(name);
    }


    /**
     * Get sequence object
     *
     * @param   {string} key
     * @returns {KarmiaDatabaseSequence}
     */
    sequence(key) {
        const self = this;

        return self.adapter.sequence(key);
    }


    configure(definition, callback) {
        const self = this;

        self.adapter.configure(definition, callback);
    }

}




// Export module
module.exports = function (type, config) {
    return new KarmiaDatabase(type, config);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
