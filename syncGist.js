const { Octokit } = require('@octokit/core');
const { readFile, writeFile } = require('fs/promises');

const syncGist = async (auth, gistId, action, filename) => {
  const octokit = new Octokit({
    auth,
  });

  if (action === 'download') {
    try {
      const { data } = await octokit.request('GET /gists/{gist_id}', {
        gist_id: gistId,
      });
      const file = Object.values(data.files)[0];
      if (!file.content) throw 'File content not found';
      await writeFile(filename, file.content);
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else if (action === 'upload') {
    try {
      const data = await readFile(filename, 'utf8');
      await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: gistId,
        files: {
          filename: {
            content: data,
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    throw new Error(`Action ${action} is not supported`);
  }
};

module.exports = syncGist;
