/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
'use strict';



// Variables
const expect = require('expect.js'),
    karmia_database_adapter = require('karmia-database-adapter-memory'),
    karmia_database = require('../'),
    schema = require('./resource/schema'),
    fixture = require('./resource/user'),
    options = {};


// Test
describe('karmia-database', function () {
    describe('constructor', function () {
        it('Should get instance', function (done) {
            const database = karmia_database(karmia_database_adapter(options));

            expect(database.constructor.name).to.be('KarmiaDatabase');
            expect(database.adapter.constructor.name).to.be('KarmiaDatabaseAdapterMemory');

            done();
        });
    });

    describe('converter', function () {
        describe('error', function () {
            it('Should convert error', function (done) {
                const database = karmia_database(karmia_database_adapter(options));
                database.define('user', schema);
                database.connect().then(function () {
                    return database.sync();
                }).then(function () {
                    const table = database.table('user');
                    table.validate({}).catch(function (error) {
                        const result = database.converter.error.convert(error);

                        expect(result).to.have.keys(['user_id', 'email', 'name']);

                        done();
                    });
                });
            });
        });
    });

    describe('getConnection', function () {
        it('Should not get connection', function (done) {
            const database = karmia_database(karmia_database_adapter(options));
            expect(database.getConnection()).to.be(undefined);

            done();
        });

        it('Should get connection', function (done) {
            const database = karmia_database(karmia_database_adapter(options));
            database.connect().then(function () {
                const connection = database.getConnection();
                expect(connection.constructor.name).to.be('KarmiaDatabaseAdapterMemory');

                done();
            });
        });
    });

    describe('connect', function () {
        describe('Should connect to database', function () {
            it('Promise', function (done) {
                const database = karmia_database(karmia_database_adapter(options));
                database.connect().then(function () {
                    const connection = database.getConnection();
                    expect(connection.constructor.name).to.be('KarmiaDatabaseAdapterMemory');

                    done();
                }).catch(function (error) {
                    done(error);
                });
            });

            it('Callback', function (done) {
                const database = karmia_database(karmia_database_adapter(options));
                database.connect(function () {
                    const connection = database.getConnection();
                    expect(connection.constructor.name).to.be('KarmiaDatabaseAdapterMemory');

                    done();
                });
            });
        });
    });

    describe('disconnect', function () {
        describe('Should disconnect from database', function () {
            describe('Connected', function () {
                it('Promise', function (done) {
                    const database = karmia_database(karmia_database_adapter(options));
                    database.connect().then(function () {
                        return database.disconnect();
                    }).then(function (result) {
                        expect(result).to.be(undefined);

                        done();
                    }).catch(done);
                });

                it('Callback', function (done) {
                    const database = karmia_database(karmia_database_adapter(options));
                    database.connect().then(function () {
                        database.disconnect(function (error, result) {
                            if (error) {
                                return done(error);
                            }

                            expect(result).to.be(undefined);

                            done();
                        });
                    });
                });
            });

            describe('Not connected', function () {
                it('Promise', function (done) {
                    const database = karmia_database(karmia_database_adapter(options));
                    database.disconnect().then(function (result) {
                        expect(result).to.be(undefined);

                        done();
                    }).catch(done);
                });

                it('Callback', function (done) {
                    const database = karmia_database(karmia_database_adapter(options));
                    database.disconnect(function (error, result) {
                        if (error) {
                            return done(error);
                        }

                        expect(result).to.be(undefined);

                        done();
                    });
                });
            });
        });
    });

    describe('define', function () {
        it('Should define schema', function (done) {
            const database = karmia_database(karmia_database_adapter(options)),
                key = 'user';

            expect(database.schemas).to.be(undefined);
            database.define(key, schema);
            expect(database.schemas[key]).to.eql(schema);

            done();
        });

        it('Should merge schema', function (done) {
            const database = karmia_database(karmia_database_adapter(options)),
                key = 'user',
                update = {
                    properties: {
                        user_id: {
                            type: 'string',
                            format: 'uuid'
                        }
                    }
                },
                result = Object.assign({}, schema);
            result.properties = Object.assign({}, result.properties, update.properties);

            expect(database.schemas).to.be(undefined);
            database.define(key, schema);
            expect(database.schemas[key]).to.eql(schema);
            database.define(key, update);
            expect(database.schemas[key]).to.eql(result);

            done();
        });
    });

    describe('sync', function () {
        describe('Should sync database', function () {
            it('Promise', function (done) {
                const database = karmia_database(karmia_database_adapter(options)),
                    key = 'user';
                database.define(key, schema).sync().then(function () {
                    expect(database.tables[key].constructor.name).to.be('KarmiaDatabaseTable');

                    done();
                });
            });

            it('Callback', function (done) {
                const database = karmia_database(karmia_database_adapter(options)),
                    key = 'user';
                database.define(key, schema).sync(function () {
                    expect(database.tables[key].constructor.name).to.be('KarmiaDatabaseTable');

                    done();
                }).catch(function (error) {
                    done(error);
                });
            });
        });
    });

    describe('table', function () {
        const database = karmia_database(karmia_database_adapter(options)),
            key = 'user';

        before(function (done) {
            database.define(key, schema).sync().then(function () {
                const table = database.table(key);
                return Promise.all(fixture.map(function (data) {
                    return table.set(data);
                }));
            }).then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Should get table', function (done) {
            const table = database.table(key);
            expect(table.constructor.name).to.be('KarmiaDatabaseTable');

            done();
        });

        describe('validte', function () {
            describe('Should validate data', function () {
                describe('Validation OK', function () {
                    it('Promise', function (done) {
                        const table = database.table(key);

                        table.validate(fixture[0]).then(function (result) {
                            expect(result).to.be(fixture[0]);

                            done();
                        });
                    });

                    it('Callback', function (done) {
                        const table = database.table(key);

                        table.validate(fixture[0], function (error, result) {
                            if (error) {
                                return done(error);
                            }

                            expect(result).to.be(fixture[0]);

                            done();
                        });
                    });
                });

                describe('Validation error', function () {
                    it('Promise', function (done) {
                        const table = database.table(key);

                        table.validate({}).catch(function (error) {
                            expect(error).to.be.an('array');
                            expect(error).to.have.length(3);

                            done();
                        });
                    });

                    it('Callback', function (done) {
                        const table = database.table(key);

                        table.validate({}, function (error) {
                            expect(error).to.be.an('array');
                            expect(error).to.have.length(3);

                            done();
                        });
                    });
                });
            });
        });

        describe('count', function () {
            describe('Should count items', function () {
                it('Promise', function (done) {
                    const table = database.table(key);

                    table.count().then(function (result) {
                        expect(result).to.be(9);

                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const table = database.table(key);

                    table.count(function (error, result) {
                        if (error) {
                            return done(error);
                        }

                        expect(result).to.be(9);

                        done();
                    });
                });
            });
        });

        describe('get', function () {
            describe('Should get item', function () {
                it('Promose', function (done) {
                    const table = database.table(key),
                        conditions = {user_id: 1};
                    table.get(conditions).then(function (result) {
                        const data = fixture[0];

                        expect(data['user_id']).to.be(result['user_id']);
                        expect(data['email']).to.be(result['email']);
                        expect(data['name']).to.be(result['name']);
                        expect(data['birthday']).to.be(result['birthday']);
                        expect(data['blood_type']).to.be(result['blood_type']);
                        expect(data['size']).to.eql(result['size']);
                        expect(data['favorite_food']).to.be(result['favorite_food']);
                        expect(data['dislikes_food']).to.be(result['dislikes_food']);
                        expect(data['color']).to.be(result['color']);
                        expect(data['unit']).to.be(result['unit']);

                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const table = database.table(key),
                        conditions = {user_id: 1};
                    table.get(conditions, function (error, result) {
                        if (error) {
                            return done(error);
                        }

                        const data = fixture[0];

                        expect(data['user_id']).to.be(result['user_id']);
                        expect(data['email']).to.be(result['email']);
                        expect(data['name']).to.be(result['name']);
                        expect(data['birthday']).to.be(result['birthday']);
                        expect(data['blood_type']).to.be(result['blood_type']);
                        expect(data['size']).to.eql(result['size']);
                        expect(data['favorite_food']).to.be(result['favorite_food']);
                        expect(data['dislikes_food']).to.be(result['dislikes_food']);
                        expect(data['color']).to.be(result['color']);
                        expect(data['unit']).to.be(result['unit']);

                        done();
                    });
                });
            });
        });

        describe('find', function () {
            describe('Should find all items', function () {
                it('Promise', function (done) {
                    const table = database.table(key);

                    table.find().then(function (result) {
                        fixture.forEach(function (data, index) {
                            expect(data['user_id']).to.be(result[index]['user_id']);
                            expect(data['email']).to.be(result[index]['email']);
                            expect(data['name']).to.be(result[index]['name']);
                            expect(data['birthday']).to.be(result[index]['birthday']);
                            expect(data['blood_type']).to.be(result[index]['blood_type']);
                            expect(data['size']).to.eql(result[index]['size']);
                            expect(data['favorite_food']).to.be(result[index]['favorite_food']);
                            expect(data['dislikes_food']).to.be(result[index]['dislikes_food']);
                            expect(data['color']).to.be(result[index]['color']);
                            expect(data['unit']).to.be(result[index]['unit']);
                        });

                        done();
                    });
                });

                it('Callback', function (done) {
                    const table = database.table(key);

                    table.find(function (error, result) {
                        if (error) {
                            return done(error);
                        }

                        fixture.forEach(function (data, index) {
                            expect(data['user_id']).to.be(result[index]['user_id']);
                            expect(data['email']).to.be(result[index]['email']);
                            expect(data['name']).to.be(result[index]['name']);
                            expect(data['birthday']).to.be(result[index]['birthday']);
                            expect(data['blood_type']).to.be(result[index]['blood_type']);
                            expect(data['size']).to.eql(result[index]['size']);
                            expect(data['favorite_food']).to.be(result[index]['favorite_food']);
                            expect(data['dislikes_food']).to.be(result[index]['dislikes_food']);
                            expect(data['color']).to.be(result[index]['color']);
                            expect(data['unit']).to.be(result[index]['unit']);
                        });

                        done();
                    });
                });
            });

            describe('Should find items', function () {
                it('Promise', function (done) {
                    const table = database.table(key),
                        conditions = {
                            user_id: {
                                $in: [1, 2, 3]
                            }
                        };
                    table.find(conditions).then(function (result) {
                        fixture.slice(0, 3).forEach(function (data, index) {
                            expect(data['user_id']).to.be(result[index]['user_id']);
                            expect(data['email']).to.be(result[index]['email']);
                            expect(data['name']).to.be(result[index]['name']);
                            expect(data['birthday']).to.be(result[index]['birthday']);
                            expect(data['blood_type']).to.be(result[index]['blood_type']);
                            expect(data['size']).to.eql(result[index]['size']);
                            expect(data['favorite_food']).to.be(result[index]['favorite_food']);
                            expect(data['dislikes_food']).to.be(result[index]['dislikes_food']);
                            expect(data['color']).to.be(result[index]['color']);
                            expect(data['unit']).to.be(result[index]['unit']);
                        });

                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const table = database.table(key),
                        conditions = {
                            user_id: {
                                $in: [1, 2, 3]
                            }
                        };
                    table.find(conditions, function (error, result) {
                        if (error) {
                            return done(error);
                        }

                        fixture.slice(0, 3).forEach(function (data, index) {
                            expect(data['user_id']).to.be(result[index]['user_id']);
                            expect(data['email']).to.be(result[index]['email']);
                            expect(data['name']).to.be(result[index]['name']);
                            expect(data['birthday']).to.be(result[index]['birthday']);
                            expect(data['blood_type']).to.be(result[index]['blood_type']);
                            expect(data['size']).to.eql(result[index]['size']);
                            expect(data['favorite_food']).to.be(result[index]['favorite_food']);
                            expect(data['dislikes_food']).to.be(result[index]['dislikes_food']);
                            expect(data['color']).to.be(result[index]['color']);
                            expect(data['unit']).to.be(result[index]['unit']);
                        });

                        done();
                    });
                });
            });
        });

        describe('set', function () {
            const data = {
                user_id: 10,
                name: 'Yukiho Kosaka',
                email: 'yukiho@μs.jp'
            };

            describe('Should insert item', function () {
                it('Promise', function (done) {
                    const table = database.table(key);

                    table.get({user_id: data.user_id}).then(function (result) {
                        expect(result).to.be(null);

                        return table.set(data);
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return table.get({user_id: data.user_id});
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return table.remove({user_id: data.user_id});
                    }).then(function () {
                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const table = database.table(key);

                    table.get({user_id: data.user_id}).then(function (result) {
                        expect(result).to.be(null);

                        return new Promise(function (resolve, reject) {
                            table.set(data, function (error, result) {
                                return (error) ? reject(error) : resolve(result);
                            });
                        });
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return table.get({user_id: data.user_id});
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return table.remove({user_id: data.user_id});
                    }).then(function () {
                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });
            });

            describe('Should update item', function () {
                it('Promise', function (done) {
                    const table = database.table(key),
                        updated = Object.assign({}, data, {name: 'Kosaka Yukiho'});

                    table.get({user_id: data.user_id}).then(function (result) {
                        expect(result).to.be(null);

                        return table.set(data);
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        result['name'] = updated.name;

                        return table.set(result);
                    }).then(function (result) {
                        Object.keys(updated).forEach(function (key) {
                            expect(updated[key]).to.be(result[key]);
                        });

                        return table.get({user_id: data.user_id});
                    }).then(function (result) {
                        Object.keys(updated).forEach(function (key) {
                            expect(updated[key]).to.be(result[key]);
                        });

                        return table.remove({user_id: data.user_id});
                    }).then(function () {
                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const table = database.table(key),
                        updated = Object.assign({}, data, {name: 'Kosaka Yukiho'});

                    table.get({user_id: data.user_id}).then(function (result) {
                        expect(result).to.be(null);

                        return new Promise(function (resolve, reject) {
                            table.set(data, function (error, result) {
                                return (error) ? reject(error) : resolve(result);
                            });
                        });
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        result['name'] = updated.name;

                        return new Promise(function (resolve, reject) {
                            table.set(result, function (error, result) {
                                return (error) ? reject(error) : resolve(result);
                            });
                        });
                    }).then(function (result) {
                        Object.keys(updated).forEach(function (key) {
                            expect(updated[key]).to.be(result[key]);
                        });

                        return table.get({user_id: data.user_id});
                    }).then(function (result) {
                        Object.keys(updated).forEach(function (key) {
                            expect(updated[key]).to.be(result[key]);
                        });

                        return table.remove({user_id: data.user_id});
                    }).then(function () {
                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });
            });
        });

        describe('remove', function () {
            describe('Should remove item', function () {
                const data = {
                    user_id: 10,
                    name: 'Yukiho Kosaka',
                    email: 'yukiho@μs.jp'
                };

                it('Promise', function (done) {
                    const table = database.table(key);

                    table.set(data).then(function () {
                        return table.get({user_id: data.user_id});
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return table.remove({user_id: data.user_id});
                    }).then(function () {
                        return table.get({user_id: data.user_id});
                    }).then(function (result) {
                        expect(result).to.be(null);

                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const table = database.table(key);

                    table.set(data).then(function () {
                        return table.get({user_id: data.user_id});
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return new Promise(function (resolve, reject) {
                            table.remove({user_id: data.user_id}, function (error, result) {
                                return (error) ? reject(error) : resolve(result);
                            });
                        });
                    }).then(function () {
                        return table.get({user_id: data.user_id});
                    }).then(function (result) {
                        expect(result).to.be(null);

                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });
            });
        });


        after(function (done) {
            Object.keys(database.tables).forEach(function (key) {
                database.tables[key].model = [];
            });

            done();
        });
    });

    describe('sequence', function() {
        const database = karmia_database(karmia_database_adapter(options));

        before(function (done) {
            database.connect().then(function () {
                done();
            });
        });

        it('Should get sequence', function (done) {
            const sequence = database.sequence('sequence');

            expect(sequence.constructor.name).to.be('KarmiaDatabaseSequence');

            done();
        });

        describe('get', function () {
            it('Promise', function (done) {
                const sequence = database.sequence('sequence-promise');

                sequence.get().then(function (result) {
                    expect(result).to.be(1);

                    return sequence.get();
                }).then(function (result) {
                    expect(result).to.be(2);

                    return sequence.get();
                }).then(function (result) {
                    expect(result).to.be(3);

                    return sequence.get();
                }).then(function (result) {
                    expect(result).to.be(4);

                    return sequence.get();
                }).then(function (result) {
                    expect(result).to.be(5);

                    done();
                }).catch(function (error) {
                    done(error);
                })
            });

            it('Callback', function (done) {
                const sequence = database.sequence('sequence-callback');

                sequence.get(function (error, result) {
                    if (error) {
                        return done(error);
                    }

                    expect(result).to.be(1);
                    sequence.get(function (error, result) {
                        if (error) {
                            return done(error);
                        }

                        expect(result).to.be(2);
                        sequence.get(function (error, result) {
                            if (error) {
                                return done(error);
                            }

                            expect(result).to.be(3);
                            sequence.get(function (error, result) {
                                if (error) {
                                    return done(error);
                                }

                                expect(result).to.be(4);
                                sequence.get(function (error, result) {
                                    if (error) {
                                        return done(error);
                                    }

                                    expect(result).to.be(5);

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        after(function (done) {
            database.sequence = {};

            done();
        });
    });

    describe('suite', function () {
        const database = karmia_database(karmia_database_adapter(options)),
            key = 'user',
            table = 'user';

        before(function (done) {
            database.define(key, schema).sync().then(function () {
                const table = database.table(key);
                return Promise.all(fixture.map(function (data) {
                    return table.set(data);
                }));
            }).then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });

        it('Should get table suite', function (done) {
            const suite = database.suite('user');

            expect(suite.constructor.name).to.be('KarmiaDatabaseTableSuite');

            done();
        });

        it('Should add table to suite', function (done) {
            const suite = database.suite(key);

            expect(suite.tables).to.be(undefined);
            suite.add(table);
            expect(suite.tables).to.have.length(1);
            expect(suite.tables).to.contain(table);

            done();
        });

        describe('getId', function () {
            it('Should get ID', function (done) {
                const suite = database.suite(key),
                    id = 1;
                suite.add(table);

                const user = suite.create(id);

                expect(user.getId()).to.be(id);

                done();
            });
        });

        describe('get', function () {
            describe('Should get item', function () {
                it('Promose', function (done) {
                    const suite = database.suite(key);
                    suite.add(table);

                    const user = suite.create(1);
                    user.get().then(function (result) {
                        const data = fixture[0];

                        expect(data['user_id']).to.be(result['user_id']);
                        expect(data['email']).to.be(result['email']);
                        expect(data['name']).to.be(result['name']);
                        expect(data['birthday']).to.be(result['birthday']);
                        expect(data['blood_type']).to.be(result['blood_type']);
                        expect(data['size']).to.eql(result['size']);
                        expect(data['favorite_food']).to.be(result['favorite_food']);
                        expect(data['dislikes_food']).to.be(result['dislikes_food']);
                        expect(data['color']).to.be(result['color']);
                        expect(data['unit']).to.be(result['unit']);

                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const suite = database.suite(key);
                    suite.add(table);

                    const user = suite.create(1);
                    user.get(function (error, result) {
                        if (error) {
                            return done(error);
                        }

                        const data = fixture[0];

                        expect(data['user_id']).to.be(result['user_id']);
                        expect(data['email']).to.be(result['email']);
                        expect(data['name']).to.be(result['name']);
                        expect(data['birthday']).to.be(result['birthday']);
                        expect(data['blood_type']).to.be(result['blood_type']);
                        expect(data['size']).to.eql(result['size']);
                        expect(data['favorite_food']).to.be(result['favorite_food']);
                        expect(data['dislikes_food']).to.be(result['dislikes_food']);
                        expect(data['color']).to.be(result['color']);
                        expect(data['unit']).to.be(result['unit']);

                        done();
                    });
                });
            });
        });

        describe('set', function () {
            const data = {
                user_id: 10,
                name: 'Yukiho Kosaka',
                email: 'yukiho@μs.jp'
            };

            describe('Should insert item', function () {
                it('Promise', function (done) {
                    const suite = database.suite(key);
                    suite.add(table);

                    const user = suite.create(data.user_id);
                    user.get().then(function (result) {
                        expect(result).to.be(null);

                        return user.set(data);
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return user.get();
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return user.remove();
                    }).then(function () {
                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const suite = database.suite(key);
                    suite.add(table);

                    const user = suite.create(data.user_id);
                    user.get().then(function (result) {
                        expect(result).to.be(null);

                        return new Promise(function (resolve, reject) {
                            user.set(data, function (error, result) {
                                return (error) ? reject(error) : resolve(result);
                            });
                        });
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return user.get();
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return user.remove();
                    }).then(function () {
                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });
            });

            describe('Should update item', function () {
                it('Promise', function (done) {
                    const suite = database.suite(key),
                        updated = Object.assign({}, data, {name: 'Kosaka Yukiho'});
                    suite.add(table);

                    const user = suite.create(data.user_id);
                    user.get().then(function (result) {
                        expect(result).to.be(null);

                        return user.set(data);
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        result['name'] = updated.name;

                        return user.set(result);
                    }).then(function (result) {
                        Object.keys(updated).forEach(function (key) {
                            expect(updated[key]).to.be(result[key]);
                        });

                        return user.get();
                    }).then(function (result) {
                        Object.keys(updated).forEach(function (key) {
                            expect(updated[key]).to.be(result[key]);
                        });

                        return user.remove({user_id: data.user_id});
                    }).then(function () {
                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const suite = database.suite(key),
                        updated = Object.assign({}, data, {name: 'Kosaka Yukiho'});
                    suite.add(table);

                    const user = suite.create(data.user_id);
                    user.get().then(function (result) {
                        expect(result).to.be(null);

                        return new Promise(function (resolve, reject) {
                            user.set(data, function (error, result) {
                                return (error) ? reject(error) : resolve(result);
                            });
                        });
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        result['name'] = updated.name;

                        return new Promise(function (resolve, reject) {
                            user.set(result, function (error, result) {
                                return (error) ? reject(error) : resolve(result);
                            });
                        });
                    }).then(function (result) {
                        Object.keys(updated).forEach(function (key) {
                            expect(updated[key]).to.be(result[key]);
                        });

                        return user.get();
                    }).then(function (result) {
                        Object.keys(updated).forEach(function (key) {
                            expect(updated[key]).to.be(result[key]);
                        });

                        return user.remove({user_id: data.user_id});
                    }).then(function () {
                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });
            });
        });

        describe('remove', function () {
            describe('Should remove item', function () {
                const data = {
                    user_id: 10,
                    name: 'Yukiho Kosaka',
                    email: 'yukiho@μs.jp'
                };

                it('Promise', function (done) {
                    const suite = database.suite(key);
                    suite.add(table);

                    const user = suite.create(data.user_id);
                    user.set(data).then(function () {
                        return user.get();
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return user.remove();
                    }).then(function () {
                        return user.get();
                    }).then(function (result) {
                        expect(result).to.be(null);

                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });

                it('Callback', function (done) {
                    const suite = database.suite(key);
                    suite.add(table);

                    const user = suite.create(data.user_id);
                    user.set(data).then(function () {
                        return user.get();
                    }).then(function (result) {
                        Object.keys(data).forEach(function (key) {
                            expect(data[key]).to.be(result[key]);
                        });

                        return new Promise(function (resolve, reject) {
                            user.remove(function (error, result) {
                                return (error) ? reject(error) : resolve(result);
                            });
                        });
                    }).then(function () {
                        return user.get();
                    }).then(function (result) {
                        expect(result).to.be(null);

                        done();
                    }).catch(function (error) {
                        done(error);
                    });
                });
            });
        });

        after(function (done) {
            Object.keys(database.tables).forEach(function (key) {
                database.tables[key].model = [];
            });

            done();
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
