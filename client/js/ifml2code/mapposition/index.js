// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    mapposition = { };

exports.mapposition = mapposition;

mapposition.map = function (map, childrenAttributes, id) {
    let positioned_map = _.cloneDeep(map);
    positioned_map = getNodeMap(map, childrenAttributes, id);
    return positioned_map;
};



/**
 * function to create node map from existing position attributes that user have set
 * @param  {object} map empty map object
 * @param  {[{attributes:[]}, {id: 0}]} data children attributes of the selected view
 * @return {object} the new map json
 */
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

/**
 * function to map attributes position betweennode
 * @param  {object} map map object
 * @param  {[{attributes:[]}, {id: 0}]} data children attributes of the selected view
 * @param  {object} id index of the selected node
 * @return {object} the new map json
 */

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

/**
 * function to map attribute position betweennode
 * @param  {object} map map object
 * @param  {object} tar_id id of the component that was reference from the current node's position attribute
 * @param  {object} ref_id id of the node that refering the targeted component
 * @param  {object} attrref attributes of the refering view
 * @param  {object} attrtar attributes of the refered view
 * @return {object} the new map json
 */

function mapthis(map, tar_id, ref_id, attrref, attrtar) {

    if (tar_id == "none" || ref_id == "none") {
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


/**
 * function to create node map from existing position attributes that user have set
 * @param  {object} map empty map object
 * @param  {[{attributes:[]}, {id: 0}]} data children attributes of the selected view
 * @return {object} the new map json
 */

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


/**
 * function to find root that is lonely and doesn't have any relationship
 * @param  {object} map current map
 * @return {object} the new root array
 */

 function getSingleRootId(map) {
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
    // root_arr = root_arr.concat(tmp);
    // console.log('root arr', root_arr);

    return tmp;
}

/**
 * function to generate col and row depth level for current map
 * @param  {object} map current map
 * @param  {object} root_arr the array that contain all root
 * @param  {object} parentId id of the parent view that contain the current views
 * @return {object} the new map that contain all the depth level
 */

function getDepthLevel(map, root_arr, parentId) {
    for (var root in root_arr) {
        var node = { id: root_arr[root] };
        map = setDepthForNode(map, node, 0, 0, parentId);
    }
    return map;
}

/**
 * function to generate col and row depth level from current root 
 * @param  {object} map current map
 * @param  {object} node root node
 * @param  {object} col_depth col depth that want to be set
 * @param  {object} row_depth row depth that want to be set
 * @param  {object} parentId id of the parent view that contain the current views
 * @return {object} the new map that contain the depth level that can be generated from the current root
 */

function setDepthForNode(map, node, col_depth, row_depth, parentId) {

    var node_index = map.indexOf(map.filter((x) => {
        return x.id == node.id;
    })[0]);

    // console.log("Col depth ", col_depth);
    // console.log("Row depth ", row_depth);

    map = setDepth(map, node_index, col_depth, row_depth);

    // console.log("Set depth OK!", map);

    var node_path = [];
    node_path.push({ i: node_index });
    // console.log ("node path 11", node_path);
    map = setDepthForAllNodeBranch(map, node_index, col_depth, row_depth, node_path, parentId);

    return map;
}

/**
 * Recursive function to generate col and row depth level for current node
 * @param  {object} map current map
 * @param  {object} index index of the current selected node in map
 * @param  {object} col_depth col depth of the selected node
 * @param  {object} row_depth row depth of the selected node
 * @param  {object} node_path the array that contains visited node
 * @param  {object} parentId id of the parent view that contain the current views
 * @return {object} the map that contain new node with already set col and row depth (if possible)
 */

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

/**
 * function to check node validity and then set col and row depth level for current node
 * @param  {object} map current map
 * @param  {object} index index of the current selected node in map
 * @param  {object} attribute_name index of the current selected node in map
 * @param  {object} col_depth col depth that want to be set
 * @param  {object} row_depth row depth that want to be set
 * @param  {object} node_path the array that contains visited node
 * @param  {object} parentId id of the parent view that contain the current views
 * @return {object} the map that contain new node with already set col and row depth (if possible)
 */

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

            if (map[node_index].col_depth != -1 || map[node_index].row_depth != -1) {
                node_path.push({ i: node_index });
                // console.log ("node path push", node_path);
            }
            map = setDepthForAllNodeBranch(map, node_index, map[node_index].col_depth,  map[node_index].row_depth, node_path);
        }
    }


    return map;
}

