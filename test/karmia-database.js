/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true, nomen: true */
/*global before, describe, it */
'use strict';



// Variables
var _ = require('lodash'),
    expect = require('expect.js'),
    database = require('../'),
    schema = {
        type: 'object',
        properties: {
            key: {
                type: 'string',
                required: true,
                unique: true
            },
            value: {
                type: 'string',
                default: ''
            }
        }
    };

// Test
describe('karmia-database', function () {
    describe('Should get instance', function () {
        it('Config is not include type', function () {
            const type = 'mongodb',
                config = {
                    host: 'test_host',
                    port: 65535,
                    database: 'test_database'
                },
                db = database(type, config);

            expect(db.adapter.host).to.be(config.host);
            expect(db.adapter.port).to.be(config.port);
            expect(db.adapter.database).to.be(config.database);
        });

        it('Config is include type', function () {
            const config = {
                    type: 'mongodb',
                    host: 'test_host',
                    port: 65535,
                    database: 'test_database'
                },
                db = database(config);

            expect(db.adapter.host).to.be(config.host);
            expect(db.adapter.port).to.be(config.port);
            expect(db.adapter.database).to.be(config.database);
        });
    });

    describe('validateSchema', function () {
        describe('Should validate schema', function () {
            it('Sync', function (done) {
                const db = database('mongodb', {});
                expect(db.validateSchema(schema)).to.eql([]);

                done();
            });

            it('Async', function (done) {
                const db = database('mongodb', {});
                expect(db.validateSchema(schema, function (error) {
                    expect(error).to.eql([]);

                    done();
                }));
            });
        });

        describe('Should be error', function () {
            it('Sync', function (done) {
                const db = database('mongodb', {}),
                    errors = db.validateSchema({type: 'error'});
                _.forEach(errors, function (error) {
                    expect(_.chain(error).keys().sort().value()).to.eql(['actual', 'message', 'property']);
                    expect(error.actual).to.be('error');
                });

                done();
            });

            it('Async', function (done) {
                const db = database('mongodb', {});
                db.validateSchema({type: 'error'}, function (errors) {
                    _.forEach(errors, function (error) {
                        expect(_.chain(error).keys().sort().value()).to.eql(['actual', 'message', 'property']);
                        expect(error.actual).to.be('error');
                    });

                    done();
                });
            });
        });
    });

    describe('converter', function () {
        describe('error', function () {
            it('Should convert errors from array to object', function () {
                const db = database('mongodb', {}),
                    errors = [
                        {
                            property: '$[\'user_id\']',
                            message: 'property is required',
                            actual: undefined
                        }, {
                            property: '$[\'data\'][\'key\']',
                            message: 'property is required',
                            actual: undefined
                        }
                    ];

                expect(db.error.convert(errors)).to.eql({
                    user_id: {
                        property: '$[\'user_id\']',
                        message: 'property is required',
                        actual: undefined,
                        path: 'user_id'
                    },
                    data: {
                        key: {
                            property: '$[\'data\'][\'key\']',
                            message: 'property is required',
                            actual: undefined,
                            path: 'data.key'
                        }
                    }
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

