/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true, nomen: true */
/*global before, describe, it */
'use strict';



// Variables
var database,
    expect = require('expect.js'),
    Database = require('../index'),
    config = {
        host: 'localhost',
        port: 27017,
        database: 'karmia_database'
    },
    schema = {
        user: {
            user_id: {type: String, unique: true},
            name: {type: String}
        },
        user_point: {
            user_id: {type: String, unique: true},
            point: {type: Number}
        }
    };


// Before
before(function (done) {
    database = new Database('mongodb', config);
    database.connect(function () {
        const connection = database.getConnection();
        connection.db.dropDatabase(function () {
            database.configure(schema, done);
        });
    });
});


// Test
describe('karmia-database', function () {
    it('Should get suite', function (done) {
        const suite = database.suite('user').add('user').add('user_point'),
            a = suite.create('TEST_ID_001'),
            b = suite.create('TEST_ID_002');

        a.get(function (error, result) {
            console.log(result);
            b.get(function (error, result) {
                console.log(result);
                a.set({name: 'TEST_NAME_001'}, function (error, result) {
                    b.set({name: 'TEST_NAME_002'}, function (error, result) {
                        a.get(function (error, result) {
                            console.log(result);
                            b.get(function (error, result) {
                                console.log(result);
                                a.delete(function () {
                                    b.delete(done);
                                });
                            });
                        });
                    });
                });
            });
        });

    });
});



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */

