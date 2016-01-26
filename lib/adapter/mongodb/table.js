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
     * @param     {number} ttl
     */
    constructor(model, key, ttl) {
        const self = this;
        self.model = model;
        self.ttl = ttl || 0;
        self.key = _.isArray(key) ? key : [key];
    }


    /**
     * Find items
     *
     * @param conditions
     * @param projection
     * @param options
     * @param callback
     */
    find(conditions, projection, options, callback) {
        if (_.isFunction(conditions)) {
            callback = conditions;
            conditions = projection = options = {};
        } else if (_.isFunction(projection)) {
            callback = projection;
            projection = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = projection;
            projection = {};
        }

        const self = this;
        self.model.find(conditions, projection, options, callback);
    }


    /**
     * Find an item
     *
     * @param conditions
     * @param projection
     * @param options
     * @param callback
     */
    get(conditions, projection, options, callback) {
        if (_.isFunction(conditions)) {
            callback = conditions;
            conditions = projection = options = {};
        } else if (_.isFunction(projection)) {
            callback = projection;
            projection = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = projection;
            projection = {};
        }

        const self = this;
        self.model.findOne(conditions, projection, options, callback);
    }


    /**
     * Save
     *
     * @param doc
     * @param options
     * @param callback
     */
    set(doc, options, callback) {
        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this,
            conditions = {},
            default_options = {
                new: true,
                upsert: true
            };
        _.forEach(self.key, function (value) {
            conditions[value] = doc[value];
        });

        self.model.findOneAndUpdate(conditions, doc, _.merge(default_options, options), callback);
    }


    /**
     * Delete an item
     *
     * @param conditions
     * @param options
     * @param callback
     */
    delete(conditions, options, callback) {
        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this;
        self.model.findOneAndRemove(conditions, options, callback);
    }

}


// Export module
module.exports = function (model, key, ttl) {
    return new KarmiaDatabaseTable(model, key, ttl);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
