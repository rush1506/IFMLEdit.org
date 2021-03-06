// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    templatetomodel = { };

exports.templatetomodel = templatetomodel;

templatetomodel.generate = function (ifml) {
    let ifml_generated = _.cloneDeep(ifml);
    ifml_generated.elements.forEach(element => {
        //find the view container that contain all template view
        if (element.type === 'ifml.ViewContainer' && !(element.attributes.refId === 'none')) {
            let newJsonModel = generateViewContainerJsonModel(ifml_generated, element);
            ifml_generated.elements.push(newJsonModel);
            ifml_generated = addHierarchy(ifml_generated, element.id, newJsonModel.id);
            ifml_generated = generateNestedView(ifml_generated, element, newJsonModel, element.attributes.refId);
        }
    });
    ifml_generated = removeTemplateJson(ifml_generated);
    console.log("New model: ", ifml_generated);
    return ifml_generated;
};


/**
 * function to create all view, nested view included
 * @param  {object} ifml_generated IFML WHOLE JSON
 * @param  {object} topParentElement element that contains placeholder information
 * @param  {object} element the current selected component inside the view
 * @param  {object} templateId Id of the targeted template
 * @return {object} the new json
 */

function generateNestedView(ifml_generated, topParentElement, element, templateId) {
    ifml_generated.relations.forEach(relation => {
        if (relation.parent === templateId && relation.type === 'hierarchy') {
            let tempJsonTemplate = generateComponentJsonModel(ifml_generated, topParentElement, element.id, relation.child)
            ifml_generated = addHierarchy(ifml_generated, element.id, tempJsonTemplate.id);
            if (tempJsonTemplate.type === 'ifml.ViewContainer') {
                ifml_generated = generateNestedView(ifml_generated, topParentElement, tempJsonTemplate, relation.child);
            }
            ifml_generated.elements.push(tempJsonTemplate);
        }
    })
    return ifml_generated;
}

/**
 * function to remove all element that is item
 * @param  {object} ifml_generated IFML WHOLE JSON
 * @return {object} the new json
 */

function removeTemplateJson(ifml_generated) {
    let existTemplate = 0;
    ifml_generated.elements.forEach(element => {
        //find the view container that contain all template view
        if (element.attributes.isItem) {
            ifml_generated = removeAllRelatedView(ifml_generated, element.id); 
            existTemplate = 1;    
        }
    });
    if (existTemplate)
        ifml_generated =removeTemplateJson(ifml_generated);
    return ifml_generated;
}


/**
 * recursive function to remove all element
 * @param  {object} ifml_generated IFML WHOLE JSON
 * @param  {any} id id of selected view
 * @return {object} the new json
 */

function removeAllRelatedView(ifml_generated, id) {

    ifml_generated.relations.forEach(relation => {
        if (relation.parent === id && relation.type === 'hierarchy') {
            ifml_generated = removeAllRelatedView(ifml_generated, relation.child);
        }
    })
    ifml_generated = removeView(ifml_generated, id);

    return ifml_generated;
}


/**
 * Remove current element
 * @param  {object} ifml_generated IFML WHOLE JSON
 * @param  {any} id id of selected view
 * @return {object} the new json
 */

function removeView(ifml_generated, id) {
    let index = 0;
    ifml_generated.elements.forEach(element => {
        if (element.id === id) {         
            ifml_generated.elements.splice(index, 1);
            return ifml_generated;
        }
        index++;
    });
    return ifml_generated;
}

/**
 * Add hierarchy for IFML relations
 * @param  {object} ifml_generated IFML WHOLE JSON
 * @param  {any} parentId current ref parent selected element in IFML Json
 * @param  {any} childId child id
 * @return {object} the new json
 */

function addHierarchy(ifml_generated, parentId, childId) {
    let hierarchyNode = {child: childId, parent: parentId, type: 'hierarchy'}
    ifml_generated.relations.push(hierarchyNode);
    return ifml_generated;
}

/**
 * Generate usable component from a template
 * @param  {object} ifml_generated IFML WHOLE JSON
 * @param  {any} topParentElement current ref parent selected element in IFML Json
 * @param  {any} nearParentId neared parent id
 * @param  {any} refId targeted id
 * @return {object} the new json view
 */

