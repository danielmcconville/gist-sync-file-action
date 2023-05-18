const core = require('@actions/core');
const syncGist = require('./syncGist');

async function run() {
  try {
    const gistPat = core.getInput('gistPat');
    const gistId = core.getInput('gistId');
    const action = core.getInput('action');
    const filename = core.getInput('filename');

    if (action === 'create') {
      const { id } = await syncGist(gistPat, '', 'create', filename);
      core.setOutput('gistId', id);
    } else if (action === 'delete') {
      return syncGist(gistPat, gistId, 'delete', filename);
    } else if (action === 'download') {
      const fileContent = await syncGist(gistPat, gistId, 'download', filename);
      core.setOutput('fileContent', fileContent);
    } else if (action === 'update') {
      const fileContent = await syncGist(gistPat, gistId, 'update', filename);
      core.setOutput('fileContent', fileContent);
    } else {
      throw new Error(`Action ${action} is not supported`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
