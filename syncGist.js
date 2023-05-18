const { Octokit } = require('@octokit/core');
const { readFile, writeFile } = require('fs/promises');

const syncGist = async (auth, gistId, action, filename) => {
  const octokit = new Octokit({
    auth,
  });

  if (action === 'create') {
    try {
      const fileData = await readFile(filename, 'utf8');
      const { data } = await octokit.request('POST /gists', {
        files: {
          [filename]: {
            content: fileData,
          },
        },
      });
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else if (action === 'delete') {
    try {
      await octokit.request('DELETE /gists/{gist_id}', {
        gist_id: gistId,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else if (action === 'download') {
    try {
      const { data } = await octokit.request('GET /gists/{gist_id}', {
        gist_id: gistId,
      });
      const file = Object.values(data.files)[0];
      if (!file.content) throw 'File content not found';
      await writeFile(filename, file.content);
      return file.content;
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else if (action === 'update') {
    try {
      const fileData = await readFile(filename, 'utf8');
      const {
        data: { files },
      } = await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: gistId,
        files: {
          [filename]: {
            content: fileData,
          },
        },
      });
      return files[filename].content;
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    throw new Error(`Action ${action} is not supported`);
  }
};

module.exports = syncGist;
