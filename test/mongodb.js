/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true, nomen: true */
/*global before, describe, it */
'use strict';



// Variables
var db,
    _ = require('lodash'),
    async = require('neo-async'),
    expect = require('expect.js'),
    database = require('../'),
    config = {
        host: 'localhost',
        port: 27017,
        database: 'karmia_database'
    };


// beforeEach
before(function (done) {
    db = database('mongodb', config);
    async.series([
        // Connect to database
        function (done) {
            db.connect(done);
        },

        // Drop existing data
        function (done) {
            const connection = db.getConnection();
            connection.db.dropDatabase(done);
        },

        // Configure database
        function (done) {
            db.configure(require('./schema'), done);
        }
    ], done);
});


// Test
describe('karmia-database', function () {
    describe('mongodb', function () {
        describe('set', function () {
            it('Should set data', function (done) {
                const user = db.table('user'),
                    user_id = 'USER_ID_001',
                    name = 'USER_NAME_001',
                    point = 1;
                async.waterfall([
                    // Set user data
                    function (done) {
                        user.set({
                            user_id: user_id,
                            name: name,
                            point: point
                        }, done);
                    },

                    // Get user data
                    function (result, done) {
                        user.get({user_id: user_id}, done);
                    },

                    // Expect user data
                    function (result, done) {
                        expect(result.user_id).to.be(user_id);
                        expect(result.name).to.be(name);
                        expect(result.point).to.be(point);

                        done();
                    }
                ], done);
            });

            it('Should update data', function (done) {
                const user = db.table('user'),
                    user_id = 'USER_ID_001',
                    name = 'USER_NAME_001',
                    point = 1,
                    new_point = 100;
                async.waterfall([
                    // Set user data
                    function (done) {
                        user.set({
                            user_id: user_id,
                            name: name,
                            point: point
                        }, done);
                    },

                    // Get user data
                    function (result, done) {
                        user.get({user_id: user_id}, done);
                    },

                    // Expect user data
                    function (result, done) {
                        expect(result.user_id).to.be(user_id);
                        expect(result.name).to.be(name);
                        expect(result.point).to.be(point);

                        done();
                    },

                    // Update user data
                    function (done) {
                        user.set({
                            user_id: user_id,
                            point: new_point
                        }, done);
                    },

                    // Get user data
                    function (result, done) {
                        user.get({user_id: user_id}, done);
                    },

                    // Expect user data
                    function (result, done) {
                        expect(result.user_id).to.be(user_id);
                        expect(result.name).to.be(name);
                        expect(result.point).to.be(new_point);

                        done();
                    }
                ], done);
            });
        });

        describe('get', function () {
            it('Should get null', function (done) {
                const user = db.table('user'),
                    user_id = 'USER_ID_NOT_FOUND';
                async.waterfall([
                    // Get user data
                    function (done) {
                        user.get({user_id: user_id}, done);
                    },

                    // Expect user data
                    function (result, done) {
                        expect(result).to.be(null);

                        done();
                    }
                ], done);
            });
        });

        describe('find', function () {
            const user_id = 'USER_ID_001',
                items = [
                    {
                        user_id: user_id,
                        item_id: 'ITEM_ID_001',
                        name: 'ITEM_NAME_001'
                    }, {
                        user_id: user_id,
                        item_id: 'ITEM_ID_002',
                        name: 'ITEM_NAME_002'
                    }, {
                        user_id: user_id,
                        item_id: 'ITEM_ID_003',
                        name: 'ITEM_NAME_003'
                    }
                ];
            before(function (done) {
                const user_item = db.table('user_item'),
                    parallels = _.map(items, function (item) {
                    return function (done) {
                        user_item.set(item, done);
                    };
                });

                async.parallel(parallels, done);
            });

            it('Should find a user item', function (done) {
                const user_item = db.table('user_item'),
                    first = _.first(items);
                async.waterfall([
                    // Get user item data
                    function (done) {
                        user_item.find({
                            user_id: first.user_id,
                            item_id: first.item_id
                        }, done);
                    },

                    // Expect user item data
                    function (result, done) {
                        const item = _.first(result);
                        expect(result).to.be.an('array');
                        expect(result).to.have.length(1);
                        expect(item.user_id).to.be(first.user_id);
                        expect(item.item_id).to.be(first.item_id);
                        expect(item.name).to.be(first.name);

                        done();
                    }
                ], done);
            });

            it('Should find all user items', function (done) {
                const user_item = db.table('user_item');
                async.waterfall([
                    // Get user item data
                    function (done) {
                        user_item.find(done);
                    },

                    // Expect user item data
                    function (result, done) {
                        expect(result).to.be.an('array');
                        expect(result).to.have.length(3);
                        _.forEach(result, function (item, index) {
                            expect(item.user_id).to.be(items[index].user_id);
                            expect(item.item_id).to.be(items[index].item_id);
                            expect(item.name).to.be(items[index].name);
                        });

                        done();
                    }
                ], done);
            });
        });

        describe('delete', function () {
            it('Should delete user data', function (done) {
                const user = db.table('user'),
                    user_id = 'USER_ID_001',
                    name = 'USER_NAME_001',
                    point = 1;
                async.waterfall([
                    // Set user data
                    function (done) {
                        user.set({
                            user_id: user_id,
                            name: name,
                            point: point
                        }, done);
                    },

                    // Get user data
                    function (result, done) {
                        user.get({user_id: user_id}, done);
                    },

                    // Expect user data
                    function (result, done) {
                        expect(result).not.to.be(null);

                        done();
                    },

                    // Delete user data
                    function (done) {
                        user.delete({user_id: user_id}, done);
                    },

                    // Get user data
                    function (result, done) {
                        user.get({user_id: user_id}, done);
                    },

                    // Expect user data
                    function (result, done) {
                        expect(result).to.be(null);

                        done();
                    }
                ], done);
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

