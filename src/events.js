import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import * as olProj from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Chart, Utils } from 'chart.js';

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}

function formatUnixTime(timestamp) {
    var date = new Date(timestamp);
    var now = new Date().getTime();
    var diff = new Date(now - date.getTime());


    if (diff.getHours() < 2) {
        return diff.getMinutes() + ((diff.getMinutes() > 1) ? " minutes ago." : " minute ago.");
    }
    return (diff.getHours()-1) + (((diff.getHours()-1) > 1) ? " hours ago." : " hours ago.");
}

function onStationData(response) {
    var stationData = JSON.parse(response)['value'];

    var dates = [];
    var values = [];

    for (var i in stationData) {
        var dataPoint = stationData[i];
        var date = new Date(dataPoint['date']);

        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();

        dates.push(hours + ':' + minutes.substring(-2));

        values.push(dataPoint['value']);
    }
   
    
    const data = {
        labels: dates,
        datasets: [{
            label: '°C',
            backgroundColor: 'rgb(100, 100, 100)',
            borderColor: 'rgb(50, 50, 50)',
            data: values,
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
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
        
    };

    const myChart = new Chart(
        document.getElementById('dataChart'),
        config
    );
}

function onMapSingleClick(evt, map) {
    var feat = null;
    
    map.forEachFeatureAtPixel(evt.pixel, 
        function(feature, layer) {
            feat = feature;
        },
        { hitTolerance: 5 }
    );

    if (feat != null) {
        let str = `
        <div>
            <b>${feat.get('stationName')}</b><br>
            ${feat.get('stationValue')}°C<br>
            Quality: ${((feat.get('stationValueQuality') == 'G') ? "Checked and approved" : "Unchecked/Aggregated")}<br>
            ${formatUnixTime(feat.get('stationValueDate'))}<br>
        </div>
        <div id="chart-wrapper"><canvas id="dataChart"></canvas></div>
        `;
        
        document.getElementById('data').innerHTML = str;

        httpGetAsync('https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/1/station/'+feat.get('stationId')+'/period/latest-day/data.json', onStationData);


        
    }
    else {
        document.getElementById('data').innerHTML = ""
    }
}

function onGetData(response, vectorSource) {
    var station_list = JSON.parse(response)['station'];

    for (var key in station_list) {
        if (station_list.hasOwnProperty(key)) {
            var station = station_list[key];
            if (station['value'] != null) {

                var idx = station['value'].length - 1;
                vectorSource.addFeature(new Feature({
                    geometry: new Point(olProj.fromLonLat([station['longitude'], station['latitude']])),
                    stationId: station['key'],
                    stationName: station['name'],
                    stationValue: station['value'][idx]['value'],
                    stationValueDate: station['value'][idx]['date'],
                    stationValueQuality: station['value'][idx]['quality']
                }));
                
                //console.log(station);
            }
        }
    }
}

export {onGetData, onStationData, onMapSingleClick, httpGetAsync};