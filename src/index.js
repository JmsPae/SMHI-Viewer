import 'ol/ol.css';

import Style  from 'ol/style/Style';
import RegularShape from 'ol/style/RegularShape';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import * as olControl from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';


import { onGetData, onStationData } from './events';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)
Chart.defaults.color = '#FFFFFF'


function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}

var colorPalette = {
    '-1.0': [43, 131, 186, 1.0],
    '-0.5': [171, 221, 164, 1.0],
    '0.0': [255, 255, 255, 1.0],
    '0.5': [253, 174, 97, 1.0],
    '1.0': [215, 25, 28, 1.0],
};

function formatUnixTime(timestamp) {
    var date = new Date(timestamp);
    var now = new Date().getTime();
    var diff = new Date(now - date.getTime());


    if (diff.getHours() < 2) {
        return diff.getMinutes() + ((diff.getMinutes() > 1) ? " minutes ago." : " minute ago.");
    }
    return (diff.getHours()-1) + (((diff.getHours()-1) > 1) ? " hours ago." : " hours ago.");
}

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

const tempNear = function(feature) {
    var cross = new Style({
            image: new RegularShape({
                fill: new Fill({color: 'red'}),
                stroke: new Stroke({
                    color: lerpPalette(feature.get('stationValue') / 30), 
                    width: 3
                }),
                points: 4,
                radius: 10,
                radius2: 0,
                angle: (feature.get('stationValue') / 30) * (Math.PI/4),
            }),
            text: new Text({
                font: '20px sans',
                text: feature.get('stationValue') + "°C",
                offsetX: 30,
                offsetY: 20,
                fill: new Fill({
                  color: lerpPalette(feature.get('stationValue') / 30)
                })
            }),
        });
    return [cross];
}

const tempFar = function(feature) {
    var cross = new Style({
            image: new RegularShape({
                fill: new Fill({color: 'red'}),
                stroke: new Stroke({
                    color: lerpPalette(feature.get('stationValue') / 30), 
                    width: 3
                }),
                points: 4,
                radius: 10,
                radius2: 0,
                angle: (feature.get('stationValue') / 30) * (Math.PI/4),
            })
        });
    return [cross];
}


var dataSource = new VectorSource({
    features: []
});

var dataLayer = new VectorLayer({
    source : dataSource,
    style : tempFar
})


var map = new Map({
    target: 'map',
    controls: olControl.defaults({
        attributionOptions: ({
            collapsible: false
        })
    }),

    layers: [
        new TileLayer({
            source: new XYZ({
                url: "https://api.maptiler.com/maps/basic-dark/{z}/{x}/{y}.png?key=L5nAdce4BguwWGwEyUgZ",
                tileSize: 512,
                crossOrigin: 'anonymous',

                attributions:'<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a> <a href="https://www.smhi.se/data/oppna-data/villkor-for-anvandning-1.30622" target="_blank">&copy; SMHI</a> | Map by <a href="https://github.com/JmsPae" target="_blank">James P</a>',
            }),
        }),

        dataLayer
    ],
    view: new View({
        center: olProj.fromLonLat([15.713, 62.508]),
        zoom: 5
    })
});


map.on('moveend', function(evt) {
    if (evt.map.getView().getZoom() > 7) {
        dataLayer.setStyle(tempNear);
    }
    else {
        dataLayer.setStyle(tempFar);
    }
});

map.on('singleclick', function(evt) {
    var feat = null;
    
    map.forEachFeatureAtPixel(evt.pixel, 
        function(feature, layer) {
            feat = feature;
        },
        { hitTolerance: 5 }
    );

    if (feat != null) {
        var str = '<div><b>'+feat.get('stationName')+'</b><br>';
        str += feat.get('stationValue') + '°C<br>'
        var quality = ((feat.get('stationValueQuality') == 'G') ? "Checked and approved" : "Unchecked/Aggregated");
        
        str += 'Quality: ' + quality + '<br>'
        str += formatUnixTime(feat.get('stationValueDate')) + '</div><br>';
        str += '<canvas id="dataChart"></canvas>'

        document.getElementById('data').innerHTML = str;

        //popup.show(feat.getGeometry().getCoordinates(), str);

        

        httpGetAsync('https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/1/station/'+feat.get('stationId')+'/period/latest-day/data.json', onStationData);

        
    }
    else {
        document.getElementById('data').innerHTML = ""
    }
});



httpGetAsync("https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/1/station-set/all/period/latest-hour/data.json", (response)=>onGetData(response, dataSource));

