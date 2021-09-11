const layersOrder = [
    'background',
    'cats',
    'hats'
];
  
const format = {
    width: 1080,
    height: 1080
};

const rarity = [
    { key: "", val: "original" },
    { key: "_r", val: "rare" },
    { key: "_sr", val: "super rare" },
];

const locations = [
    { place: "Park", color: "black"},
    { place: "Grand Canyon", color: "white" },
    { place: "Sunset Hill", color: "white" },
    { place: "Forest Hill", color: "white" },
    { place: "Edge of The Moon", color: "white" },
    { place: "Sea Shore", color: "black" },
    { place: "Green Town", color: "white" },
    { place: "Planet Mars", color: "white" },
    { place: "Venice City", color: "black" }
];

const defaultEdition = 10;
const savedFilename = "Crypto Cats";
const enableRenameFile = false;
const enableWriteVersion = false;

module.exports = { layersOrder, format, rarity, locations, defaultEdition, enableRenameFile, savedFilename, enableWriteVersion };