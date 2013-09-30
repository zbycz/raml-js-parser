/* global RAML, describe, it */

'use strict';

if (typeof window === 'undefined') {
    var raml           = require('../lib/raml.js');
    var chai           = require('chai');
    var expect         = chai.expect;
    var should         = chai.should();
    var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
} else {
    var raml           = RAML.Parser;
    chai.should();
}

describe('Resource Types', function () {
    it('should report an error with better message when circular reference is detected', function (done) {
        var definition = [
            '#%RAML 0.2',
            '---',
            'title: Title',
            'resourceTypes:',
            '   - a:',
            '       description: Resource type A',
            '       type: b',
            '   - b:',
            '       description: Resource type B',
            '       type: c',
            '   - c:',
            '       description: Resource type C',
            '       type: a',
            '/:',
            '   type: a'
        ].join('\n');
        raml.load(definition).should.be.rejected.with('circular reference of "a" has been detected: a -> b -> c -> a').and.notify(done);
    });

    it('should inherit properties when applied with parameters at at least second level (RT-295)', function (done) {
        var definition = [
            '#%RAML 0.2',
            '---',
            'title: Title',
            'resourceTypes:',
            '   - a:',
            '       get:',
            '           description: Hello, <<name>>',
            '   - b:',
            '       type:',
            '           a:',
            '               name: John Galt',
            '/:',
            '   type: b'
        ].join('\n');
        raml.load([definition]).should.become({
            title: 'Title',
            resourceTypes: [
                {
                    a: {
                        get: {
                            description: 'Hello, <<name>>'
                        }
                    }
                },

                {
                    b: {
                        type: {
                            a: {
                                name: 'John Galt'
                            }
                        }
                    }
                }
            ],
            resources: [
                {
                    type: 'b',
                    relativeUri: '/',
                    methods: [
                        {
                            method: 'get',
                            description: 'Hello, John Galt'
                        }
                    ]
                }
            ]
        }).and.notify(done);
    });
});