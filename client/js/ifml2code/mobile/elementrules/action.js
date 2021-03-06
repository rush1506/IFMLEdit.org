// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    pcn = require('../../../pcn').pcn,
    createRule = require('almost').createRule;

exports.rules = [
    createRule( // map list
        function (element, model) { return model.isAction(element); },
        function (element, model) {
            var id = element.id,
                name = element.attributes.name,
                parameters = element.attributes.parameters,
                results = element.attributes.results,
                events = _.chain(model.getChildren(id))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (id) { return model.getOutbounds(id).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) { return { id: event.id, name: event.attributes.name}; })
                    .value(),
                obj = {
                    actions: {children: 'A-' + id}
                };
            obj['A-' + id] = {name: id + '.js', content: require('./templates/action.js.ejs')({id: id, name: name, parameters: parameters, results: results, events: events})};
            return obj;
        }
    )
];
