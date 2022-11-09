const pixelTolerance = 10;
const squaredCoordinateDistance = (coord1, coord2) => {
    var dx = coord1[0] - coord2[0];
    var dy = coord1[1] - coord2[1];
    return dx * dx + dy * dy;
};

function intersects(a, b) {
    return b.minX <= a.maxX &&
           b.minY <= a.maxY &&
           b.maxX >= a.minX &&
           b.maxY >= a.minY;
}
const sortByDistance = (a, b) => {
    const deltaA = squaredDistanceToSegment(pixelCoordinate_, a.segment);
    const deltaB = squaredDistanceToSegment(pixelCoordinate_, b.segment);
    return deltaA - deltaB;
}

function squaredDistanceToSegment(coordinate, segment) {
    return squaredCoordinateDistance(coordinate, closestOnSegment(coordinate, segment));
}

function coordinateDistance(coord1, coord2) {
    return Math.sqrt(squaredCoordinateDistance(coord1, coord2));
}

function closestOnSegment(coordinate, segment) {
    var x0 = coordinate[0];
    var y0 = coordinate[1];
    var start = segment[0];
    var end = segment[1];
    var x1 = start[0];
    var y1 = start[1];
    var x2 = end[0];
    var y2 = end[1];
    var dx = x2 - x1;
    var dy = y2 - y1;
    var along = dx === 0 && dy === 0
        ? 0
        : (dx * (x0 - x1) + dy * (y0 - y1)) / (dx * dx + dy * dy || 0);
    var x, y;
    if (along <= 0) {
        x = x1;
        y = y1;
    }
    else if (along >= 1) {
        x = x2;
        y = y2;
    }
    else {
        x = x1 + along * dx;
        y = y1 + along * dy;
    }
    return [x, y];
}

let nodes = [];
let pixelCoordinate_ = [];
const snt = (pixel, pixelCoordinate, lineFeature, map, markerLayer) => {
    nodes = [];
    pixelCoordinate_ = pixelCoordinate || [];
    insertMultiLineStringGeometry(lineFeature);

    var lowerLeft = map.getCoordinateFromPixel([
        pixel[0] - pixelTolerance,
        pixel[1] + pixelTolerance,
    ]);
    var upperRight = map.getCoordinateFromPixel([
        pixel[0] + pixelTolerance,
        pixel[1] - pixelTolerance,
    ]);
    var box = ol.extent.boundingExtent([lowerLeft, upperRight]);
    const ms = markerLayer? markerLayer.getSource() : undefined;
    let segments = sntGetInExtent(box, ms);
    if(!segments.length)
        return null;

    segments.sort(sortByDistance);
   
    //edge
    //&& not circle
    const closestSegment = segments[0].segment;
    let snapped = false;
    
    let vertex = closestOnSegment(pixelCoordinate, closestSegment);
    let vertexPixel = map.getPixelFromCoordinate(vertex);
    if (coordinateDistance(pixel, vertexPixel) <= pixelTolerance) {
        snapped = true;
        var pixel1 = map.getPixelFromCoordinate(closestSegment[0]);
        var pixel2 = map.getPixelFromCoordinate(closestSegment[1]);
        var squaredDist1 = squaredCoordinateDistance(vertexPixel, pixel1);
        var squaredDist2 = squaredCoordinateDistance(vertexPixel, pixel2);
        var dist = Math.sqrt(Math.min(squaredDist1, squaredDist2));
        if (dist <= pixelTolerance) {
            vertex =
                squaredDist1 > squaredDist2
                    ? closestSegment[1]
                    : closestSegment[0];
            vertexPixel = map.getPixelFromCoordinate(vertex);
        }
    }

    // console.log(vertex);
    let snapFeat = new ol.Feature(new ol.geom.Point(vertex));
    snapFeat.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: '#57f8'
            }),
            radius: 7
        })
    }));
    if(ms) {
        ms.addFeature(snapFeat)
    }

    return vertex;
};

const sntGetInExtent = (extent, ms) => {
    var bbox = {
        minX: extent[0],
        minY: extent[1],
        maxX: extent[2],
        maxY: extent[3],
    };
    // var items = rBush.rbush_.search(bbox);
    var items = sntSearch(bbox, ms);
    return items.map(function (item) {
        return item.value;
    });
};
const sntSearch = (bbox, ms) => {
    let result = [];
    for(const node of nodes) {
        let nodeSeg = node.value.segment;
        if(intersects(bbox, {
            minX: nodeSeg[0][0] < nodeSeg[1][0] ? nodeSeg[0][0] : nodeSeg[1][0],
            minY: nodeSeg[0][1] < nodeSeg[1][1] ? nodeSeg[0][1] : nodeSeg[1][1],
            maxX: nodeSeg[0][0] > nodeSeg[1][0] ? nodeSeg[0][0] : nodeSeg[1][0],
            maxY: nodeSeg[0][1] > nodeSeg[1][1] ? nodeSeg[0][1] : nodeSeg[1][1],
        })) {
            result.push(node);

            if(ms) {
                let feat = new ol.Feature(new ol.geom.LineString(nodeSeg));
                feat.setStyle(new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width:5,
                        color: '#70f8'
                    })
                }))
                ms.addFeature(feat);
            }
        }
    }
    return result;
};

const insertMultiLineStringGeometry = (feature) => {
    var coordinates = feature.getGeometry().getCoordinates();
    for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        var segment = coordinates.slice(i, i + 2);
        var segmentData = {
            feature: feature,
            segment: segment,
        };
        let [minX, minY, maxX, maxY] = ol.extent.boundingExtent(segment);
        nodes.push({minX, minY, maxX, maxY, value: segmentData});
    }
};