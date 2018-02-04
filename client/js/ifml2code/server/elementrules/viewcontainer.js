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
function mapLayoutNodeRelation (data) {
    var map = [];
    //create all note
    map = createMapdata(data); // quan hệ giữa map và data được thể hiện ở index, index của 2 bên tương ứng với nhau
    //map: Gồm các nốt với mỗi nốt có 8 attributes định hướng, mỗi attr là một array và một id của Layout hiện tại
    for (var i = 0; i < data.length; i++) {
        map = mapAttributeNode(map, data, i); //Chui vào 8 nốt được định tới và nhét vào các nốt đó thông tin rằng nốt đó được ref bởi thằng này
    }
    return map;
}


//i: current index of the selected node
function mapAttributeNode(map, data, i) {
    //truy xuất từng mảng attr
    //id truyền vô là id được tham chiếu từ node hiện tại
    map = mapthis(map, data[i].attributes.thisBottom_toBottomOf, data[i].id, 'thisBottom_toBottomOf', 'thisBottom_toBottomOf');
    map = mapthis(map, data[i].attributes.thisBottom_toTopOf, data[i].id, 'thisBottom_toTopOf', 'thisTop_toBottomOf');
    map = mapthis(map, data[i].attributes.thisLeft_toLeftOf, data[i].id, 'thisLeft_toLeftOf', 'thisLeft_toLeftOf');
    map = mapthis(map, data[i].attributes.thisLeft_toRightOf, data[i].id, 'thisLeft_toRightOf', 
'thisRight_toLeftOf');
    map = mapthis(map, data[i].attributes.thisRight_toLeftOf, data[i].id, 'thisRight_toLeftOf', 
'thisLeft_toRightOf');
    map = mapthis(map, data[i].attributes.thisRight_toRightOf, data[i].id, 'thisRight_toRightOf', 'thisRight_toRightOf');
    map = mapthis(map, data[i].attributes.thisTop_toBottomOf, data[i].id, 'thisTop_toBottomOf', 'thisBottom_toTopOf');
    map = mapthis(map, data[i].attributes.thisTop_toTopOf, data[i].id, 'thisTop_toTopOf', 'thisTop_toTopOf')

    return map;
}

function mapthis(map, tar_id, ref_id, attrtar, attrref) {

    if (tar_id == "parent" || tar_id == "none") {
        //do nothing
        return map;
    }

    var target_index = map.indexof(map.filter((x) => {
        return x.id == tar_id;
    })[0]);

    var existAttr = map[target_index].attributes[attrtar].indexof(map[target_index].attributes[attrtar].filter((x) => {
        return x.id == ref_id;
    })[0]);

    if (existAttr != -1) {
        map[target_index].attributes[attrtar].push(ref_id);
    }

    return map;

}

function createMapData(){
    var map = [];
    for (var i = 0; i < data.length; i++) {
        var tmpNode = {
            id: data[i].id,
            col_depth: 0,
            row_depth: 0,
            attributes: {
                thisBottom_toBottomOf: [data[i].attributes.thisBottom_toBottomOf],
                thisBottom_toTopOf: [data[i].attributes.thisBottom_toTopOf],
                thisLeft_toLeftOf: [data[i].attributes.thisLeft_toLeftOf],
                thisLeft_toRightOf: [data[i].attributes.thisLeft_toRightOf],
                thisRight_toLeftOf: [data[i].attributes.thisRight_toLeftOf],
                thisRight_toRightOf: [data[i].attributes.thisRight_toRightOf],
                thisTop_toBottomOf: [data[i].attributes.thisTop_toBottomOf],
                thisTop_toTopOf: [data[i].attributes.thisTop_toTopOf]
            }
        };
        map.push(tmpNode);
    }
    return map;
}

/*****
 * 
 * Find root
 * 
 */
function findRoots(map, parentId) {
    var root_id_arr = [];

    root_id_arr = getRootId(root_id_arr, map, parentId, parentId);
    root_id_arr = getRootId(root_id_arr, map, 'none', parentId);
    root_id_arr = getRootId(root_id_arr, map, 'none', 'none');
    root_id_arr = getRootId(root_id_arr, map, parentId, 'none');

    return root_id_arr;
    
}

function getRootId(root_id_arr, map, cond1, cond2) {
    tmp = map.filter((x) => {
        return (x.attributes.thisLeft_toLeftOf[0] == cond1) && (x.attributes.thisTop_toTopOf[0] == cond2) 
    }).map(x => x.id);
    root_id_arr.concat(tmp);
    return root_id_arr;
}

/****
 * 
 * get depth level
 */
function getDepthLevel(map, root_id_arr) {

}


