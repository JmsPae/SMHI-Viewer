import 'ol/ol.css';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import * as olControl from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import * as GeoTIFFjs from 'geotiff';

import { Datasets, CurrentDataset } from './datasets';

import { httpGetAsync, onGetData, onStationData, onMapSingleClick } from './events';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)
Chart.defaults.color = '#FFFFFF';


async function downloadImage(imageSrc) {
    const img = await fetch(imageSrc)
    const imageBlob = await img.blob()
    GeoTIFFjs.fromBlob(imageBlob).then( tiff=> {
        tiff.getImage().then(image=>{
            console.log(image.getBoundingBox());
            console.log(image.getGDALNoData());
        });
        
    });
    
    
}

//downloadImage('https://opendata-download-radar.smhi.se/api/version/1.0/area/sweden/product/comp/latest.tif');

var dataSource = new VectorSource({
    features: []
});

var dataLayer = new VectorLayer({
    source : dataSource,
    style : Datasets[CurrentDataset].symbol
});


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
                url: "https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=L5nAdce4BguwWGwEyUgZ",
                tileSize: 512,
                crossOrigin: 'anonymous',

                attributions:'<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a> <a href="https://www.smhi.se/data/oppna-data/villkor-for-anvandning-1.30622" target="_blank">&copy; SMHI</a> | Map by <a href="https://github.com/JmsPae" target="_blank">James P</a>',
            }),
        }),

        dataLayer
    ],
    view: new View({
        center: olProj.fromLonLat([15.713, 62.508]), //Central Sweden (ish)
        zoom: 5
    })
});

function updateSymbols() {
    if (map.getView().getZoom() > 7) {
        dataLayer.setStyle(Datasets[CurrentDataset].symbolNear);
    }
    else {
        dataLayer.setStyle(Datasets[CurrentDataset].symbol);
    }
}

map.on('moveend', function(evt) {
    updateSymbols();
});

map.on('singleclick', function(evt) {
    onMapSingleClick(evt, map);
});

$(document).ready(function() {
    let datasetSelect = $('#dataset-select');
    
    datasetSelect.change(()=>{
        if (datasetSelect.val() != CurrentDataset) {
            CurrentDataset = datasetSelect.val();
            httpGetAsync(`https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${Datasets[CurrentDataset].parameters[0].id}/station-set/all/period/latest-hour/data.json`, (response, status)=>{
                
                onGetData(response, dataSource)
                
                updateSymbols();
            });
            
        }
    });

    CurrentDataset = datasetSelect.val()

    httpGetAsync(`https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${Datasets[CurrentDataset].parameters[0].id}/station-set/all/period/latest-hour/data.json`, (response, status)=>onGetData(response, dataSource));
});


