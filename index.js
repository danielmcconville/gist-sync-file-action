const core = require('@actions/core');
const syncGist = require('./src/syncGist');

async function run() {
  try {
    const gistPat = core.getInput('gistPat');
    const gistId = core.getInput('gistId');
    const action = core.getInput('action');
    const filename = core.getInput('filename');
    const createIfNotExists = core.getInput('createIfNotExists') || false;
    const fileContent = core.getInput('fileContent') || '';

    if (action === 'create') {
      const { id } = await syncGist(gistPat, '', 'create', filename);
      core.setOutput('gistId', id);
    } else if (action === 'delete') {
      return syncGist(gistPat, gistId, 'delete', filename);
    } else if (action === 'download') {
      const { content, id } = await syncGist(
        gistPat,
        gistId,
        'download',
        filename,
        createIfNotExists,
        fileContent
      );
      core.setOutput('fileContent', content);
      core.setOutput('gistId', id);
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
