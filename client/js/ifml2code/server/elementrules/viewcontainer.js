// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    pcn = require('../../../pcn').pcn,
    createRule = require('almost').createRule;


/*********
 * 
 * MAP NODE
 */
// data: {[{attributes:[]}, {id: 0}]}
function mapLayoutNodeRelation(map, data) {
    // console.log("data1", data);
    //create all note
    // console.log("WTF", map);
    map = createMapData(map, data); // quan hệ giữa map và data được thể hiện ở index, index của 2 bên tương ứng với nhau
    //map: Gồm các nốt với mỗi nốt có 8 attributes định hướng, mỗi attr là một array và một id của Layout hiện tại
    // console.log("Generate New Map Data Success!", map);
    for (var i = 0; i < data.length; i++) {
        map = mapAttributeNode(map, data, i); //Chui vào 8 nốt được định tới và nhét vào các nốt đó thông tin rằng nốt đó được ref bởi thằng này
    }
    return map;
}


//i: current index of the selected node
function mapAttributeNode(map, data, i) {
    //truy xuất từng mảng attr
    //id truyền vô là id được tham chiếu từ node hiện tại
    map = mapthis(map, data[i].attributes.thisBottom_toBottomOf, data[i].id,
        'thisBottom_toBottomOf', 'thisBottom_toBottomOf');
    map = mapthis(map, data[i].attributes.thisBottom_toTopOf, data[i].id,
        'thisBottom_toTopOf', 'thisTop_toBottomOf');
    map = mapthis(map, data[i].attributes.thisLeft_toLeftOf, data[i].id,
        'thisLeft_toLeftOf', 'thisLeft_toLeftOf');
    map = mapthis(map, data[i].attributes.thisLeft_toRightOf, data[i].id,
        'thisLeft_toRightOf', 'thisRight_toLeftOf');
    map = mapthis(map, data[i].attributes.thisRight_toLeftOf, data[i].id,
        'thisRight_toLeftOf', 'thisLeft_toRightOf');
    map = mapthis(map, data[i].attributes.thisRight_toRightOf, data[i].id,
        'thisRight_toRightOf', 'thisRight_toRightOf');
    map = mapthis(map, data[i].attributes.thisTop_toBottomOf, data[i].id,
        'thisTop_toBottomOf', 'thisBottom_toTopOf');
    map = mapthis(map, data[i].attributes.thisTop_toTopOf, data[i].id,
        'thisTop_toTopOf', 'thisTop_toTopOf');

    return map;
}

function mapthis(map, tar_id, ref_id, attrref, attrtar) {

    if (tar_id == "parent" || tar_id == "none") {
        //do nothing
        return map;
    }

    if (ref_id == "parent" || ref_id == "none") {
        //do nothing
        return map;
    }

    // console.log("Target id: ", tar_id);
    // console.log("Referer id: ", ref_id);
    // console.log("Target attr: ", attrtar);
    // console.log("Referer attr: ", attrref);

    var target_index = map.indexOf(map.filter((x) => {
        // console.log("x id: ", x.id);
        return x.id == tar_id;
    })[0]);

    // console.log("Target index mapping: ", map.filter((x) => {
    //     return x.id == tar_id;
    // }));

    // console.log("Target index: ", target_index);
    // console.log("Target map: ", map[target_index]);

    if (target_index != -1) {

        var existAttr = map[target_index].attributes[attrtar].indexOf(map[target_index].attributes[attrtar].filter((x) => {
            return x == ref_id;
        })[0]);

        // console.log("Exist Att", existAttr);
        if (existAttr == -1) {
            if (map[target_index].attributes[attrtar][0] == 'none') {
                map[target_index].attributes[attrtar][0] = ref_id;
            } else {
                map[target_index].attributes[attrtar].push(ref_id);
            }

        }

    }

    return map;

}

