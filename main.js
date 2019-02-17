import axios from 'axios';

const org = 'cool-stuff-enterprises';

const createRepo = async (event, context) => {
  body = JSON.parse(event.body);
  const token = await getInstallationAccessToken(body.installation.id);

  axios({
    method: 'post',
    url: `https://api.github.com/orgs/${org}/repos`,
    data: {
      "name": "Hello-World",
      "description": "This is your first repository",
      "homepage": "https://github.com",
      "private": false,
      "has_issues": true,
      "has_projects": true,
      "has_wiki": true
    },
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.machine-man-preview+json"
    }
  })
    .catch(error => console.log(error))

    return success();
}

const success = (message = 'Billy Bot says thanks.') => {
  return {
    message: message,
  }
}

module.exports = { createRepo };