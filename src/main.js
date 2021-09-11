const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const console = require("console");
const { layersOrder,
  format,
  rarity,
  locations,
  defaultEdition,
  savedFilename,
  enableRenameFile,
  enableWriteVersion
} = require("./config.js");

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");

if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

const buildDir = `${process.env.PWD}/build`;
const metDataFile = '_metadata.json';
const layersDir = `${process.env.PWD}/layers`;

let metadata = [];
let attributes = [];
let hash = [];
let decodedHash = [];
let tempNum = 0;

const addRarity = _str => {
  let itemRarity;

  rarity.forEach((r) => {
    if (_str.includes(r.key)) {
      itemRarity = r.val;
    }
  });

  return itemRarity;
};

const cleanName = _str => {
  let name = _str.slice(0, -4);
  rarity.forEach((r) => {
    name = name.replace(r.key, "");
  });
  return name;
};

const getElements = path => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index + 1,
        name: cleanName(i),
        fileName: i,
        rarity: addRarity(i),
      };
    });
};

const layersSetup = layersOrder => {
  const layers = layersOrder.map((layer, index) => ({
    id: index,
    name: layer,
    location: `${layersDir}/${layer}/`,
    elements: getElements(`${layersDir}/${layer}/`),
    position: { x: 0, y: 0 },
    size: { width: format.width, height: format.height },
  }));

  return layers;
};

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
};

const saveLayer = (_canvas, _edition) => {
  fs.writeFileSync(`${buildDir}/${_edition}.png`, _canvas.toBuffer("image/png"));
};

const addMetadata = _edition => {
  let dateTime = Date.now();
  let tempMetadata = {
    hash: hash.join(""),
    decodedHash: decodedHash,
    edition: _edition,
    date: dateTime,
    attributes: attributes,
  };
  metadata.push(tempMetadata);
  attributes = [];
  hash = [];
  decodedHash = [];
};

const addAttributes = (_element, _layer) => {
  let tempAttr = {
    id: _element.id,
    layer: _layer.name,
    name: _element.name,
    rarity: _element.rarity,
  };
  attributes.push(tempAttr);
  hash.push(_layer.id);
  hash.push(_element.id);
  decodedHash.push({ [_layer.id]: _element.id });
};

const drawLayer = async (_layer, _edition) => {
  let element =
    _layer.elements[Math.floor(Math.random() * _layer.elements.length)];
  addAttributes(element, _layer);
  const image = await loadImage(`${_layer.location}${element.fileName}`);

  ctx.drawImage(
    image,
    _layer.position.x+2,
    _layer.position.y+2,
    _layer.size.width-2,
    _layer.size.height-2
  );
  saveLayer(canvas, _edition);
};

const createFiles = edition => {
  const layers = layersSetup(layersOrder);
  startWatcher()

  for (let i = 1; i <= edition; i++) {
    ctx.clearRect(0, 0, canvas.width+5, canvas.height+5);
    layers.forEach((layer) => {
      drawLayer(layer, i);
    });
    addMetadata(i);
    console.log("Creating edition " + i);
  }
};

const startWatcher = () => {
  const watcher = fs.watch(`${buildDir}`, async (eventname, filename) => {
    const num = filename.substr(0, filename.indexOf('.'));
    if(tempNum != num) {
      tempNum = num
      await renameFile(num, filename)
    }
    if(num == defaultEdition) {
      watcher.close()
    }
  })
}

const renameFile = async (num, filename) => {
  const attribute = metadata[num-1].attributes
  var version = ""
  attribute.forEach((att) => {
    version = version.concat(`${att.id}`)
  })
  if(enableWriteVersion) {
    const locationId = attribute[0].id
    const locationName = locations[locationId-1].place
    const color = locations[locationId-1].color
    await drawTextLayer(num, color, `Found on: ${locationName} - Specimen #${version}`, `${buildDir}/${filename}`)
  }
  if(enableRenameFile) {
    fs.rename(`${buildDir}/${filename}`, `${buildDir}/${savedFilename} - #${version}.png`, function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });
  }
}

const drawTextLayer = async (_edition, _color, _text, path) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  const image = await loadImage(path);
  ctx.drawImage(
    image,
    0+2,
    0+2,
    format.width-2,
    format.height-2
  );
  ctx.font = `bold ${format.width/42}px monospace`;
  ctx.fillStyle = _color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = "center";
  ctx.fillText(_text, (format.width/2), (format.height/10)*9.5);
  saveLayer(canvas, _edition);
};

const createMetaData = () => {
  fs.stat(`${buildDir}/${metDataFile}`, (err) => {
    if(err == null || err.code === 'ENOENT') {
      fs.writeFileSync(`${buildDir}/${metDataFile}`, JSON.stringify(metadata));
    } else {
        console.log('Oh no, error: ', err.code);
    }
  });
};


module.exports = { buildSetup, createFiles, createMetaData };