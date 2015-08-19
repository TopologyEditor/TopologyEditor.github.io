/* returns array of @property  values from @objArray*/
function extractProperties(objArr, property) {
	return objArr.map( function(element) {
		return element[property];
	});
}

/* Returns every joint element from elements array x 
 * that has a defined property.
 *  
 *
 * @param elementsArray {Array>@Joint.dia.Element} array where it is searched at.
 * @param property {String} prroperty we are searching for. 
 */
function sieveByProperty(elementsArray, property) {
	var result = [];
	elementsArray.forEach( function(element) {
		if (element.prop(property) !== undefined) {
			result.push(element);
		}
	});
	return result;
}

function findTasksLinks(taskProps, secondTaskProps, firstIndex, secondIndex) {
    var result = [];
    for (var i = 0; i < taskProps.length; i ++) {
        for ( var j = 0; j < secondTaskProps.length; j ++) {
            if (secondTaskProps[j].id == taskProps[i].id) {
                if (taskProps[i].access === 'write') {
                    result.push({
                        id: secondTaskProps[j].id,
                        source: firstIndex,
                        destination: secondIndex
                    });
                } else {
                    result.push({
                        id: secondTaskProps[j].id,
                        source: secondIndex,
                        destination: firstIndex
                    });
                }
                break;
            }
        }
    }
    return result;
}

/* removes all @Joint.dia.Link from @graph (Joint.dia.graph*/
function restoreLinks(graph) {
	var links = graph.getLinks();
	links.forEach( function(_link) {
		_link.attr('.connection/stroke', 'blue');
	});
}

/* get all @Joint.dia.Link that have the @property*/
function getLinksWithProperty(graph, jointJsMiddleman, property) {
	restoreLinks(graph);
	var propertyLinks = [];
	jointJsMiddleman.jointLinks.forEach( function (link) {
		if (link.attr('.connection-wrap/title') !== undefined) {
			if (link.attr('.connection-wrap/title') == property) {
				propertyLinks.push(link);
			}
		}
	});
	return propertyLinks;
}


// Event Functions 
function adjustVertices(graph, cell) {

    // If the cell is a view, find its model.
    cell = cell.model || cell;

    if (cell instanceof joint.dia.Element) {

        _.chain(graph.getConnectedLinks(cell)).groupBy(function(link) {
            // the key of the group is the model id of the link's source or target, but not our cell id.
            return _.omit([link.get('source').id, link.get('target').id], cell.id)[0];
        }).each(function(group, key) {
            // If the member of the group has both source and target model adjust vertices.
            if (key !== 'undefined') adjustVertices(graph, _.first(group));
        });

        return;
    }

    // The cell is a link. Let's find its source and target models.
    var srcId = cell.get('source').id || cell.previous('source').id;
    var trgId = cell.get('target').id || cell.previous('target').id;

    // If one of the ends is not a model, the link has no siblings.
    if (!srcId || !trgId) return;

    var siblings = _.filter(graph.getLinks(), function(sibling) {

        var _srcId = sibling.get('source').id;
        var _trgId = sibling.get('target').id;

        return (_srcId === srcId && _trgId === trgId) || (_srcId === trgId && _trgId === srcId);
    });

    switch (siblings.length) {

    case 0:
        // The link was removed and had no siblings.
        break;

    case 1:
        // There is only one link between the source and target. No vertices needed.
        cell.unset('vertices');
        break;

    default:

        // There is more than one siblings. We need to create vertices.

        // First of all we'll find the middle point of the link.
        var srcCenter = graph.getCell(srcId).getBBox().center();
        var trgCenter = graph.getCell(trgId).getBBox().center();
        var midPoint = g.line(srcCenter, trgCenter).midpoint();

        // Then find the angle it forms.
        var theta = srcCenter.theta(trgCenter);

        // This is the maximum distance between links
        var gap = 20;

        _.each(siblings, function(sibling, index) {

            // We want the offset values to be calculated as follows 0, 20, 20, 40, 40, 60, 60 ..
            var offset = gap * Math.ceil(index / 2);

            // Now we need the vertices to be placed at points which are 'offset' pixels distant
            // from the first link and forms a perpendicular angle to it. And as index goes up
            // alternate left and right.
            //
            //  ^  odd indexes 
            //  |
            //  |---->  index 0 line (straight line between a source center and a target center.
            //  |
            //  v  even indexes
            var sign = index % 2 ? 1 : -1;
            var angle = g.toRad(theta + sign * 90);

            // We found the vertex.
            var vertex = g.point.fromPolar(offset, angle, midPoint);

            sibling.set('vertices', [{ x: vertex.x, y: vertex.y }]);
        });
    }
};

function initiateDragging(evt, x, y) {
    dragging = true;
    paperPointerX = x;
    paperPointerY = y;
}