function createMapData(map, data) {
    var tmp = -1;
    for (var i = 0; i < data.length; i++) {
        var tmpNode = {
            id: data[i].id,
            col_depth: tmp,
            row_depth: tmp,
            attributes: {
                thisBottom_toBottomOf: [data[i].attributes.thisBottom_toBottomOf],
                thisBottom_toTopOf: [data[i].attributes.thisBottom_toTopOf],
                thisLeft_toLeftOf: [data[i].attributes.thisLeft_toLeftOf],
                thisLeft_toRightOf: [data[i].attributes.thisLeft_toRightOf],
                thisRight_toLeftOf: [data[i].attributes.thisRight_toLeftOf],
                thisRight_toRightOf: [data[i].attributes.thisRight_toRightOf],
                thisTop_toBottomOf: [data[i].attributes.thisTop_toBottomOf],
                thisTop_toTopOf: [data[i].attributes.thisTop_toTopOf],
                className: data[i].attributes.className,
                default: data[i].attributes.default,
                gravity: data[i].attributes.gravity,
                height: data[i].attributes.height,
                width: data[i].attributes.width,
                landmark: data[i].attributes.landmark,
                name: data[i].attributes.name,
                xor: data[i].attributes.xor
            }
        };
        // console.log('temp node', tmpNode);
        // console.log('old map ', map);
        map.push(tmpNode);
        // console.log('map ', map);
    }
    return map;
}

/*****
 * 
 * Find root
 * 
 */
function findRoots(map, parentId) {
    var root_arr = [];

    console.log("Root parent id", parentId);
    root_arr = getRootId(root_arr, map, parentId, parentId);
    root_arr = getRootId(root_arr, map, 'none', parentId);
    // root_arr = getRootId(root_arr, map, 'none', 'none');
    root_arr = getRootId(root_arr, map, parentId, 'none');
    root_arr = getSingleRootId(root_arr, map);

    return root_arr;

}

function getRootId(root_arr, map, cond1, cond2) {
    var tmp = map.filter((x) => {
        // console.log ("x ", x.attributes.thisLeft_toLeftOf[0], x.attributes.thisTop_toTopOf[0]);
        return (x.attributes.thisLeft_toLeftOf[0] == cond1) && (x.attributes.thisTop_toTopOf[0] == cond2)
    }).map(x => x.id);
    root_arr = root_arr.concat(tmp);
    console.log('root arr', root_arr);

    return root_arr;
}

function getSingleRootId(root_arr, map) {
    var tmp = map.filter((x) => {
        // console.log ("x ", x.attributes.thisLeft_toLeftOf[0], x.attributes.thisTop_toTopOf[0]);
        return (x.attributes.thisLeft_toLeftOf[0] == 'none') &&
            (x.attributes.thisTop_toTopOf[0] == 'none') &&
            (x.attributes.thisTop_toBottomOf[0] == 'none') &&
            (x.attributes.thisRight_toRightOf[0] == 'none') &&
            (x.attributes.thisRight_toLeftOf[0] == 'none') &&
            (x.attributes.thisLeft_toRightOf[0] == 'none') &&
            (x.attributes.thisBottom_toTopOf[0] == 'none') &&
            (x.attributes.thisBottom_toBottomOf[0] == 'none')
    }).map(x => x.id);
    root_arr = root_arr.concat(tmp);
    console.log('root arr', root_arr);

    return root_arr;
}

/****
 * 
 * get depth level
 */
function getDepthLevel(map, root_arr, parentId) {
    for (var root in root_arr) {
        var node = { id: root_arr[root] };
        map = setDepthForNode(map, node, 0, 0, parentId);
        console.log("Sucess! From root: ", root);
    }
    return map;
}

function setDepthForNode(map, node, col_depth, row_depth, parentId) {

    var node_index = map.indexOf(map.filter((x) => {
        return x.id == node.id;
    })[0]);

    // console.log("Col depth ", col_depth);
    // console.log("Row depth ", row_depth);

    map = setDepth(map, node_index, col_depth, row_depth);

    console.log("Set depth OK!", map);

    var node_path = [];
    node_path.push({ i: node_index });
    // console.log ("node path 11", node_path);
    map = setDepthForAllNodeBranch(map, node_index, col_depth, row_depth, node_path, parentId);

    return map;
}

