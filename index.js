const core = require('@actions/core');
const syncGist = require('./syncGist');

async function run() {
  try {
    const gistPat = core.getInput('gistPat');
    const gistId = core.getInput('gistId');
    const action = core.getInput('action');
    const filename = core.getInput('filename');

    if (action === 'download') {
      return syncGist(gistPat, gistId, 'download', filename);
    } else if (action === 'upload') {
      return syncGist(gistPat, gistId, 'upload', filename);
    } else {
      throw new Error(`Action ${action} is not supported`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
