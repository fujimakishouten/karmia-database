/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
/*global before, describe, it */
'use strict';



// Variables
let db;
const _ = require('lodash'),
    async = require('neo-async'),
    database = require('../'),
    definition = require('./schema');

before(function (done) {
    db = database('cassandra', {hosts: ['localhost'], keyspace: 'test'});
    db.connect(function () {
        db.configure(definition, done);
    });
});

describe('Test', function () {
    it('Test', function (done) {
        async.series([
            // Save user data
            function (done) {
                const user = db.table('user'),
                    data = {user_id: 'TEST_USER_ID_001', name: 'TEST_USER_NAME_001', point: 1};
                user.set(data, done);
            },

            function (done) {
                // Save user items
                const user = db.table('user_item'),
                    data = [
                        {user_id: 'TEST_USER_ID_001', item_id: 'TEST_ITEM_ID_001', name: 'TEST_ITEM_NAME_001'},
                        {user_id: 'TEST_USER_ID_001', item_id: 'TEST_ITEM_ID_002', name: 'TEST_ITEM_NAME_002'},
                        {user_id: 'TEST_USER_ID_001', item_id: 'TEST_ITEM_ID_003', name: 'TEST_ITEM_NAME_003'}
                    ],
                    parallels = _.map(data, function (item) {
                        return function (done) {
                            user.set(item, done);
                        };
                    });

                async.parallel(parallels, done);
            },

            // Select user with suite
            function (done) {
                const user_suite = db.suite('user').add('user').add('user_item'),
                    user = user_suite.create('TEST_USER_ID_001');

                user.getItem(['TEST_ITEM_ID_001', 'TEST_ITEM_ID_002'], function (error, result) {
                    if (error) {
                        return done(error);
                    }

                    console.log(result);

                    done();
                });

            }
        ], done);
    });
});




/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