function setDepthForAllNodeBranch(map, index, col_depth, row_depth, node_path, parentId) {
    // console.log("thisBottom_toBottomOf");
    if (row_depth != -1) {
        map = setDepthForBranch(map, index, 'thisBottom_toBottomOf', -1, row_depth, node_path, parentId);
        map = setDepthForBranch(map, index, 'thisTop_toTopOf', -1, row_depth, node_path, parentId);
        map = setDepthForBranch(map, index, 'thisBottom_toTopOf', -1, row_depth + 1, node_path, parentId);
        map = setDepthForBranch(map, index, 'thisTop_toBottomOf', -1, row_depth - 1, node_path, parentId);
    }

    if (col_depth != -1) {
        map = setDepthForBranch(map, index, 'thisLeft_toLeftOf', col_depth, -1, node_path, parentId);
        map = setDepthForBranch(map, index, 'thisRight_toRightOf', col_depth, -1, node_path, parentId);
        map = setDepthForBranch(map, index, 'thisLeft_toRightOf', col_depth - 1, -1, node_path, parentId);
        map = setDepthForBranch(map, index, 'thisRight_toLeftOf', col_depth + 1, -1, node_path, parentId);
    }

    return map;
}

function setDepthForBranch(map, index, attribute_name, col_depth, row_depth, node_path, parentId) {
    // console.log("Attrbute: ", attribute_name);
    // console.log("Attrbute: ", map);

    // dieu kien dung sai
    if (map[index].attributes[attribute_name].length == 1 &&
        map[index].attributes[attribute_name][0] == 'none') {
        return map;
    }

    for (var id_index in map[index].attributes[attribute_name]) {
        var node_index = map.indexOf(map.filter((x) => {
            return x.id == map[index].attributes[attribute_name][id_index];
        })[0]);
        // console.log("node index", node_index);

        // console.log ("node path", node_path);

        var isExistNode = node_path.indexOf(node_path.filter((x) => {
            return x.i == node_index;
        })[0]);

        if (isExistNode == -1 && node_index != -1) {
            map = setDepth(map, node_index, col_depth, row_depth, parentId);
            // console.log("map after set: ", map);

            if (map[node_index].col_depth != -1 && map[node_index].row_depth != -1) {
                node_path.push({ i: node_index });
                // console.log ("node path push", node_path);
            }
            map = setDepthForAllNodeBranch(map, node_index, col_depth, row_depth, node_path);
        }
    }


    return map;
}

function setDepth(map, index, col_level, row_level, parentId) {
    // console.log("Map index", index);
    // console.log("col", col_level);
    // console.log("row", row_level);
    
    if (map[index].attributes.thisLeft_toLeftOf[0] == parentId || map[index].attributes.thisLeft_toLeftOf[0] == 'none')
        map[index].col_depth = 0;
    if (map[index].attributes.thisTop_toTopOf[0] == parentId || map[index].attributes.thisTop_toTopOf[0] == 'none')
        map[index].row_depth = 0;
    if (map[index].col_depth == -1 && col_level != -1) {
        map[index].col_depth = col_level;
    }
    if (map[index].row_depth == -1 && row_level != -1) {
        map[index].row_depth = row_level;
    }
    // var tmp = _.cloneDeep(map[index]);
    // console.log("Map index", tmp);
    return map;
}

/***
 * 
 * Get node map
 * 
 * 
 */
