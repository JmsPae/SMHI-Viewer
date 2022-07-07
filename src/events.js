import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import * as olProj from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Chart, Utils } from 'chart.js';
import { Datasets, CurrentDataset } from './datasets';

function httpGetAsync(theUrl, callback) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}

function formatUnixTime(timestamp) {
    let date = new Date(timestamp);
    let now = new Date().getTime();
    let diff = new Date(now - date.getTime());


    if (diff.getHours() < 2) {
        return diff.getMinutes() + ((diff.getMinutes() > 1) ? " minutes ago." : " minute ago.");
    }
    return (diff.getHours()-1) + (((diff.getHours()-1) > 1) ? " hours ago." : " hours ago.");
}

var Charts = []

function generateChart(stationData, chartId) {
    let dates = [];
    let values = [];

    for (var i in stationData) {
        let dataPoint = stationData[i];
        if ('date' in dataPoint) {
            let date = new Date(dataPoint['date']);

            let hours = date.getHours();
            let minutes = '0' + date.getMinutes();

            dates.push(hours + ':' + minutes.substring(-2));
        }
        else {
            dates.push(dataPoint['ref'])
        }

        values.push(dataPoint['value']);
    }

    
    Charts.push(new Chart(
        document.getElementById(chartId).getContext('2d'),
        {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: Datasets[CurrentDataset].unit,
                    backgroundColor: 'rgb(100, 100, 100)',
                    borderColor: 'rgb(50, 50, 50)',
                    data: values,
                }]
            },
            options: {
                lineTension: 0.5,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Hourly'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: "#3d3d3d"
                        }
                    },
                    y: {
                        grid: {
                            color: "#3d3d3d"
                        }
                    }
                }
            }
            
        }
    ));
}

function onStationData(response, chartId) {
    let stationData = JSON.parse(response)['value'];
    generateChart(stationData, chartId);
}

function onMapSingleClick(evt, map) {
    var feat = null;
    Charts.splice(0, Charts.length); //Clear Charts array
    
    map.forEachFeatureAtPixel(evt.pixel, 
        function(feature, layer) {
            feat = feature;
        },
        { hitTolerance: 5 }
    );

    if (feat != null) {
        let str = '';

        if (feat.get('stationValue') != null) {
            str = `
            <div>
                Station: <b>${feat.get('stationName')}</b><br>
                ${feat.get('stationValue')}${Datasets[CurrentDataset].unit}<br>
                ${formatUnixTime(feat.get('stationValueDate'))}<br>
            </div>`;

            for (let key in Datasets[CurrentDataset].parameters) {
                str +=`<div class="chart-container${key}" style="height:250px"><canvas id="dataChart${key}"></canvas></div>\n`;
            }
        }
        else {
            str = `
            <div>
                Station: <b>${feat.get('stationName')}</b><br>
                No Data last hour
            </div>`;

            for (let key in Datasets[CurrentDataset].parameters) {
                str +=`<div class="chart-container${key}" style="height:250px"><canvas id="dataChart${key}"></canvas></div>\n`;
            }
        }
        

        
        //document.getElementById('data').innerHTML = str;
        $('#data').html(str);

        for (let key in Datasets[CurrentDataset].parameters) {
            let period = Datasets[CurrentDataset].parameters[key].period;
            console.log(key);
            httpGetAsync(`https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${key}/station/${feat.get('stationId')}/period/${period}/data.json`,
            (response) => {
                onStationData(response, `dataChart${key}`);
            });
        }
    }
    else {
        //document.getElementById('data').innerHTML = ""
        $('#data').html('');
    }
}

function onGetData(response, vectorSource) {
    vectorSource.clear();
    let station_list = JSON.parse(response)['station'];

    let features = [];
    
    for (var key in station_list) {
        if (station_list.hasOwnProperty(key)) {
            let station = station_list[key];
            if (station['value'] != null) {

                let idx = station['value'].length - 1; // The value array starts with the oldest, for some reason.
                
                features.push(new Feature({
                    geometry: new Point(olProj.fromLonLat([station['longitude'], station['latitude']])),
                    stationId: station['key'],
                    stationName: station['name'],
                    stationValue: station['value'][idx]['value'],
                    stationValueDate: station['value'][idx]['date']
                }));
                
                //console.log(station);
            }
            else {
                features.push(new Feature({
                    geometry: new Point(olProj.fromLonLat([station['longitude'], station['latitude']])),
                    stationId: station['key'],
                    stationName: station['name'],
                    stationValue: null,
                }));
            }
        }
    }


    vectorSource.addFeatures(features);
}

export {onGetData, onStationData, onMapSingleClick, httpGetAsync};