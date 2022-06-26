import Style  from 'ol/style/Style';
import RegularShape from 'ol/style/RegularShape';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import Feature from 'ol/Feature';

var colorPalette = {
    '-1.0': [43, 131, 186, 1.0],
    '-0.5': [171, 221, 164, 1.0],
    '0.0': [255, 255, 255, 1.0],
    '0.5': [253, 174, 97, 1.0],
    '1.0': [215, 25, 28, 1.0],
};

function lerpCols(col2, col1, x) {
    var colRet = new Array(4);
    for (var i = 0; i < 4; i++) {
        colRet[i] = col1[i]*x + col2[i]*(1.0-x);
    }
    return colRet;
}

function lerpPalette(x) {
    var ret = colorPalette['-1.0']
    if (x > -1.0 && x < -0.5) {
        ret = lerpCols(colorPalette['-1.0'], colorPalette['-0.5'], (x + 1)*2);
    }
    else if (x < 0.0) {
        ret = lerpCols(colorPalette['-0.5'], colorPalette['0.0'], (x + 0.5)*2);
    }
    else if (x < 0.5) {
        ret = lerpCols(colorPalette['0.0'], colorPalette['0.5'], (x)*2);
    }
    else {
        ret = lerpCols(colorPalette['0.5'], colorPalette['1.0'], (x - 0.5)*2);
    }
    return ret;
}

const TemperatureSymbolNear = function(feature) {
    var cross = new Style({
            image: new RegularShape({
                fill: new Fill({color: 'red'}),
                stroke: new Stroke({
                    color: lerpPalette(feature.get('stationValue') / 35), 
                    width: 3
                }),
                points: 4,
                radius: 10,
                radius2: 0,
                angle: (feature.get('stationValue') / 35) * (Math.PI/4),
            }),
            text: new Text({
                font: '20px sans',
                text: feature.get('stationValue') + "°C",
                offsetX: 30,
                offsetY: 20,
                fill: new Fill({
                  color: lerpPalette(feature.get('stationValue') / 35)
                })
            }),
        });
    return [cross];
}

const TemperatureSymbol = function(feature) {
    var cross = new Style({
            image: new RegularShape({
                fill: new Fill({color: 'red'}),
                stroke: new Stroke({
                    color: lerpPalette(feature.get('stationValue') / 35), 
                    width: 3
                }),
                points: 4,
                radius: 10,
                radius2: 0,
                angle: (feature.get('stationValue') / 35) * (Math.PI/4),
            })
        });
    return [cross];
}

export {TemperatureSymbol, TemperatureSymbolNear};