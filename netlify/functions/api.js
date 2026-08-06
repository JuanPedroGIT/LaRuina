const https = require('https');

exports.handler = async (event) => {
  const { JSONBIN_KEY, JSONBIN_PROGRAM_ID, JSONBIN_POLLS_ID } = process.env;
  
  const resource = event.queryStringParameters ? event.queryStringParameters.resource : null;
  const binId = resource === 'polls' ? JSONBIN_POLLS_ID : JSONBIN_PROGRAM_ID;

  if (!JSONBIN_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falta la variable de entorno JSONBIN_KEY en Netlify' })
    };
  }

  if (!binId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Falta la variable de entorno para el recurso: ${resource}` })
    };
  }

  const isGet = event.httpMethod === 'GET';
  const path = `/v3/b/${binId}${isGet ? '/latest' : ''}`;

  const options = {
    hostname: 'api.jsonbin.io',
    path: path,
    method: event.httpMethod,
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: { 'Content-Type': 'application/json' },
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: 'Error en la petición a JSONBin', details: err.message })
      });
    });

    if (event.httpMethod === 'PUT' && event.body) {
      req.write(event.body);
    }

    req.end();
  });
};