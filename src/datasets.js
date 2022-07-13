import { TemperatureSymbol, TemperatureSymbolNear, RadiationSymbol, PrecipitationSymbol } from "./symbols";

class Parameter { // Structs-ish, hopefully to minimize confusion and potential runtime errors. 
    constructor(id, period, description) {
        this.id = id;
        this.period = period;
        this.description = description;
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
        new Parameter('1', 'latest-day', 'Hourly air temperature sample'),
        new Parameter('2', 'latest-months', 'Daily average air temperature')
    ]),
    'radiation': new Dataset('W/m²', RadiationSymbol, RadiationSymbol, [
        new Parameter('11', 'latest-day', 'Hourly short-wave radiation (300~4 000 nm)'),
        new Parameter('24', 'latest-day', 'Hourly long-wave radiation (4 000~100 000 nm)')
    ]),
    'precipitation': new Dataset('mm', PrecipitationSymbol, PrecipitationSymbol, [
        new Parameter('7', 'latest-day', 'Hourly sum of precipitation'),
        new Parameter('5', 'latest-months', 'Daily sum of precipitation')
    ])
};

const globalContext = {
    CurrentDataset: 'airTemperature'
};

export { Datasets, globalContext };