import { TemperatureSymbol, TemperatureSymbolNear, RadiationSymbol } from "./symbols";

const Datasets = { 

    'airTemperature': {
        unit: '°C',
        symbol: TemperatureSymbol,
        symbolNear: TemperatureSymbolNear,

        parameters: {//IDs according to the SMHI API specifications
            '1': {
                period: 'latest-day',
                timeframe: 'Hourly',
            },
            '2': {
                period: 'latest-months',
                timeframe: 'Daily'
            }
        }
    },
    'radiation': {
        unit: 'W/m²',
        symbol: RadiationSymbol,
        symbolNear: RadiationSymbol,

        parameters: {//IDs according to the SMHI API specifications
            '11': {
                period: 'latest-day',
                timeframe: 'Hourly',
            },
            '24': {
                period: 'latest-day',
                timeframe: 'Hourly',
            }
        }
    },
    
};

var CurrentDataset = 'airTemperature';

export { Datasets, CurrentDataset };