import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import * as olProj from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Chart } from 'chart.js';

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
            backgroundColor: 'rgb(50, 50, 50)',
            borderColor: 'rgb(50, 50, 50)',
            data: values,
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            lineTension: 0.5
        }
    };

    const myChart = new Chart(
        document.getElementById('dataChart'),
        config
    );
}

function onGetData(response, vectorSource) {
    var station_list = JSON.parse(response)['station'];

    for (var key in station_list) {
        if (station_list.hasOwnProperty(key)) {
            var station = station_list[key];
            if (station['value'] != null) {

                vectorSource.addFeature(new Feature({
                    geometry: new Point(olProj.fromLonLat([station['longitude'], station['latitude']])),
                    stationId: station['key'],
                    stationName: station['name'],
                    stationValue: station['value'][0]['value'],
                    stationValueDate: station['value'][0]['date'],
                    stationValueQuality: station['value'][0]['quality']
                }));
                
                //console.log(station);
            }
        }
    }
}

export {onGetData, onStationData};