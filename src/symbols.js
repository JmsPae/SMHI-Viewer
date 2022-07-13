import Style  from 'ol/style/Style';
import RegularShape from 'ol/style/RegularShape';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import Feature from 'ol/Feature';

const colorPalette = [
    [103,0,31],
    [178,24,43],
    [214,96,77],
    [244,165,130],
    [253,219,199],
        [247,247,247],
    [209,229,240],
    [146,197,222],
    [67,147,195],
    [33,102,172],
    [5,48,97],
];

function lerpCol(a, b, x) {
    let ret = []
    for (let i in a) {
        ret.push(a[i] + (b[i] - a[i]) * x);
    }
    ret.push(1.0);
    return ret;
}

function lerpPalette(x) { // -1 ~ 1
    
    x = -Math.max(Math.min(x, 1.0), -1.0)
    let val = (x*0.5+0.5) * (colorPalette.length-1);

    let lower = Math.floor(val);
    let upper = lower + 1;

    return lerpCol(colorPalette[lower], colorPalette[upper], val - lower);    
}

const tempMax = 30;

let crossNearNoData = new Style({
    image: new RegularShape({
        fill: new Fill({color: 'red'}),
        stroke: new Stroke({
            color: '#555555', 
            width: 3
        }),
        points: 4,
        radius: 10,
        radius2: 0,
        angle: (Math.PI/4),
    }),
    text: new Text({
        font: '20px sans',
        text: 'No Data',
        offsetX: 30,
        offsetY: 20,
        fill: new Fill({
            color: '#555555'
        })
    }),
});

let crossNoData = new Style({
    image: new RegularShape({
        fill: new Fill({color: 'red'}),
        stroke: new Stroke({
            color: '#555555', 
            width: 3
        }),
        points: 4,
        radius: 10,
        radius2: 0,
        angle: (Math.PI/4),
    })
});

const TemperatureSymbolNear = function(feature) {
    let airTemp = feature.get('stationValue');

    let cross = crossNearNoData;

    if (airTemp != null) {
        cross = new Style({
            image: new RegularShape({
                fill: new Fill({color: 'red'}),
                stroke: new Stroke({
                    color: lerpPalette(Math.min(airTemp / tempMax, 1.0)), 
                    width: 3
                }),
                points: 4,
                radius: 10,
                radius2: 0,
                angle: (airTemp / tempMax) * (Math.PI/4),
            }),
            text: new Text({
                font: '20px sans-serif',
                text: airTemp + "°C",
                offsetX: 30,
                offsetY: 20,
                fill: new Fill({
                    color: lerpPalette(Math.min(airTemp / tempMax, 1.0))
                })
            }),
        });
    }

    return [cross];
}

const TemperatureSymbol = function(feature) {
    let airTemp = feature.get('stationValue');

    let cross = crossNoData;

    if (airTemp != null) {
        cross = new Style({
            image: new RegularShape({
                fill: new Fill({color: 'red'}),
                stroke: new Stroke({
                    color: lerpPalette(Math.min(airTemp / tempMax, 1.0)),
                    width: 3
                }),
                points: 4,
                radius: 10,
                radius2: 0,
                angle: Math.min(airTemp / tempMax, 1.0) * (Math.PI/4),
            })
        });
    }

    return [cross];
}

const RadiationSymbol = function(feature) {
    let val = feature.get('stationValue');

    let cross = crossNoData;

    if (val != null) {
        cross = new Style({
            image: new RegularShape({
                fill: new Fill({color: 'red'}),
                stroke: new Stroke({
                    color: lerpPalette(Math.max(Math.min(val / 1000, 1.0), 0.0)), 
                    width: 3
                }),
                points: 3,
                radius: 2+Math.pow(val / 1000, 2)*13,
                radius2: 0
            })
        });
    }
    return [cross];
}

const PrecipitationSymbol = function(feature) {
    let val = feature.get('stationValue');

    let cross = crossNoData;

    if (val != null) {
        cross = new Style({
            image: new RegularShape({
                fill: new Fill({color: 'red'}),
                stroke: new Stroke({
                    color: lerpPalette(Math.max(Math.min(val / 10, 1.0), 0.0)),
                    width: 3
                }),
                points: 4,
                radius: 10,
                radius2: 0,
                angle: Math.min(val / 1.0, 1.0) * (Math.PI/4),
            })
        });
    }

    return [cross];
}

export {TemperatureSymbol, TemperatureSymbolNear, RadiationSymbol, PrecipitationSymbol};