// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    pcn = require('../../../pcn').pcn,
    createRule = require('almost').createRule;
let mapposition = require('../../mapposition').mapposition;
let getNodeMap = mapposition.map;


function sortMapByRow(map) {
    var rowMap = [];
    var sameRow = [];
    var tempMap = Object.assign([], map);
    var indexRow = 0;
    while (tempMap.length > 0) {
        for (var i = 0; i < tempMap.length; i++) {
            if (tempMap[i].row_depth === indexRow) {
                sameRow.push(tempMap[i]);
                tempMap.splice(i, 1);
                i--;
            }
        }
        rowMap.push(sameRow);
        sameRow = [];
        indexRow++;
    }
    return rowMap;
}

function sortMapByCol(sortedRowMap) {
    for (var i = 0; i < sortedRowMap.length; i++) {
        sortedRowMap[i].sort(function(x, y) { return x.col_depth >= y.col_depth });
    }
    return sortedRowMap;
}

function sortMap(map) {
    var resMap = null;
    resMap = sortMapByRow(map);
    resMap = sortMapByCol(resMap);
    return resMap;
}

function getAbsoluteNode(map) {
    var newData = Object.assign([], map);
    for (var i = 0; i < map.length; i++) {
        newData[i] = getAbsoluteNodeInRow(map, i);
    }
    return newData;
}

function getAbsoluteNodeInRow(map, index) {
    var temp = [];
    var tempChild = [];
    var tempData = map[index][0];
    // console.log('ASBO', map, index, tempData);
    for (var i = 0; i < map[index].length; i++) {
        // console.log('ABSO', tempChild);
        if (map[index][i].col_depth === tempData.col_depth && map[index][i].row_depth === tempData.row_depth) {
            tempChild.push(map[index][i]);
            // console.log('ABSO', tempChild);
        } else {
            // console.log('ABSO NOTE', tempChild);
            var tempObj = {
                type: 'normal',
                elements: tempChild
            }
            if (tempChild.length > 1) {
                tempObj.type = 'absolute';
            }
            temp.push(Object.assign({}, tempObj));
            tempChild = [];
            tempData = map[index][i];
            tempChild.push(map[index][i]);
        }
    }
    var tempObj2 = {
        type: 'normal',
        elements: tempChild
    }
    if (tempChild.length > 1) {
        tempObj2.type = 'absolute';
    }
    temp.push(Object.assign({}, tempObj2));

    return temp;
}

exports.rules = [
    createRule( // map View Container
        function(element, model) { return model.isViewContainer(element) && model.getParent(element) === undefined && !element.attributes.isItem;},
        function(element, model) {
            var id = element.id,
                name = element.attributes.name,
                className = element.attributes.className,
                descendants = _.chain(model.getDescendants(element, true))
                .map(function(id) { return model.toElement(id); })
                .filter(function(e) {
                    if (!model.isEvent(e) || model.getOutbounds(e).length) { return true; }
                    var parent = model.getParent(e);
                    return model.isViewComponent(parent) && parent.attributes.stereotype === 'list' && e.attributes.name === 'selected';
                })
                .map('id')
                .value(),
                obj = {
                    srccomponents: { children: id + '-component' },
                };
            console.log("View ", element);
            obj[id + '-component'] = { isFolder: true, name: id, children: [
                id + '-component-css',  
                id + '-component-js',
                id + '-component-package'
            ] };
            obj[id + '-component-css'] = { name: id + '.js', content: require('./templates/csstemp.css.ejs')({ id: id }) };
            obj[id + '-component-js'] = { name: id + '.css', content: require('./templates/jstemp.js.ejs')({ id: id }) };
            obj[id + '-component-package'] = { name: 'package.json', content: require('./templates/package.json.ejs')({ id: id }) };
            return obj;
        }
    )
];