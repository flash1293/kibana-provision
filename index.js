const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const Readable = require('stream').Readable;

const command = process.argv[2];
const spaceId = process.argv[3];
const watch = process.argv[4];
const baseUrl = process.env.URL_KIBANA || 'http://elastic:changeme@localhost:5601';

const soTypes = ['index-pattern', 'dashboard', 'lens', 'map', 'search', 'query', 'visualization'];

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

function unpackJSONPropsInPlace(object) {
  Object.keys(object).forEach((key) => {
    if (typeof object[key] === 'string' && (key.endsWith('JSON') || key == 'visState')) {
      object[key] = JSON.parse(object[key]);
    } else if (typeof object[key] === 'object' && object[key] !== null) {
      unpackJSONPropsInPlace(object[key]);
    }
  });
}

// like unpackJSONPropsInPlace, but the other way around - if the key ends with JSON, stringify the property
function packJSONPropsInPlace(object) {
  Object.keys(object).forEach((key) => {
    if (typeof object[key] !== 'object' || object[key] === null) {
      return;
    }
    if (key.endsWith('JSON') || key == 'visState') {
      object[key] = JSON.stringify(object[key]);
      return;
    }
    packJSONPropsInPlace(object[key]);
  });
}

function objectFilename(object) {
  return `${object.type}-${object.id}.json`;
}

async function push() {
  const objects = [];
  fs.readdirSync('.', { encoding: 'utf8' }).forEach((file) => {
    if (soTypes.some((type) => file.startsWith(type)) && file.endsWith('.json')) {
      const object = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
      packJSONPropsInPlace(object);
      objects.push(JSON.stringify(object));
    }
  });
  const formData = new FormData();
  var file = new Readable();
  file.push(objects.join('\n'));
  file.push(null);
  formData.append('file', file, 'file.ndjson');

  await axios.post(`${baseUrl}/s/${spaceId}/api/saved_objects/_import?overwrite=true`, formData, {
    headers: {
      ...formData.getHeaders(),
      'kbn-xsrf': 'abc',
    },
  });
  console.log('Pushed objects to Kibana');
}

module.exports = async function () {
  try {
    if (command === 'push') {
      if (watch === '--watch') {
        push();
        fs.watch('.', { encoding: 'utf8' }, debounce(push));
      } else {
        push();
      }
    } else if (command === 'pull') {
      const response = await axios.post(
        `${baseUrl}/s/${spaceId}/api/saved_objects/_export`,
        {
          type: soTypes,
          excludeExportDetails: true,
          includeReferencesDeep: true,
        },
        {
          headers: {
            'kbn-xsrf': 'abc',
          },
        }
      );
      const objects = response.data.split('\n').map(JSON.parse);
      objects.forEach(unpackJSONPropsInPlace);
      objects.forEach((object) => {
        fs.writeFileSync(objectFilename(object), JSON.stringify(object, null, 2));
      });
    }
  } catch (e) {
    console.log(e);
  }
};
