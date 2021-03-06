const jwt = require('jsonwebtoken');
const fs = require('fs');
const axios = require('axios');

const getJWTAuthToken = () => {
  const cert = fs.readFileSync('private.pem', 'utf8');

  const payload = {
    exp: Math.floor(Date.now() / 1000) + (60 * 10),
    iat: Math.floor(Date.now() / 1000),
    iss: 25419
  }

  return jwt.sign(payload, cert, { algorithm: 'RS256' });
}

const getInstallationAccessToken = (installation_id = 676080) => {
  const jwt = getJWTAuthToken();
  return axios.post(`https://api.github.com/app/installations/${installation_id}/access_tokens`, {}, {
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "Accept": "application/vnd.github.machine-man-preview+json"
    }
  })
    .then(({ data }) => data.token)
    .catch(err => console.log(err));
}

module.exports = getInstallationAccessToken