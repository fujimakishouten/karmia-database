/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true, nomen: true */
/*global before, describe, it */
'use strict';



// Variables
var db,
    async = require('neo-async'),
    cassie = require('cassie-odm'),
    co = require('co'),
    expect = require('expect.js'),
    database = require('../'),
    config = {
        hosts: ['localhost'],
        keyspace: 'karmia_database'
    };


// beforeEach
before(function (done) {
    db = database('cassandra', config);
    async.series([
        // Connect to database
        db.connect.bind(db),

        // Drop existing keyspace
        function (done) {
            cassie.deleteKeyspace(config, function (error) {
                if (error) {
                    if (-1 === error.message.indexOf('Cannot drop non existing keyspace')) {
                        return done(error);
                    }
                }

                done();
            });
        },

        // Ensure keyspace
        cassie.checkKeyspace.bind(cassie, config),

        // Configure database
        function (done) {
            db.define(require('./schema'));
            db.setup(done);
        }
    ], done);
});


// Test
describe('karmia-database', function () {
    describe('cassandra', function () {
        describe('validate', function () {
            it('Should validate data', function (done) {
                const table = db.table('user'),
                    data = {
                        user_id: 'USER_ID_001',
                        name: 'USER_NAME_001',
                        point: 1
                    };

                expect(table.validate(data)).to.eql([]);

                done();
            });

            it('Should be error', function (done) {
                const table = db.table('user'),
                    data = {
                        user_id: 'USER_ID_001',
                        name: {first: 'FirstName', last: 'LastName'},
                        point: 1
                    },
                    errors = table.validate(data);

                expect(errors).to.have.length(1);
                expect(Object.keys(errors[0]).sort()).to.eql(['actual', 'message', 'property']);
                expect(errors[0].actual).to.be('object');

                done();
            });
        });

        describe('set', function () {
            it('Should set data', function (done) {
                co(function* () {
                    const user = db.table('user'),
                        user_id = 'USER_ID_001',
                        name = 'USER_NAME_001',
                        point = 1;

                    // Set data
                    yield user.set({
                        user_id: user_id,
                        name: name,
                        point: point
                    });

                    // Check result
                    const result = yield user.get({user_id: user_id});
                    expect(result.user_id).to.be(user_id);
                    expect(result.name).to.be(name);
                    expect(result.point).to.be(point);

                    done();
                });
            });

            it('Should update data', function (done) {
                co(function* () {
                    const user = db.table('user'),
                        user_id = 'USER_ID_001',
                        name = 'USER_NAME_001',
                        point = 1,
                        new_point = 100;

                    // Set data
                    yield user.set({
                        user_id: user_id,
                        name: name,
                        point: point
                    });

                    // Check result
                    let result = yield  user.get({user_id: user_id});
                    expect(result.user_id).to.be(user_id);
                    expect(result.name).to.be(name);
                    expect(result.point).to.be(point);

                    // Update data
                    yield user.set({
                        user_id: user_id,
                        point: new_point
                    });

                    // Check updated data
                    result = yield user.get({user_id: user_id});
                    expect(result.user_id).to.be(user_id);
                    expect(result.name).to.be(name);
                    expect(result.point).to.be(new_point);

                    done();
                });
            });
        });

        describe('get', function () {
            it('Should get null', function (done) {
                co(function* () {
                    const user = db.table('user'),
                        user_id = 'USER_ID_NOT_FOUND';

                    expect(yield user.get({user_id: user_id})).to.be(null);

                    done();
                });
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
                    parallels = items.map(function (item) {
                        return user_item.set(item);
                    });

                Promise.all(parallels).then(function () {
                    done();
                }).catch(done);
            });

            it('Should find a user item', function (done) {
                co(function* () {
                    const user_item = db.table('user_item'),
                        result = yield user_item.find({
                            user_id: items[0].user_id,
                            item_id: items[0].item_id
                        });

                    expect(result).to.be.an('array');
                    expect(result).to.have.length(1);
                    expect(result[0].user_id).to.be(items[0].user_id);
                    expect(result[0].item_id).to.be(items[0].item_id);
                    expect(result[0].name).to.be(items[0].name);

                    done();
                });
            });

            it('Should find all user items', function (done) {
                co(function* () {
                    const user_item = db.table('user_item'),
                        result = yield user_item.find();

                    expect(result).to.be.an('array');
                    expect(result).to.have.length(3);
                    result.forEach(function (item, index) {
                        expect(item.user_id).to.be(items[index].user_id);
                        expect(item.item_id).to.be(items[index].item_id);
                        expect(item.name).to.be(items[index].name);
                    });

                    done();
                });
            });
        });

        describe('delete', function () {
            it('Should delete user data', function (done) {
                co(function* () {
                    const user = db.table('user'),
                        user_id = 'USER_ID_001',
                        name = 'USER_NAME_001',
                        point = 1;

                    // Set data
                    yield user.set({
                        user_id: user_id,
                        name: name,
                        point: point
                    });

                    expect(yield user.get({user_id: user_id})).not.to.be(null);
                    yield user.remove({user_id: user_id});
                    expect(yield user.get({user_id: user_id})).to.be(null);

                    done();
                });
            });
        });

        describe('count', function () {
            it('Should count data', function (done) {
                co(function* () {
                    const table = db.table('user');

                    expect(yield table.count()).to.be(0);
                    yield table.set({user_id: 'USER_ID_001'});
                    expect(yield table.count()).to.be(1);

                    done();
                });
            });
        });

        describe('sequence', function () {
            it('Should get sequence', function (done) {
                co(function* () {
                    const key = 'TEST_SEQUENCE',
                        sequence = db.sequence(key);

                    expect(yield sequence.get()).to.be(1);
                    expect(yield sequence.get()).to.be(2);

                    done();
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

