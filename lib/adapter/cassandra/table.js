/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Variables
const _ = require('lodash');


/**
 * KarmiaDatabaseAdapter
 *
 * @class
 */
class KarmiaDatabaseTable {

    /**
     * constructor
     *
     * @construct KarmiaDatabaseTable
     * @param     {Object} model
     * @param     {Array|string} key
     */
    constructor(model, key) {
        const self = this;
        self.model = model;
        self.key = _.isArray(key) ? key : [key];
    }


    /**
     * Find items
     *
     * @param args
     * @param options
     * @param callback
     */
    find(args, options, callback) {
        if (_.isFunction(args)) {
            callback = args;
            args = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this;
        self.model.find(args, options, function (error, result) {
            if (error) {
                callback(error);
            } else {
                callback(null, result.toString());
            }
        });
    }


    /**
     * Find an item
     *
     * @param args
     * @param options
     * @param callback
     */
    get(args, options, callback) {
        if (_.isFunction(args)) {
            callback = args;
            args = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this;
        options.limit = options.limit || 1;
        self.find(args, options, function (error, result) {
            if (error) {
                callback(error);
            } else {
                callback(null, _.head(result) || null);
            }
        });
    }


    /**
     * Save
     *
     * @param data
     * @param options
     * @param callback
     */
    set(data, options, callback) {
        options = options || {};
        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this,
            model = new self.model(data);
        model.save(callback);
    }


    /**
     * Delete an item
     *
     * @param args
     * @param options
     * @param callback
     */
    delete(args, options, callback) {
        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this,
            model = new self.model(args);
        model.remove(callback);
    }

}



// Export module
module.exports = function (model, key) {
    return new KarmiaDatabaseTable(model, key);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