function getNodeMap(map, childrenAttributes, id) {
    // console.log("data", childrenAttributes);
    if (childrenAttributes.length > 0) {
        // console.log("Current Map", map);
        map = mapLayoutNodeRelation(map, childrenAttributes);
        // console.log("Generate Node Relation Success!", map);
        var root_arr = findRoots(map, id);
        // console.log("Find Root Success!", root_arr);
        map = getDepthLevel(map, root_arr, id);
        // console.log("Get Depth Level Success!", map);
    }
    return map;
}

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
        function(element, model) { return model.isViewContainer(element) && model.getParent(element) === undefined; },
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
                    routes: { children: id + '-route' },
                    views: { children: id + '-view' },
                    viewmodels: { children: id + '-viewmodel' },
                };
            console.log("View ", element);
            obj[id + '-route'] = { isFolder: true, name: id, children: id + '-route-index' };
            obj[id + '-route-index'] = { name: 'index.js', content: require('./templates/route.page.index.js.ejs')({ id: id }) };
            obj[id + '-view'] = { isFolder: true, name: id, children: id + '-view-index' };
            obj[id + '-view-index'] = { name: 'index.pug', content: require('./templates/view.index.pug.ejs')({ id: id, name: name, className: className }) };
            obj[id + '-viewmodel'] = { isFolder: true, name: id, children: id + '-viewmodel-index' };
            obj[id + '-viewmodel-index'] = { name: 'index.js', content: require('./templates/viewmodel.index.js.ejs')({ main: id, descendants: descendants }) };
            return obj;
        }
    ),
    createRule( // map View Container
        function(element, model) { return model.isViewContainer(element) && !model.isXOR(element); },
        function(element, model) {
            var id = element.id,
                className = element.attributes.className,
                children = _.chain(model.getChildren(element))
                .reject(function(id) { return model.isEvent(id); })
                .map(function(id) { return model.toElement(id); })
                .map('id')
                .value(),
                childrenAttributes = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewContainer(id); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return element;
                })
                .value(),
                logicAttributes = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewComponent(id); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return element;
                })
                .value(),
                events = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isEvent(id); })
                .filter(function(id) { return model.getOutbounds(id).length; })
                .map(function(id) { return model.toElement(id); })
                .map(function(event) {
                    var flow = model.getOutbounds(event)[0],
                        target = model.getTarget(flow);
                    return { id: event.id, name: event.attributes.name, targetsAction: model.isAction(target) };
                })
                .value(),
                top = model.getTopLevelAncestor(element),
                tid = top.id,
                obj = {};
            // console.log("Non xor master element", element);
            // console.log("Non xor children attribute", childrenAttributes);
            // console.log("Non xor logic attribute", logicAttributes);

            var map = [];
            // console.log("Non xor maps", map);
            map = getNodeMap(map, childrenAttributes, id);

            // console.log("Non xor final maps", map);
            var sortedMap = sortMap(map);
            var finalMap = getAbsoluteNode(sortedMap);
            // console.log("FINAL SORTED MAP NON XOR", finalMap);

            obj[tid + '-view'] = { children: id + '-pug' };
            obj[id + '-pug'] = { name: id + '.pug', content: require('./templates/nonxor.pug.ejs')({ id: id, children: children, events: events, className: className, childrenAttributes: finalMap, logicAttributes: logicAttributes }) };
            obj[tid + '-viewmodel'] = { children: id + '-view-js' };
            obj[id + '-view-js'] = { name: id + '.js', content: require('./templates/nonxor.js.ejs')({ id: id, children: children, events: events }) };
            return obj;
        }
    ),
    createRule( // map XOR View Container
        function(element, model) { return model.isViewContainer(element) && model.isXOR(element); },
        function(element, model) {
            var id = element.id,
                className = element.attributes.className,
                children = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewContainer(id); })
                .value(),
                childrenAttributes = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewContainer(id); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return element;
                })
                .value(),
                logicAttributes = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewComponent(id); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return element;
                })
                .value(),
                landmarks = _.chain(children)
                .filter(function(element) { return model.isLandmark(element); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return {
                        id: element.id,
                        name: element.attributes.name,
                        broken: _.chain(model.getDescendants(element, true))
                            .reject(function(id) { return model.isEvent(id); })
                            .value()
                    };
                })
                .value(),
                defaultChild = _.chain(model.getChildren(element))
                .filter(function(element) { return model.isDefault(element); })
                .first()
                .value(),
                events = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isEvent(id); })
                .filter(function(id) { return model.getOutbounds(id).length; })
                .map(function(id) { return model.toElement(id); })
                .map(function(event) {
                    var flow = model.getOutbounds(event)[0],
                        target = model.getTarget(flow);
                    return { id: event.id, name: event.attributes.name, targetsAction: model.isAction(target) };
                })
                .value(),
                top = model.getTopLevelAncestor(element),
                tid = top.id,
                path = model.isDefault(top) ? '' : tid,
                obj = {};
            // console.log("Xor master element", element);
            // console.log("Xor children attribute", childrenAttributes);
            // console.log("Xor logic attribute", logicAttributes);

            var map = [];
            map = getNodeMap(map, childrenAttributes, id);

            // console.log("Xor final map", map);

            obj[tid + '-view'] = { children: id + '-pug' };
            obj[id + '-pug'] = { name: id + '.pug', content: require('./templates/xor.pug.ejs')({ id: id, children: children, events: events, landmarks: landmarks, className: className, childrenAttributes: childrenAttributes }) };
            obj[tid + '-viewmodel'] = { children: id + '-view-js' };
            obj[id + '-view-js'] = { name: id + '.js', content: require('./templates/xor.js.ejs')({ id: id, children: children, events: events, defaultChild: defaultChild, currentTopLevel: tid, landmarks: landmarks, path: path }) };
            return obj;
        }
    )
];