function generateComponentJsonModel(ifml_generated, topParentElement, nearParentId, refId) {
    let jsonTemplate = getTemplate(ifml_generated, refId);
    let tempJsonTemplate = JSON.parse(JSON.stringify(jsonTemplate));
    // let tempJsonTemplate = _.cloneDeep(jsonTemplate)
    topParentElement.attributes.placeholder.forEach(pair => {
        tempJsonTemplate = replacePropertyValue(pair.key, pair.value, tempJsonTemplate);
    });
    let newId = nearParentId + '-' + tempJsonTemplate.id;
    if (tempJsonTemplate.type === 'ifml.ViewContainer') {
        tempJsonTemplate = regenPositionAttributes(tempJsonTemplate, nearParentId)
    }
    tempJsonTemplate.id = newId;
    tempJsonTemplate.attributes.isItem = false;
    return tempJsonTemplate;
}

// NOT TESTED
/**
 * Regenerate position attrs
 * @param  {object} tempJsonTemplate current selected view container element
 * @param  {any} nearParentId neared parent id
 * @return {object} the new view with generated attrs
 */

function regenPositionAttributes(tempJsonTemplate, nearParentId) {
    tempJsonTemplate = mapAttribute('thisBottom_toBottomOf', tempJsonTemplate, nearParentId);
    tempJsonTemplate = mapAttribute('thisBottom_toTopOf', tempJsonTemplate, nearParentId);
    tempJsonTemplate = mapAttribute('thisLeft_toLeftOf', tempJsonTemplate, nearParentId);
    tempJsonTemplate = mapAttribute('thisLeft_toRightOf', tempJsonTemplate, nearParentId);
    tempJsonTemplate = mapAttribute('thisRight_toLeftOf', tempJsonTemplate, nearParentId);
    tempJsonTemplate = mapAttribute('thisRight_toRightOf', tempJsonTemplate, nearParentId);
    tempJsonTemplate = mapAttribute('thisTop_toBottomOf', tempJsonTemplate, nearParentId);
    tempJsonTemplate = mapAttribute('thisTop_toTopOf', tempJsonTemplate, nearParentId);
    return tempJsonTemplate;

}

/**
 * Regenerate position attribute
 * @param  {object} attribute current selected attribute
 * @param  {object} element current selected view container element
 * @param  {any} nearParentId neared parent id
 * @return {object} the new view with generated attrs
 */

function mapAttribute(attribute, element, nearParentId) {
    if (element.attributes[attribute] === 'none') {
        return element;
    }
    element.attributes[attribute] = nearParentId + '-' + element.attributes[attribute];
    return element;
}

/**
 * Generate usable view container from a template
 * @param  {object} ifml_generated IFML WHOLE JSON
 * @param  {any} element current selected element in IFML Json
 * @return {object} the new json view
 */

function generateViewContainerJsonModel(ifml_generated, element) {
    let jsonTemplate = getTemplate(ifml_generated, element.attributes.refId);
    let tempJsonTemplate = JSON.parse(JSON.stringify(jsonTemplate));
    // let tempJsonTemplate = _.cloneDeep(jsonTemplate)
    element.attributes.placeholder.forEach(pair => {
        tempJsonTemplate = replacePropertyValue(pair.key, pair.value, tempJsonTemplate);
    });
    let newId = element.id + '-' + tempJsonTemplate.id;
    tempJsonTemplate.id = newId;
    tempJsonTemplate.attributes.isItem = false;
    return tempJsonTemplate;
}

/**
 * Get single template from json object model
 * @param  {object} ifml_generated IFML WHOLE JSON
 * @param  {any} refId current targeted element in IFML Json
 * @return {object}         the new json template object
 */

function getTemplate(ifml_generated, refId){
    let parentId = refId;
    let result;
    ifml_generated.elements.forEach(element => {
        if (element.id === parentId) {
            result = element;
            return element;
        }
    });
    return result;
}


/**
 * Deep search and replaces the given property value "prevVal" with "newVal"
 * @param  {any} prevVal previous value
 * @param  {any} newVal  new value
 * @param  {object|array} object the original object or array in which the values should be replaced
 * @return {object|array}        the new object or array
 */
function replacePropertyValue(prevVal, newVal, object) {
    const newObject = _.clone(object);
  
    _.each(object, (val, key) => {
      if (val === prevVal) {
        newObject[key] = newVal;
      } else if (typeof(val) === 'object' || typeof(val) === 'array') {
        newObject[key] = replacePropertyValue(prevVal, newVal, val);
      }
    });

    return newObject;
  }