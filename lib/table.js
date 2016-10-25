/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
"use strict";



/**
 * KarmiaDatabase
 *
 * @class
 */
class KarmiaDatabaseTable {
    /**
     * Constructor
     *
     * @param {Object} adapter
     * @param {string} name
     * @constructs KarmiaDatabaseTable
     */
    constructor(adapter, name) {
        const self = this;
        self.adapter = adapter;
        self.name = name;

        self.table = self.adapter.table(self.name);
    }

    /**
     * Validate data
     *
     * @param {Object} data
     * @param {Function} callback
     */
    validate(data, callback) {
        const self = this;

        return self.table.validate(data, callback);
    }

    /**
     * Count items
     *
     * @param   {Object} conditions
     * @param   {Function} callback
     */
    count(conditions, callback) {
        const self = this;
        if (conditions instanceof Function) {
            callback = conditions;
            conditions = {};
        }

        return self.table.count(conditions, callback);
    }

    /**
     * Get item
     *
     * @param   {Object} conditions
     * @param   {Object} options
     * @param   {Function} callback
     */
    get(conditions, options, callback) {
        const self = this;
        options = options || {};

        if (options instanceof Function) {
            callback = options;
            options = {};
        }

        if (conditions) {
            return self.table.get(conditions, options, callback);
        }

        return (callback) ? callback(null, null) : Promise.resolve();
    }

    /**
     * Find items
     *
     * @param   {Object} conditions
     * @param   {Object} options
     * @param   {Function} callback
     */
    find(conditions, options, callback) {
        if (conditions instanceof Function) {
            callback = conditions;
            conditions = {};
            options = {};
        }

        if (options instanceof Function) {
            callback = options;
            options = {};
        }

        const self = this;
        conditions = conditions || {};
        options = options || {};

        return self.table.find(conditions, options, callback);
    }

    /**
     * Save item
     *
     * @param {Object} data
     * @param {Object} options
     * @param {Function} callback
     */
    set(data, options, callback) {
        if (options instanceof Function) {
            callback = options;
            options = {};
        }

        const self = this;
        options = options || {};

        return self.table.set(data, options, callback);
    }

    /**
     * Remove item
     *
     * @param   {Object} conditions
     * @param   {Object} options
     * @param   {Function} callback
     */
    remove(conditions, options, callback) {
        if (options instanceof Function) {
            callback = options;
            options = {};
        }

        const self = this;
        options = options || {};

        if (conditions) {
            return self.table.remove(conditions, options, callback);
        }

        return (callback) ? callback() : Promise.resolve();
    }
}


// Export module
module.exports = function (adapter, name) {
    return new KarmiaDatabaseTable(adapter, name);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
