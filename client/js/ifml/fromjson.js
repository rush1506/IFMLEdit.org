// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    utils = require('almost-joint').utils,
    ifml = require('./').ifml;

function mapViewContainer(container) {
    return new ifml.elements.ViewContainer({
        id: container.id,
        name: container.attributes.name,
        'default': container.attributes.default,
        landmark: container.attributes.landmark,
        xor: container.attributes.xor,
        width: container.attributes.width,
        height: container.attributes.height,
        orientation: container.attributes.orientation,

        thisLeft_toRightOf: container.attributes.thisLeft_toRightOf,
        thisLeft_toLeftOf: container.attributes.thisLeft_toLeftOf,
        thisRight_toRightOf: container.attributes.thisRight_toRightOf,
        thisRight_toLeftOf: container.attributes.thisRight_toLeftOf,
        thisTop_toTopOf: container.attributes.thisTop_toTopOf,
        thisTop_toBottomOf: container.attributes.thisTop_toBottomOf,
        thisBottom_toBottomOf: container.attributes.thisBottom_toBottomOf,
        thisBottom_toTopOf: container.attributes.thisBottom_toTopOf,
        
        visibility: container.attributes.visibility,
        gravity: container.attributes.gravity,
        className: container.attributes.className,
        margin: container.attributes.margin,
        marginRight: container.attributes.marginRight,
        marginLeft: container.attributes.marginLeft,
        marginBottom: container.attributes.marginBottom,
        marginTop: container.attributes.marginTop,
        padding: container.attributes.padding,
        paddingTop: container.attributes.paddingTop,
        paddingBottom: container.attributes.paddingBottom,
        paddingRight: container.attributes.paddingRight,
        paddingLeft: container.attributes.paddingLeft,
        maxWidth: container.attributes.maxWidth,
        maxHeight: container.attributes.maxHeight,
        minWidth: container.attributes.minWidth,
        minHeight: container.attributes.minHeight,
        zIndex: container.attributes.zIndex,
        overflow: container.attributes.overflow,
        border: container.attributes.border,
        font: container.attributes.font,
        color: container.attributes.color,
        align: container.attributes.align,
        opacity: container.attributes.opacity,
        filter: container.attributes.filter,
    });
}


function applyViewContainerMetadata(container, cells) {
    var cell = cells[container.id];
    cell.set('position', container.metadata.graphics.position);
    cell.set('size', container.metadata.graphics.size);
    if (container.metadata.statistics) {
        cell.set('statistics', container.metadata.statistics.slice());
    }
}

function mapViewComponent(component) {
    var attributes = {
        id: component.id,
        name: component.attributes.name,
        stereotype: component.attributes.stereotype,
        position: component.metadata.graphics.position,
        size: component.metadata.graphics.size,
        thisLeft_toRightOf: component.attributes.thisLeft_toRightOf,
        thisLeft_toLeftOf: component.attributes.thisLeft_toLeftOf,
        thisRight_toRightOf: component.attributes.thisRight_toRightOf,
        thisRight_toLeftOf: component.attributes.thisRight_toLeftOf,
        thisTop_toTopOf: component.attributes.thisTop_toTopOf,
        thisTop_toBottomOf: component.attributes.thisTop_toBottomOf,
        thisBottom_toBottomOf: component.attributes.thisBottom_toBottomOf,
        thisBottom_toTopOf: component.attributes.thisBottom_toTopOf,
    };
    switch (component.attributes.stereotype) {
    case 'details':
        attributes.collection = component.attributes.collection || '';
        attributes.fields = (component.attributes.fields && component.attributes.fields.slice()) || [];
        break;
    case 'list':
        attributes.collection = component.attributes.collection || '';
        attributes.fields = (component.attributes.fields && component.attributes.fields.slice()) || [];
        attributes.filters = (component.attributes.filters && component.attributes.filters.slice()) || [];
        break;
    case 'form':
        attributes.fields = (component.attributes.fields && component.attributes.fields.slice()) || [];
        attributes.types = (component.attributes.types && component.attributes.types.slice()) || [];
        attributes.names = (component.attributes.names && component.attributes.names.slice()) || [];
        attributes.labels = (component.attributes.labels && component.attributes.labels.slice()) || [];
        break;
    }
    return new ifml.elements.ViewComponent(attributes);
}

