const axios = require('axios');

const getInstallationAccessToken = require('./accesstoken');

const org = 'cool-stuff-enterprises';

const createRepo = async (event, context, callback) => {
  body = JSON.parse(event.body);
  const token = await getInstallationAccessToken();
  console.log(body);
  axios({
    method: 'post',
    url: `https://api.github.com/orgs/${org}/repos`,
    data: {
      "name": body.name,
      "description": body.description,
    },
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.machine-man-preview+json"
    }
  })
    .catch(error => console.log(error))

  return success(callback);
}

const success = (callback, message = 'Billy Bot says thanks.') => {
  return callback({
    statusCode: 200,
    body: JSON.stringify({
      message: message,
    }),
  });
}



module.exports = { createRepo };