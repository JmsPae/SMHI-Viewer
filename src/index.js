import 'ol/ol.css';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import * as olControl from 'ol/control';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import * as olms from 'ol-mapbox-style'
import VectorTileLayer from 'ol/layer/VectorTile';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';

proj4.defs( // Precipitation radar is in SWEREF99 TM
    'EPSG:3006',
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
register(proj4);

import { Datasets, globalContext } from './datasets';

import { httpGetAsync, onGetData, onStationData, onMapSingleClick } from './events';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)
Chart.defaults.color = '#FFFFFF';
  
//const imgLayer = new ImageLayer();

var dataSource = new VectorSource({
    features: []
});

var dataLayer = new VectorLayer({
    source : dataSource,
    style : Datasets[globalContext.CurrentDataset].symbol,
    renderOrder: function(a, b){
        return Math.abs(a.get('stationValue')) - Math.abs(b.get('stationValue')); // Display more extreme values first (4c < 14c, 2c < -10c, etc).
    },
});
dataLayer.set('name', 'dataLayer');
dataLayer.setZIndex(5);

const layer = new VectorTileLayer({declutter: true});
olms.applyStyle(layer, 'https://api.maptiler.com/maps/darkmatter/style.json?key=L5nAdce4BguwWGwEyUgZ');

var map = new Map({
    target: 'map',
    controls: olControl.defaults({
        attributionOptions: ({
            collapsible: false
        })
    }),

    layers: [
        layer,
        dataLayer
    ],
    view: new View({
        center: olProj.fromLonLat([15.713, 62.508]), //Central Sweden (ish)
        zoom: 5,
    })
});

function updateSymbols() {
    if (map.getView().getZoom() > 7) {
        dataLayer.setStyle(Datasets[globalContext.CurrentDataset].symbolNear);
    }
    else {
        dataLayer.setStyle(Datasets[globalContext.CurrentDataset].symbol);
    }
}

/* Raster layer test
setSource();
function setSource() {
    const source = new Static({
      url: 'https://opendata-download-radar.smhi.se/api/version/latest/area/sweden/product/comp/latest.png',
      crossOrigin: '',
      projection: 'EPSG:3006',
      imageExtent: [126648,5983984,1075693,7771252],
      interpolate: false,
    });
    imgLayer.setSource(source);
}
*/

map.on('moveend', function(evt) {
    updateSymbols();
});

map.on('singleclick', function(evt) {
    onMapSingleClick(evt, map);
});

$(document).ready(function() {
    let datasetSelect = $('#dataset-select');
    
    datasetSelect.change(()=>{
        if (datasetSelect.val() != globalContext.CurrentDataset) {
            globalContext.CurrentDataset = datasetSelect.val();
            httpGetAsync(`https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${Datasets[globalContext.CurrentDataset].parameters[0].id}/station-set/all/period/latest-hour/data.json`, (response, status)=>{
                
                onGetData(response, dataSource)
                
                updateSymbols();
            });
            
        }
    });

    globalContext.CurrentDataset = datasetSelect.val()

    httpGetAsync(`https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${Datasets[globalContext.CurrentDataset].parameters[0].id}/station-set/all/period/latest-hour/data.json`, (response, status)=>onGetData(response, dataSource));
});


