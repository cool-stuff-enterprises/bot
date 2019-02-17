const jwt = require('jsonwebtoken');
const fs = require('fs');


const getJWTAuthToken = async () => {
  const cert = await fs.readFileSync('private.pem');

  console.log(cert);
  
  const payload = {
    exp: Math.floor(Date.now() / 1000) + (60 * 10),
    iat: Math.floor(Date.now() / 1000),
    iss: 25419
  }

  return jwt.sign(payload, cert, { algorithm: 'RS256' });
}

const getInstallationAccessToken = async (installation_id = 676080) => {
  const jwt = await getJWTAuthToken();
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