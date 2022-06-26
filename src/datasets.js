import { TemperatureSymbol, TemperatureSymbolNear } from "./symbols";

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
    }
};

var CurrentDataset = 'airTemperature';

export { Datasets, CurrentDataset };