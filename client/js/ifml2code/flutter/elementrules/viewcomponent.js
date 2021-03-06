// Copyright (c) 2017, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    pcn = require('../../../pcn').pcn,
    createRule = require('almost').createRule;

exports.rules = [
    createRule( // map list
        function (element, model) { return model.isViewComponent(element) && element.attributes.stereotype === 'list'; },
        function (element, model) {
            var id = element.id,
                name = element.attributes.name,
                collection = element.attributes.collection,
                filters = element.attributes.filters,
                fields = element.attributes.fields,
                incomings = _.chain(model.getInbounds(id))
                    .filter(function (id) { return model.isDataFlow(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (flow) {
                        var source = model.getSource(flow);
                        return {source: source.id, bindings: flow.attributes.bindings };
                    })
                    .value(),
                outgoings = _.chain(model.getOutbounds(id))
                    .filter(function (id) { return model.isDataFlow(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (flow) {
                        var target = model.getTarget(flow);
                        return {target: target.id, bindings: flow.attributes.bindings };
                    })
                    .value(),
                showSelection = outgoings.length !== 0,
                unfilteredevents = _.chain(model.getChildren(id))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (event) { return model.getOutbounds(event).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) { return { id: event.id, name: event.attributes.name, bindings: model.toElement(model.getOutbounds(event)[0]).attributes.bindings}; })
                    .value(),
                events = _.chain(unfilteredevents)
                    .reject({name: 'selected'})
                    .value(),
                selected = _.chain(unfilteredevents)
                    .filter({name: 'selected'})
                    .first()
                    .value(),
                obj = {
                    widgets: {children: 'c-' + id}
                };
            obj['c-' + id] = {name: id + '.dart', content: require('./templates/list.dart.ejs')({id: id, name: name, selected: selected, showSelection: showSelection, collection: collection, filters: filters, fields: fields, incomings: incomings, events: events})};
            return obj;
        }
    ),
    createRule( // map details
        function (element, model) { return model.isViewComponent(element) && element.attributes.stereotype === 'details'; },
        function (element, model) {
            var id = element.id,
                name = element.attributes.name,
                collection = element.attributes.collection,
                fields = element.attributes.fields,
                incomings = _.chain(model.getInbounds(id))
                    .filter(function (id) { return model.isDataFlow(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (flow) {
                        var source = model.getSource(flow);
                        return {source: source.id, bindings: flow.attributes.bindings };
                    })
                    .value(),
                events = _.chain(model.getChildren(id))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (id) { return model.getOutbounds(id).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) { return { id: event.id, name: event.attributes.name, bindings: model.toElement(model.getOutbounds(event)[0]).attributes.bindings}; })
                    .value(),
                obj = {
                    widgets: {children: 'c-' + id}
                };
            obj['c-' + id] = {name: id + '.dart', content: require('./templates/details.dart.ejs')({id: id, name: name, collection: collection, fields: fields, incomings: incomings, events: events})};
            return obj;
        }
    ),
    createRule( // map form
        function (element, model) { return model.isViewComponent(element) && element.attributes.stereotype === 'form'; },
        function (element, model) {
            var id = element.id,
                name = element.attributes.name,
                fields = element.attributes.fields,
                incomings = _.chain(model.getInbounds(id))
                    .filter(function (id) { return model.isDataFlow(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (flow) {
                        var source = model.getSource(flow);
                        return {source: source.id, bindings: flow.attributes.bindings };
                    })
                    .value(),
                events = _.chain(model.getChildren(id))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (id) { return model.getOutbounds(id).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) { return { id: event.id, name: event.attributes.name, bindings: model.toElement(model.getOutbounds(event)[0]).attributes.bindings}; })
                    .value(),
                obj = {
                    widgets: {children: 'c-' + id}
                };
            obj['c-' + id] = {name: id + '.dart', content: require('./templates/form.dart.ejs')({id: id, name: name, fields: fields, incomings: incomings, events: events})};
            return obj;
        }
    )
];