exports.rules = [
    createRule( // map View Container
        function (element, model) { return model.isViewContainer(element) && model.getParent(element) === undefined; },
        function (element, model) {
            var id = element.id,
                name = element.attributes.name,
                className = element.attributes.className,
                descendants = _.chain(model.getDescendants(element, true))
                    .map(function (id) { return model.toElement(id); })
                    .filter(function (e) {
                        if (!model.isEvent(e) || model.getOutbounds(e).length) { return true; }
                        var parent = model.getParent(e);
                        return model.isViewComponent(parent) && parent.attributes.stereotype === 'list' && e.attributes.name === 'selected';
                    })
                    .map('id')
                    .value(),
                obj = {
                    routes: {children: id + '-route'},
                    views: {children: id + '-view'},
                    viewmodels: {children: id + '-viewmodel'},
                };
            console.log("View ", element);
            obj[id + '-route'] = {isFolder: true, name: id, children: id + '-route-index'};
            obj[id + '-route-index'] = {name: 'index.js', content: require('./templates/route.page.index.js.ejs')({id: id})};
            obj[id + '-view'] = {isFolder: true, name: id, children: id + '-view-index'};
            obj[id + '-view-index'] = {name: 'index.jade', content: require('./templates/view.index.jade.ejs')({id: id, name: name, className: className})};
            obj[id + '-viewmodel'] = {isFolder: true, name: id, children: id + '-viewmodel-index'};
            obj[id + '-viewmodel-index'] = {name: 'index.js', content: require('./templates/viewmodel.index.js.ejs')({main: id, descendants: descendants})};
            return obj;
        }
    ),
    createRule( // map View Container
        function (element, model) { return model.isViewContainer(element) && !model.isXOR(element); },
        function (element, model) {
            var id = element.id,
                className = element.attributes.className,
                children = _.chain(model.getChildren(element))
                    .reject(function (id) { return model.isEvent(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map('id')
                    .value(),
                childrenAttributes =  _.chain(model.getChildren(element))
                    .reject(function (id) { return model.isEvent(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (element) {
                        return element;
                    })
                    .value(),
                events = _.chain(model.getChildren(element))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (id) { return model.getOutbounds(id).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) {
                        var flow = model.getOutbounds(event)[0],
                            target = model.getTarget(flow);
                        return { id: event.id, name: event.attributes.name, targetsAction: model.isAction(target)};
                    })
                    .value(),
                top = model.getTopLevelAncestor(element),
                tid = top.id,
                obj = {};
            console.log("Non xor master element", element);
            console.log("Non xor children attribute", childrenAttributes);        
            obj[tid + '-view'] = {children: id + '-jade'};
            obj[id + '-jade'] = {name: id + '.jade', content: require('./templates/nonxor.jade.ejs')({id: id, children: children, events: events, className: className, childrenAttributes: childrenAttributes})};
            obj[tid + '-viewmodel'] = {children: id + '-view-js'};
            obj[id + '-view-js'] = {name: id + '.js', content: require('./templates/nonxor.js.ejs')({id: id, children: children, events: events})};
            return obj;
        }
    ),
    createRule( // map XOR View Container
        function (element, model) { return model.isViewContainer(element) && model.isXOR(element); },
        function (element, model) {
            var id = element.id,
                className = element.attributes.className,
                children = _.chain(model.getChildren(element))
                    .filter(function (id) { return model.isViewContainer(id); })
                    .value(),
                childrenAttributes =  _.chain(model.getChildren(element))
                    .reject(function (id) { return model.isEvent(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (element) {
                        return element;
                    })
                    .value(),
                landmarks = _.chain(children)
                    .filter(function (element) { return model.isLandmark(element); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (element) {
                        return {
                            id: element.id,
                            name: element.attributes.name,
                            broken: _.chain(model.getDescendants(element, true))
                                .reject(function (id) { return model.isEvent(id); })
                                .value()
                        };
                    })
                    .value(),
                defaultChild = _.chain(model.getChildren(element))
                    .filter(function (element) { return model.isDefault(element); })
                    .first()
                    .value(),
                events = _.chain(model.getChildren(element))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (id) { return model.getOutbounds(id).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) {
                        var flow = model.getOutbounds(event)[0],
                            target = model.getTarget(flow);
                        return { id: event.id, name: event.attributes.name, targetsAction: model.isAction(target)};
                    })
                    .value(),
                top = model.getTopLevelAncestor(element),
                tid = top.id,
                path = model.isDefault(top) ? '' : tid,
                obj = {};
                console.log("Xor master element", element);
                console.log("Xor children attribute", childrenAttributes);

            obj[tid + '-view'] = {children: id + '-jade'};
            obj[id + '-jade'] = {name: id + '.jade', content: require('./templates/xor.jade.ejs')({id: id, children: children, events: events, landmarks: landmarks, className: className, childrenAttributes: childrenAttributes})};
            obj[tid + '-viewmodel'] = {children: id + '-view-js'};
            obj[id + '-view-js'] = {name: id + '.js', content: require('./templates/xor.js.ejs')({id: id, children: children, events: events, defaultChild: defaultChild, currentTopLevel: tid, landmarks: landmarks, path: path})};
            return obj;
        }
    )
];

