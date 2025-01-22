const MARGIN = 0.22; // Adjust as needed
// expand each latitude boundary by 0.02 degrees (~2.2 km) 
// and longitude by 0.02 degrees (~1.8 km).
// north: 40.2216, // Broader Northernmost latitude
// south: 40.0860, // Broader Southernmost latitude
// east: 33.0249,  // Broader Easternmost longitude
// west: 32.8827,  // Broader Westernmost longitude
export const AIRPORTS: any = [
    {
        name: 'ankaraEsenboga', 
        bounds: {
            north: 40.2216 + MARGIN, 
            south: 40.0860 - MARGIN, 
            east: 33.0249 + MARGIN, 
            west: 32.8827 - MARGIN, 
        },
        coefficient: 1.7,
    },
    {
        name: 'bodrumMilas', 
        bounds: {
            north: 37.2812 + MARGIN,
            south: 37.1980 - MARGIN,
            east: 27.7126 + MARGIN,
            west: 27.6188 - MARGIN,
        },
        coefficient: 1.7,
    },
    {
        name: 'izmirAdnanMenderes',
        bounds: {
            north: 38.3500 + MARGIN,
            south: 38.2564 - MARGIN,
            east: 27.1918 + MARGIN,
            west: 27.1048 - MARGIN,
        },
        coefficient: 1.5,
    },
    {
        name: 'istanbulAirport',
        bounds: {
            north: 41.2700 + MARGIN,
            south: 40.9460 - MARGIN,
            east: 28.8515 + MARGIN,
            west: 28.6473 - MARGIN,
        },
        coefficient: 1.3,
    },
    {
        name: 'istanbulSabihaGokcen',
        bounds: {
            north: 40.9441 + MARGIN,
            south: 40.8567 - MARGIN,
            east: 29.3425 + MARGIN,
            west: 29.2515 - MARGIN,
        },
        coefficient: 1.3,
    },
    {
        name: 'muglaDalaman', 
        bounds: {
            north: 36.7530 + MARGIN,
            south: 36.6678 - MARGIN,
            east: 28.8228 + MARGIN,
            west: 28.7352 - MARGIN,
        },
        coefficient: 1.3,
    },
    {
        name: 'antalya', 
        bounds: {
            north: 36.9425 + MARGIN,
            south: 36.8200 - MARGIN,
            east: 30.8300 + MARGIN,
            west: 30.6700 - MARGIN,
        },
        coefficient: 1,
    },
    {
        name: 'alanyaGazipasa', 
        bounds: {
            north: 36.3300 + MARGIN,
            south: 36.2200 - MARGIN,
            east: 32.0300 + MARGIN,
            west: 31.8700 - MARGIN,
        },
        coefficient: 1,
    },
];
