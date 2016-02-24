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
     * @param     {Object} schema
     */
    constructor(model, schema) {
        const self = this;
        self.model = model;
        self.fields = _.keys(schema.schema);
        self.key = _.isArray(schema.key) ? schema.key : [schema.key];
        self.ttl = schema.ttl || 0;
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

        return self.model.find(conditions, projection, options, function (error, result) {
            if (error) {
                callback(error);
            } else {
                callback(null, _.map(result, function (value) {
                    return _.pick(value, self.fields);
                }));

                callback(null, result);
            }
        });
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

        return self.model.findOne(conditions, projection, options, function (error, result) {
            if (error) {
                callback(error);
            } else {
                result = _.pick(result, self.fields);

                callback(null, _.isEmpty(result) ? null : result);
            }
        });
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

        return self.model.findOneAndUpdate(conditions, doc, _.merge(default_options, options), callback);
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

        return self.model.findOneAndRemove(conditions, options, callback);
    }

}


// Export module
module.exports = function (model, schema) {
    return new KarmiaDatabaseTable(model, schema || {});
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