function applyViewComponentMetadata(component, cells) {
    var cell = cells[component.id];
    cell.set('position', component.metadata.graphics.position);
    cell.set('size', component.metadata.graphics.size);
    if (component.metadata.statistics) {
        cell.set('statistics', component.metadata.statistics.slice());
    }
}

function mapEvent(event) {
    return new ifml.elements.Event({
        id: event.id,
        name: {text: event.attributes.name},
    });
}

function applyEventMetadata(event, cells) {
    var cell = cells[event.id];
    cell.set('position', event.metadata.graphics.position);
    cell.prop('name/horizontal', event.metadata.graphics.name.horizontal);
    cell.prop('name/vertical', event.metadata.graphics.name.vertical);
    if (event.metadata.statistics) {
        cell.set('statistics', event.metadata.statistics.slice());
    }
}

function mapAction(action) {
    return new ifml.elements.Action({
        id: action.id,
        name: action.attributes.name,
        results: (action.attributes.results && action.attributes.results.slice()) || [],
        parameters: (action.attributes.parameters && action.attributes.parameters.slice()) || []
    });
}

function applyActionMetadata(action, cells) {
    var cell = cells[action.id];
    cell.set('position', action.metadata.graphics.position);
    cell.set('size', action.metadata.graphics.size);
    if (action.metadata.graphics.parent) {
        cells[action.metadata.graphics.parent].embed(cell);
    }
    if (action.metadata.statistics) {
        cell.set('statistics', action.metadata.statistics.slice());
    }
}

function mapDataFlow(flow) {
    return new ifml.links.DataFlow({
        id: flow.id,
        bindings: flow.attributes.bindings
    });
}

function applyDataFlowMetadata(flow, cells) {
    var cell = cells[flow.id];
    if (flow.metadata.graphics && flow.metadata.graphics.vertices) {
        cell.set('vertices', flow.metadata.graphics.vertices);
    }
    if (flow.metadata.statistics) {
        cell.set('statistics', flow.metadata.statistics.slice());
    }
}

function mapNavigationFlow(flow) {
    return new ifml.links.NavigationFlow({
        id: flow.id,
        bindings: flow.attributes.bindings
    });
}

function applyNavigationFlowMetadata(flow, cells) {
    var cell = cells[flow.id];
    if (flow.metadata.graphics && flow.metadata.graphics.vertices) {
        cell.set('vertices', flow.metadata.graphics.vertices);
    }
    if (flow.metadata.statistics) {
        cell.set('statistics', flow.metadata.statistics.slice());
    }
}

function mapElement(element) {
    switch (element.type) {
    case 'ifml.ViewContainer':
        return mapViewContainer(element);
    case 'ifml.ViewComponent':
        return mapViewComponent(element);
    case 'ifml.Event':
        return mapEvent(element);
    case 'ifml.Action':
        return mapAction(element);
    case 'ifml.NavigationFlow':
        return mapNavigationFlow(element);
    case 'ifml.DataFlow':
        return mapDataFlow(element);
    }
}

function applyMetadata(element, cells) {
    switch (element.type) {
    case 'ifml.ViewContainer':
        return applyViewContainerMetadata(element, cells);
    case 'ifml.ViewComponent':
        return applyViewComponentMetadata(element, cells);
    case 'ifml.Event':
        return applyEventMetadata(element, cells);
    case 'ifml.Action':
        return applyActionMetadata(element, cells);
    case 'ifml.NavigationFlow':
        return applyNavigationFlowMetadata(element, cells);
    case 'ifml.DataFlow':
        return applyDataFlowMetadata(element, cells);
    }
}


function applyRelation(relation, cells) {
    switch (relation.type) {
    case 'hierarchy':
        cells[relation.parent].embed(cells[relation.child]);
        break;
    case 'source':
        cells[relation.flow].set('source', {id: relation.source});
        cells[relation.source].embed(cells[relation.flow]);
        break;
    case 'target':
        cells[relation.flow].set('target', {id: relation.target});
        break;
    }
}

exports.fromJSON = function (model) {
    var cells = _.chain(model.elements)
        .map(function (e) { return [e.id, mapElement(e)]; })
        .filter(_.last)
        .zipObject()
        .value();

    _.each(model.relations, function (r) {
        applyRelation(r, cells);
    });

    _.each(model.elements, function (e) {
        applyMetadata(e, cells);
    });

    return utils.sortCells(_.values(cells));
};
