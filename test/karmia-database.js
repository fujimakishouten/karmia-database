/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true, nomen: true */
/*global before, describe, it */
'use strict';



// Variables
var expect = require('expect.js'),
    database = require('../');

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
});



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */

