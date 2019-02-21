'use strict';

const axios = require('axios');
const getInstallationAccessToken = require('./accesstoken');

let body;
const org = 'cool-stuff-enterprises';

module.exports.main = async (event, context, callback) => {
  // TODO: Authenticate request is from github
  body = JSON.parse(event.body);

  const eventType = event.headers['X-GitHub-Event'];

  handleEvent(eventType);

  // Say thank you
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Serverless Framework. Billy Bot. ',
      input: event,
    }),
  });
};

const handleEvent = async (type) => {
  const events = {
    'default': () => {
      console.log("No response available for event:", type);
    },
    'repository': () => {
      console.log(body);
      if (body.action == 'created') {
        repoCreated(body);
      }
    }
  }

  console.log("Getting response for:", type);
  return (events[type] || events['default'])();
}

const repoCreated = async (body) => {
  const token = await getInstallationAccessToken(body.installation.id);
  axios({
    method: 'put',
    url: `https://api.github.com/repos/${body.repository.full_name}/contents/index.js`,
    data: {
      "message": 'Cloned Node-Js-Basic template',
      "content": Buffer.from(`
      'use strict'
      console.log('hello world');
      `).toString('base64'),
    },
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.machine-man-preview+json"
    }
  })
    .catch(error => console.log(error))
}

const createComment = async (comment) => {
  console.log("Creating comment");
  const token = await getInstallationAccessToken(body.installation.id);

  axios({
    method: 'post',
    url: getCommentUrl(),
    data: { body: comment },
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.machine-man-preview+json"
    }
  })
    .catch(error => console.log(error))
}

const isSlashCommand = comment => {
  return comment[0] === '/';
}

const getStatusUrl = (token) => {
  if ('pull_request' in body) {
    return body.pull_request.statuses_url;
  }

  if ('issue' in body) {
    return axios({
      method: 'get',
      url: body.issue.pull_request.url,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.machine-man-preview+json"
      }
    })
      .then(({ data }) => data.statuses_url)
      .catch(console.log)
  }
}

const getRepoUrl = (token) => {
  if ('repository' in body) {
    return body.repository.url
  }
}

const getCommentUrl = (token) => {
  if ('pull_request' in body) {
    return body.pull_request.comments_url
  }
  if ('issue' in body) {
    return body.issue.comments_url
  }
}

const getFileContents = async (file) => {
  const token = await getInstallationAccessToken(body.installation.id);
  return axios({
    method: 'get',
    url: `${getRepoUrl()}/contents/${file}`,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.machine-man-preview+json"
    }
  })
    .then(({ data }) => Buffer.from(data.content, 'base64'))
    .catch(console.log)
}

const setPullState = async (state) => {
  const token = await getInstallationAccessToken(body.installation.id);
  const states = {
    'pending': { state: 'pending', description: 'Pending Approval' },
    'success': { state: 'success', description: 'Approved' },
  }
  axios({
    method: 'post',
    url: await getStatusUrl(token),
    data: Object.assign({ "context": "Lilly Bot - Approval" }, states[state]),
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.machine-man-preview+json"
    }
  })
    .catch(console.log)
}