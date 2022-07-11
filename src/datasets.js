import { TemperatureSymbol, TemperatureSymbolNear, RadiationSymbol, PrecipitationSymbol } from "./symbols";

class Parameter {
    constructor(id, period, timeframe) {
        this.id = id;
        this.period = period;
        this.timeframe = timeframe;
    }
};

class Dataset {
    constructor(unit, symbol, symbolNear, parameters) {
        this.unit = unit;
        this.symbol = symbol;
        this.symbolNear = symbolNear;
        this.parameters = parameters;
    }
}

const Datasets = { 

    'airTemperature': new Dataset('°C', TemperatureSymbol, TemperatureSymbolNear, [
        //IDs according to the SMHI API specifications.
        //First Parameter will be displayed on the map. (hourly dataset)
        new Parameter('1', 'latest-day', 'Hourly'),
        new Parameter('2', 'latest-months', 'Daily')
    ]),
    'radiation': new Dataset('W/m²', RadiationSymbol, RadiationSymbol, [
        new Parameter('11', 'latest-day', 'Hourly'),
        new Parameter('24', 'latest-day', 'Hourly')
    ]),
    'precipitation': new Dataset('mm', PrecipitationSymbol, PrecipitationSymbol, [
        new Parameter('7', 'latest-day', 'Hourly'),
        new Parameter('5', 'latest-months', 'Daily')
    ])
};

var CurrentDataset = 'airTemperature';

export { Datasets, CurrentDataset };