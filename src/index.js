import 'ol/ol.css';


import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import * as olControl from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import * as olProj from 'ol/proj';

import { Datasets, CurrentDataset } from './datasets';

import { httpGetAsync, onGetData, onStationData, onMapSingleClick } from './events';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)
Chart.defaults.color = '#FFFFFF'


var dataSource = new VectorSource({
    features: []
});

var dataLayer = new VectorLayer({
    source : dataSource,
    style : Datasets[CurrentDataset].symbol
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
        dataLayer.setStyle(Datasets[CurrentDataset].symbolNear);
    }
    else {
        dataLayer.setStyle(Datasets[CurrentDataset].symbol);
    }
});

map.on('singleclick', function(evt) {
    onMapSingleClick(evt, map)
});

var datasetSelect = document.getElementById('dataset-select');
datasetSelect.onchange = function() { 
    if (datasetSelect.value != CurrentDataset) {
        CurrentDataset = datasetSelect.value;
        httpGetAsync(`https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${Object.keys(Datasets[CurrentDataset].parameters)[0]}/station-set/all/period/latest-hour/data.json`, (response)=>{
            onGetData(response, dataSource)
            if (map.getView().getZoom() > 7) {
                dataLayer.setStyle(Datasets[CurrentDataset].symbolNear);
            }
            else {
                dataLayer.setStyle(Datasets[CurrentDataset].symbol);
            }
        });
        
    }
}

httpGetAsync(`https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${Object.keys(Datasets[CurrentDataset].parameters)[0]}/station-set/all/period/latest-hour/data.json`, (response)=>onGetData(response, dataSource));