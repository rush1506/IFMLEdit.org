// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    $ = require('jquery'),
    joint = require('joint'),
    Color = require('color');

function upperFirst(string) {
    if (!string || !string.length) { return string; }
    return string[0].toUpperCase() + string.substring(1).toLowerCase();
}

exports.ViewComponent = joint.shapes.basic.Generic.extend({
    markup: require('./markup.svg'),

    defaults: joint.util.deepSupplement({
        type: 'ifml.ViewComponent',
        size: {width: 150, height: 60},
        name: 'View Component',
        className: 'none',
        stereotype: 'form',
        thisLeft_toRightOf: 'none',
        thisLeft_toLeftOf: 'none',
        thisRight_toRightOf: 'none',
        thisRight_toLeftOf: 'none',
        thisTop_toTopOf: 'none',
        thisTop_toBottomOf: 'none',
        thisBottom_toBottomOf: 'none',
        thisBottom_toTopOf: 'none',
        isItem: false,
        attrs: {
            '.': {magnet: 'passive'},
            '.ifml-component-reference-rect' : {'follow-scale': 'auto'},
            '.ifml-component-background-rect': {
                'ref-x': 0,
                'ref-y': 0,
                'ref-width': 1,
                'ref-height': 1,
                ref: '.ifml-component-reference-rect'
            },
            '.ifml-component-binding-rect': {
                visibility: 'hidden',
                'ref-x': 10,
                'ref-y': 0.5,
                'ref-width': -20,
                ref: '.ifml-component-background-rect'
            },
            '.ifml-component-magnet-rect': {
                magnet: true,
                visibility: 'hidden',
                'ref-x': 0,
                'ref-y': 0,
                'ref-width': 1,
                'ref-height': 1,
                ref: '.ifml-component-background-rect'
            },
            '.ifml-component-headline': {
                'ref-x': 0.5,
                'ref-y': 0.5,
                ref: '.ifml-component-background-rect'
            },
            '.ifml-component-binding': {
                visibility: 'hidden',
                'ref-x': 0.5,
                'ref-y': 0.5,
                'ref-width': -10,
                'ref-height': 1,
                'y-alignment': 'middle',
                ref: '.ifml-component-binding-rect'
            }
        }
    }, joint.shapes.basic.Generic.prototype.defaults),

    minsize: {width: 150, height: 60},
    padding: {top: 0, right: 0, bottom: 0, left: 0},
    resizable: true,
    isContraint: true,
    requireEmbedding: true,
    fullyContained: true,
    containers: ['ifml.ViewContainer'],

    initialize: function () {
        this.on('change:size', this._sizeChanged, this);
        this.on('change:name change:stereotype', this._headlineChanged, this);
        this.on('change:stereotype', this._stereotypeChanged, this);
        this.on('change:collection', this._collectionChanged, this);
        this.on('change:accent', this._accentChanged, this);
        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
        this._sizeChanged();
        this._headlineChanged();
        this._stereotypeChanged();
        this._collectionChanged();
        this._accentChanged();
    },

    statistics: function () {
        return this.get('statistics');
    },

    _sizeChanged: function () {
        var size = this.get('size'),
            minsize = this.minsize;
        if (size.width < minsize.width || size.height < minsize.height) {
            this.resize(Math.max(size.width, minsize.width), Math.max(size.height, minsize.height));
        }
    },

    _headlineChanged: function () {
        this.attr({'.ifml-component-headline': {text: '«' + upperFirst(this.get('stereotype')) + '»\n' + this.get('name') }});
    },

    _stereotypeChanged: function () {
        switch (this.get('stereotype')) {
        case 'details':
        case 'list':
            this.attr({'.ifml-component-headline': {'y-alignment': 'bottom'}});
            this.attr({'.ifml-component-binding-rect': {'visibility': 'visible'}});
            this.attr({'.ifml-component-binding': {'visibility': 'visible'}});
            break;
        case 'text':
        case 'image':
        case 'button':
        case 'cardview':
        case 'menu':
        case 'select':
        case 'table':
        case 'media':
            break;
        default:
            this.attr({'.ifml-component-headline': {'y-alignment': 'middle'}});
            this.attr({'.ifml-component-binding-rect': {'visibility': 'hidden'}});
            this.attr({'.ifml-component-binding': {'visibility': 'hidden'}});
        }
    },

    _collectionChanged: function () {
        switch (this.get('stereotype')) {
            case 'text':
            case 'image':
            case 'button':
            case 'cardview':
            case 'menu':
            case 'select':
            case 'table':
            case 'media':
                return;
            default:
                break;
        }
        var collection = this.get('collection');
        if (collection) {
            this.removeAttr('.binding/fill');
            this.attr({'.ifml-component-binding': {text: '«DataBinding» ' + collection }});
        } else {
            this.attr({'.ifml-component-binding': {fill: 'grey', text: '«DataBinding» none' }});
        }
    },

    editable: function () {
        var self = this;
        return _([{property: 'name', name: 'Name', type: 'string'},
                  {property: 'className', name: 'Class Name', type: 'string'},
                {name: 'Reference Type', type: 'booleanset', items: [
                    {property: 'isItem', name: 'Is Item', type: 'boolean'},
                ]},])
            .concat((function () {
                switch (self.get('stereotype')) {
                case 'list':
                    return [
                        {property: 'collection', name: 'Collection', type: 'string'},
                        {property: 'filters', name: 'Filters', type: 'stringset'},
                        {property: 'fields', name: 'Fields', type: 'stringset'}
                    ];
                case 'details':
                    return [
                        {property: 'collection', name: 'Collection', type: 'string'},
                        {property: 'fields', name: 'Fields', type: 'stringset'}
                    ];
                case 'form':
                    return [
                        {property: 'formattrs', name: 'Formattrs', type: 'tableformset'},
                    ];
                case 'text':
                    return [
                        {property: 'header', name: 'Header', type: 'string'},
                        {property: 'content', name: 'Content', type: 'string'},
                        {property: 'styleattrs', name: 'Style', type: 'styleset'},
                    ]; 
                case 'image':
                    return [
                        {property: 'src', name: 'Source', type: 'string'},
                        {property: 'styleattrs', name: 'Style', type: 'styleset'},
                    ]; 
                case 'button':
                    return [
                        {property: 'value', name: 'value', type: 'string'},
                        {property: 'styleattrs', name: 'Style', type: 'styleset'},
                    ];
                case 'cardview':
                    return [
                        {property: 'header', name: 'header', type: 'string'},
                        {property: 'content', name: 'content', type: 'string'},
                        {property: 'footer', name: 'footer', type: 'string'},
                        {property: 'styleattrs', name: 'Style', type: 'styleset'},
                    ]; 
                case 'table':
                    return [
                        {property: 'column', name: 'column', type: 'string'},
                        {property: 'row', name: 'row', type: 'string'},
                        {property: 'tableattrs', name: 'Table Attributes', type: 'styleset'},
                        {property: 'styleattrs', name: 'Style', type: 'styleset'},
                    ];    
                case 'menu':
                    return [
                        {property: 'menuattrs', name: 'Menu Attributes', type: 'styleset'},
                        {property: 'styleattrs', name: 'Style', type: 'styleset'},
                    ];     
                case 'media':
                    return [
                        {property: 'src', name: 'src', type: 'string'},
                        {property: 'mediatype', name: 'Media Type', type: 'string'},
                        {property: 'styleattrs', name: 'Style', type: 'styleset'},
                    ];      
                case 'select':
                    return [
                        {property: 'selectattrs', name: 'Select Attributes', type: 'styleset'},
                        {property: 'styleattrs', name: 'Style', type: 'styleset'},
                    ];         
                default:
                    return [];
                }
            }()))
            .value();
    },
    //TODO: FIND OUT WTF DOES THIS DO
    inputs: function () {
        switch (this.get('stereotype')) {
        case 'details':
            return ['id'];
        case 'list':
            return _(this.get('filters') || []).sort().uniq(true).value();
        case 'form':
            return _(this.get('formattrs').field || []).map(function (f) {
                return [f, f + '-error'];
            }).flatten().sort().value();
        default:
            return [];
        }
    },
    //TODO: FIND OUT WTF DOES THIS DO
    outputs: function () {
        switch (this.get('stereotype')) {
        case 'details':
            return _(['id']).concat(this.get('fields') || []).sort().uniq(true).value();
        case 'list':
            return _(['id']).concat(this.get('fields') || []).sort().uniq(true).value();
        case 'form':
            return _(this.get('formattrs').field || []).sort().value();
        default:
            return [];
        }
    },

    magnetize: function () {
        this.attr({'.ifml-component-magnet-rect': {visibility: 'visible'}});
    },

    demagnetize: function () {
        this.attr({'.ifml-component-magnet-rect': {visibility: 'hidden'}});
    },

    _accentChanged: function () {
        var stroke = 'black',
            fill = 'lightgray',
            accent = this.get('accent');
        if (typeof accent === 'number') {
            stroke = Color.hsl(120 * accent, 100, 35).string();
            fill = Color.hsl(120 * accent, 75, 90).string();
        }
        this.attr({
            '.ifml-component-background-rect': {
                stroke: stroke,
                fill: fill
            },
            '.ifml-component-binding-rect': {
                stroke: stroke
            }
        });
    }
});
