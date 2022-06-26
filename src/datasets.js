import { TemperatureSymbol, TemperatureSymbolNear } from "./symbols";

const Datasets = { //IDs according to the SMHI API specifications
    '1': {
        symbol: 'temperature',
        min: -30,
        max: 30,
        unit: '°C',
        timeframe: 'Hourly',
        symbol: TemperatureSymbol,
        symbolNear: TemperatureSymbolNear,
        'other': {
            '22': {
                timeframe: 'Daily'
            }
        }
    }
};

var CurrentDataset = '1';

export { Datasets, CurrentDataset };