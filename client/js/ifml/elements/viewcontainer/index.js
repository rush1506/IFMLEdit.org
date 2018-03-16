// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    $ = require('jquery'),
    joint = require('joint'),
    Color = require('color');

function ignore() { return undefined; }

exports.ViewContainer = joint.shapes.basic.Generic.extend({
    markup: require('./markup.svg'),

    defaults: joint.util.deepSupplement({
        type: 'ifml.ViewContainer',
        size: {width: 200, height: 160},
        name: 'View Container',
        'default': false,
        landmark: false,
        xor: false,
        className: "none",
        width: '100%',
        height: '100%',
        orientation: 'vertical',

        thisLeft_toRightOf: 'none',
        thisLeft_toLeftOf: 'none',
        thisRight_toRightOf: 'none',
        thisRight_toLeftOf: 'none',
        thisTop_toTopOf: 'none',
        thisTop_toBottomOf: 'none',
        thisBottom_toBottomOf: 'none',
        thisBottom_toTopOf: 'none',

        visibility: 'visible',
        gravity: 'top',

        margin: 'initial',
        marginRight: 'initial',
        marginLeft: 'initial',
        marginTop: 'initial',
        marginBottom: 'initial',
        padding: 'initial',
        paddingLeft: 'initial',
        paddingRight: 'initial',
        paddingTop: 'initial',
        paddingBottom:'initial',
        maxWidth: 'initial',
        maxHeight: 'initial',
        minWidth: 'initial',
        minHeight: 'initial',
        zIndex: 0,
        overflow: 'initial',
        border: 'initial',
        font: 'initial',
        color: 'initial',
        align: 'initial',
        filter: 'none',  
        opacity: 1,
        
        attrs: {
            '.': {marker: 'passive'},
            '.ifml-viewcontainer-reference-rect': { 'follow-scale': 'auto' },
            '.ifml-viewcontainer-background-rect': {
                'ref-x': 0,
                'ref-y': 0,
                'ref-width': 1,
                'ref-height': 1,
                ref: '.ifml-viewcontainer-reference-rect'
            },
            '.ifml-viewcontainer-title-rect': {
                'ref-x': 0,
                'ref-y': 0,
                'ref-width': 1,
                ref: '.ifml-viewcontainer-reference-rect'
            },
            text: {
                'ref-x': 5,
                'ref-y': 0.5,
                'ref-width': -10,
                'ref-height': 1,
                'y-alignment': 'middle',
                ref: '.ifml-viewcontainer-title-rect'
            }
        }
    }, joint.shapes.basic.Generic.prototype.defaults),

    minsize: {width: 180, height: 100},
    padding: {top: 20, right: 0, bottom: 0, left: 0},
    resizable: true,
    isContraint: true,
    fullyContained: true,
    containers: ['ifml.ViewContainer'],

    initialize: function () {
        this.on('change:size', this._sizeChanged, this);
        this.on('change:name change:default change:landmark change:xor', this._nameChanged, this);
        this.on('change:default', this._defaultChanged, this);
        this.on('change:xor', this._xorChanged, this);
        this.on('change:landmark', this._landmarkChanged, this);
        this.on('change:parent', this._parentChanged, this);
        this.on('change:accent', this._accentChanged, this);

        this.on('change:width', this._widthChanged, this);

        this.on('change:thisLeft_toRightOf', this._thisLeft_toRightOfChanged, this);
        this.on('change:thisLeft_toLeftOf', this._thisLeft_toLeftOfChanged, this);
        this.on('change:thisRight_toRightOf', this._thisRight_toRightOfChanged, this);
        this.on('change:thisRight_toLeftOf', this._thisRight_toLeftOfChanged, this);
        this.on('change:thisTop_toTopOf', this._thisTop_toTopOfChanged, this);
        this.on('change:thisTop_toBottomOf', this._thisTop_toBottomOfChanged, this);
        this.on('change:thisBottom_toTopOf', this._thisBottom_toTopOfChanged, this);
        this.on('change:thisBottom_toBottomOf', this._thisBottom_toTopOfChanged, this);

        this.on('change:visibility', this._visibilityChanged, this);
        this.on('change:gravity', this._gravityChanged, this);

        this.on('change:height', this._heightChanged, this);
        this.on('change:orientation', this._orientationChanged, this);

        this.on('change:styles', this._stylesChanged, this);
        this.on('change:className', this._classNameChanged, this);

        this.on('change:margin', this._marginChanged, this);
        this.on('change:marginRight', this._marginRightChanged, this);
        this.on('change:marginLeft', this._marginLeftChanged, this);
        this.on('change:marginBottom', this._marginBottomChanged, this);
        this.on('change:marginTop', this._marginTopsChanged, this);
        this.on('change:padding', this._paddingChanged, this);
        this.on('change:paddingTop', this._paddingTopChanged, this);
        this.on('change:paddingBottom', this._paddingBottomChanged, this);
        this.on('change:paddingRight', this._paddingRightChanged, this);
        this.on('change:paddingLeft', this._paddingLeftChanged, this);
        this.on('change:maxWidth', this._maxWidthChanged, this);
        this.on('change:maxHeight', this._maxHeightChanged, this);
        this.on('change:minWidth', this._minWidthChanged, this);
        this.on('change:minHeight', this._minHeightChanged, this);

        this.on('change:zIndex', this._zIndexChanged, this);
        this.on('change:overflow', this._overflowChanged, this);
        this.on('change:border', this._borderChanged, this);
        this.on('change:font', this._fontChanged, this);
        this.on('change:color', this._colorChanged, this);
        this.on('change:align', this._alignChanged, this);
        this.on('change:opacity', this._opacityChanged, this);
        this.on('change:filter', this._filterChanged, this);

 
        
        
        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
        this._sizeChanged();
        this._nameChanged();
        this._accentChanged();
    },

    editable: function () {
        var graph = this.graph,
            filter = function (id) {
                switch (graph.getCell(id).get('type')) {
                case 'ifml.ViewContainer':
                case 'ifml.ViewComponent':
                case 'ifml.Event':
                    return true;
                default:
                    return false;
                }
            },
            display = function (id) {
                switch (graph.getCell(id).get('type')) {
                case 'ifml.Event':
                    return graph.getCell(id).prop('name/text');
                default:
                    return graph.getCell(id).get('name');
                }
            },
            editables = _.chain([
                {property: 'name', name: 'Name', type: 'string'},
                {property: 'orientation', name: 'Orientation', type: 'string'},
                {property: 'className', name: 'Class Name', type: 'string'}]);
        if (graph) {
            if (this.get('parent') && !this.graph.getCell(this.get('parent')).get('xor')) {
                editables = editables.concat(
                    {name: 'Container Type', type: 'booleanset', items: [
                        {property: 'xor', name: 'XOR', type: 'boolean'}
                    ]}
                );
            } else {
                editables = editables.concat(
                    {name: 'Container Type', type: 'booleanset', items: [
                        {property: 'default', name: 'Default', type: 'boolean'},
                        {property: 'landmark', name: 'Landmark', type: 'boolean'},
                    ]}
                );
            }
            editables = editables.concat(
                {property: 'embeds', name: 'Children', type: 'elementslist', filter: filter, display: display}
            );
            editables = editables.concat(
                {name: 'Style', type: 'dictionary', items: [
                    {property: 'visibility', name: 'Visibility', type: 'string'},
                    {property: 'gravity', name: 'Gravity', type: 'string'},
                    {property: 'margin', name: 'Margin', type: 'string'}, 
                    {property: 'marginRight', name: 'MarginRight', type: 'string'},
                    {property: 'marginLeft', name: 'MarginLeft', type: 'string'},
                    {property: 'marginBottom', name: 'MarginBottom', type: 'string'},
                    {property: 'marginTop', name: 'MarginTop', type: 'string'},
                    {property: 'padding', name: 'Padding', type: 'string'},
                    {property: 'paddingTop', name: 'PaddingTop', type: 'string'},
                    {property: 'paddingBottom', name: 'PaddingBottom', type: 'string'},
                    {property: 'paddingRight', name: 'PaddingRight', type: 'string'},
                    {property: 'paddingLeft', name: 'PaddingLeft', type: 'string'},
                    {property: 'maxWidth', name: 'MaxWidth', type: 'string'}, 
                    {property: 'maxHeight', name: 'MaxHeight', type: 'string'},
                    {property: 'minWidth', name: 'MinWidth', type: 'string'},
                    {property: 'minHeight', name: 'MinHeight', type: 'string'},
                    {property: 'zIndex', name: 'zIndex', type: 'string'},
                    {property: 'overflow', name: 'Overflow', type: 'string'},
                    {property: 'border', name: 'Border', type: 'string'},
                    {property: 'font', name: 'Font', type: 'string'},
                    {property: 'color', name: 'Color', type: 'string'},
                    {property: 'align', name: 'Align', type: 'string'},
                    {property: 'opacity', name: 'Opacity', type: 'string'}, 
                    {property: 'filter', name: 'Filter', type: 'string'},
                ]},
                
            );
            if (this.get('parent')) {
                editables = editables.concat(
                    {property: 'width', name: 'Width', type: 'string'}, 
                    {property: 'height', name: 'Height', type: 'string'},
                    {name: 'Position', type: 'dictionary', items: [
                        {property: 'thisLeft_toRightOf', name: 'thisLeft_toRightOf', type: 'string'},
                        {property: 'thisLeft_toLeftOf', name: 'thisLeft_toLeftOf', type: 'string'},
                        {property: 'thisRight_toRightOf', name: 'thisRight_toRightOf', type: 'string'},
                        {property: 'thisRight_toLeftOf', name: 'thisRight_toLeftOf', type: 'string'},
                        {property: 'thisTop_toTopOf', name: 'thisTop_toTopOf', type: 'string'},
                        {property: 'thisTop_toBottomOf', name: 'thisTop_toBottomOf', type: 'string'},
                        {property: 'thisBottom_toTopOf', name: 'thisBottom_toTopOf', type: 'string'},
                        {property: 'thisBottom_toBottomOf', name: 'thisBottom_toBottomOf', type: 'string'}
                    ] },
                );
            }
        }
        return editables.value();
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

    _defaultChanged: function () {
        if (this.get('default') === true && this.graph) {
            var parent = this.graph.getCell(this.get('parent')),
                thisId = this.id,
                siblings;
            if (parent) {
                if (!parent.get('xor')) {
                    this.set('default');
                    return;
                }
                siblings = parent.getEmbeddedCells();
            } else {
                siblings = _.filter(
                    this.graph.getCells(),
                    function (cell) {
                        return !cell.get('parent');
                    }
                );
            }
            _.chain(siblings)
                .filter(function (sibling) {
                    return sibling && !sibling.isLink() && sibling.get('type') === 'ifml.ViewContainer' &&
                        sibling.get('default') && sibling.id !== thisId;
                })
                .invoke('set', 'default')
                .run();
        }
    },

    _xorChanged: function () {
        if (this.get('xor') === true && this.graph) {
            var parent = this.getAncestors()[0];
            if (!parent || parent.get('xor')) {
                this.set('xor');
            }
        }
    },

    _landmarkChanged: function () {
        if (this.get('landmark') === true && this.graph) {
            var parent = this.getAncestors()[0];
            if (parent && !parent.get('xor')) {
                this.set('landmark');
            }
        }
    },

    _parentChanged: function (element, value, data) {
        ignore(element, value);
        data = data ||  {};
        if (this.graph) {
            var parent = this.graph.getCell(this.previous('parent'));
            if (parent) {
                parent.off('change:xor', this._xorChanged, this);
                parent.off('change:xor', this._landmarkChanged, this);
                parent.off('change:xor', this._defaultChanged, this);
            }
            if (data.reparenting) { return; }
            parent = this.graph.getCell(this.get('parent'));
            if (parent) {
                parent.on('change:xor', this._xorChanged, this);
                parent.on('change:xor', this._landmarkChanged, this);
                parent.on('change:xor', this._defaultChanged, this);
            }
            this._xorChanged();
            this._landmarkChanged();
            this._defaultChanged();
        }
    },

    _nameChanged: function () {
        var value,
            modifiers = [];
        if (this.get('default')) {
            modifiers.push('D');
        }
        if (this.get('landmark')) {
            modifiers.push('L');
        }
        if (this.get('xor')) {
            modifiers.push('XOR');
        }
        if (modifiers.length) {
            value = '[' + modifiers.join(',') + ']' + this.get('name');
        } else {
            value = this.get('name');
        }
        this.attr({text: {text: value }});
    },

    _accentChanged: function () {
        var stroke = 'black',
            fill = 'white',
            accent = this.get('accent');
        if (typeof accent === 'number') {
            stroke = Color.hsl(120 * accent, 100, 35).string();
            fill = Color.hsl(120 * accent, 75, 90).string();
        }
        this.attr({
            '.ifml-viewcontainer-background-rect': {
                stroke: stroke,
                fill: fill
            },
            '.ifml-viewcontainer-title-rect': {
                stroke: stroke,
                fill: fill
            }
        });
    },

    
    _widthChanged: function () {
        this._rerenderPreviewUI();
    },

    _heightChanged: function () {
        this._rerenderPreviewUI();
    },

    _orientationChanged: function () {
        this._rerenderPreviewUI();
    },

    _thisLeft_toRightOfChanged: function () {
        _rerenderPreviewUI();
    },

    _thisLeft_toLeftOfChanged: function () {
        _rerenderPreviewUI();
    },

    _thisRight_toRightOfChanged: function () {
        _rerenderPreviewUI();
    },

    _thisRight_toLeftOfChanged: function () {
        _rerenderPreviewUI();
    },

    _thisTop_toTopOfChanged: function () {
        _rerenderPreviewUI();
    },

    _thisTop_toBottomOfChanged: function () {
        _rerenderPreviewUI();
    },

    _thisBottom_toTopOfChanged: function () {
        _rerenderPreviewUI();
    },

    _stylesChanged: function () {
        _rerenderPreviewUI();
    },

    _visibilityChanged: function () {
        var value = this.get('visibility');
        switch(value) {
            case "visible":
                break;
            case "hidden":
                break;
            case "collapse":
                break;
            case "initial":
                break;  
            case "inherit":
                break;   
            default:
                return;
        }
        _rerenderPreviewUI();
    },

    _gravityChanged: function () {
        var value = this.get('gravity');
        switch(value) {
            case "top":
                break;
            case "left":
                break;
            case "center":
                break;
            case "right":
                break;  
            case "bottom":
                break;   
            case "justify":
                break;  
            default:
                return;
        }
        _rerenderPreviewUI();
    },

    _marginChanged: function () {
        _rerenderPreviewUI();
    },

    _marginRightChanged: function () {
        _rerenderPreviewUI();
    },

    _marginLeftChanged: function () {
        _rerenderPreviewUI();
    },

    _marginBottomChanged: function () {
        _rerenderPreviewUI();
    },

    _marginTopsChanged: function () {
        _rerenderPreviewUI();
    },

    _paddingChanged: function () {
        _rerenderPreviewUI();
    },

    _paddingTopChanged: function () {
        _rerenderPreviewUI();
    },

    _paddingBottomChanged: function () {
        _rerenderPreviewUI();
    },

    _paddingRightChanged: function () {
        _rerenderPreviewUI();
    },

   _paddingLeftChanged: function () {
        _rerenderPreviewUI();
    },

   _maxWidthChanged: function () {
        _rerenderPreviewUI();
    },

    _maxHeightChanged: function () {
        _rerenderPreviewUI();
    },

    _minWidthChanged: function () {
        _rerenderPreviewUI();
    },

    _minHeightChanged: function () {
        _rerenderPreviewUI();
    },


    _zIndexChanged: function () {
        _rerenderPreviewUI();
    },

    _overflowChanged: function () {
        _rerenderPreviewUI();
    },

    _borderChanged: function () {
        _rerenderPreviewUI();
    },

    _fontChanged: function () {
        _rerenderPreviewUI();
    },

    _colorChanged: function () {
        _rerenderPreviewUI();
    },

    _alignChanged: function () {
        _rerenderPreviewUI();
    },

    _opacityChanged: function () {
        _rerenderPreviewUI();
    },

    _filterChanged: function () {
        _rerenderPreviewUI();
    },


    _rerenderPreviewUI: function () {

    },

    _classNameChanged: function () {

    }
});