/**
 * function to set col and row depth level for current node
 * @param  {object} map current map
 * @param  {object} index index of the current selected node in map
 * @param  {object} col_depth col depth that want to be set
 * @param  {object} row_depth row depth that want to be set
 * @param  {object} parentId id of the parent view that contain the current views
 * @return {object} the map that contain new node with already set col and row depth (if possible)
 */

function setDepth(map, index, col_level, row_level, parentId) {
    // console.log("Map index", index);
    // console.log("col", col_level);
    // console.log("row", row_level);
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

/**
 * function to create node map, it inclues 3 steps: 
 * Maping relation between 2 node
 * Find root in the upper left corner
 * Set col and row depth for map
 * @param  {object} map empty map object
 * @param  {object} childrenAttributes children attributes of the selected view
 * @param  {object} id id of the current selected component 
 * @return {object} the new map json
 */
function getNodeMap(map, childrenAttributes, id) {
    // console.log("data", childrenAttributes);
    if (childrenAttributes.length > 0) {
        map = mapLayoutNodeRelation(map, childrenAttributes);
        let upper_roots = findUpperRoots(map, id);
        let left_roots = findLeftRoots(map, id);
        let single_roots = getSingleRootId(map);
        map = getRowDepthLevel(map, upper_roots, id);
        map = getColDepthLevel(map, left_roots, id);
        map = getDepthLevel(map, single_roots, id);
    }
    return map;
}

/**
 * function to generate row depth level for current map
 * @param  {object} map current map
 * @param  {object} root_arr the array that contain all root
 * @param  {object} parentId id of the parent view that contain the current views
 * @return {object} the new map that contain all the depth level
 */

function getRowDepthLevel(map, root_arr, parentId) {
    for (var root in root_arr) {
        var node = { id: root_arr[root] };
        map = setDepthForNode(map, node, -1, 0, parentId);
    }
    return map;
}

/**
 * function to generate col depth level for current map
 * @param  {object} map current map
 * @param  {object} root_arr the array that contain all root
 * @param  {object} parentId id of the parent view that contain the current views
 * @return {object} the new map that contain all the depth level
 */

function getColDepthLevel(map, root_arr, parentId) {
    for (var root in root_arr) {
        var node = { id: root_arr[root] };
        map = setDepthForNode(map, node, 0, -1, parentId);
    }
    return map;
}

/**
 * function to find left roots for the map (anchor)
 * Currently we're choosing the left and upper border as the anchor
 * This is the side that we choose:
 * -------------------
 * |
 * |
 * |
 * |
 * |
 * The right and bottom border will be created based on the anchor
 * @param  {object} map map object that was created from mapLayoutNodeRelation
 * @param  {object} parentId id of the parent view that contain the current views
 * @return {object} the new root array
 */

function findLeftRoots(map, parentId) {
    var root_arr = [];

    // console.log("Root parent id", parentId);
    root_arr = getLeftRootId(root_arr, map, parentId);
    root_arr = getLeftRootId(root_arr, map, 'none');
    return root_arr;

}

/**
 * function to find root for the map (anchor)
 * @param  {object} root_arr the array that contain all root
 * @param  {object} map current map
 * @param  {object} condition the id
 * @return {object} the new root array
 */

function getLeftRootId(root_arr, map, condition) {
    var tmp = map.filter((x) => {
        return (x.attributes.thisLeft_toLeftOf[0] == condition);
    }).map(x => x.id);
    root_arr = root_arr.concat(tmp);
    return root_arr;
}

/**
 * function to find upper roots for the map (anchor)
 * Currently we're choosing the left and upper border as the anchor
 * This is the side that we choose:
 * -------------------
 * |
 * |
 * |
 * |
 * |
 * The right and bottom border will be created based on the anchor
 * @param  {object} map map object that was created from mapLayoutNodeRelation
 * @param  {object} parentId id of the parent view that contain the current views
 * @return {object} the new root array
 */

function findUpperRoots(map, parentId) {
    var root_arr = [];
    root_arr = getUpperRootId(root_arr, map, parentId);
    root_arr = getUpperRootId(root_arr, map, 'none');
    return root_arr;
}

/**
 * function to find root for the map (anchor)
 * @param  {object} root_arr the array that contain all root
 * @param  {object} map current map
 * @param  {object} condition the id 
 * @return {object} the new root array
 */

function getUpperRootId(root_arr, map, condition) {
    var tmp = map.filter((x) => {
        return (x.attributes.thisTop_toTopOf[0] == condition);
    }).map(x => x.id);
    root_arr = root_arr.concat(tmp);

    return root_arr;
}
