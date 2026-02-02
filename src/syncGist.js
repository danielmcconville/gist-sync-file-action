const { Octokit } = require('@octokit/core');
const { readFile, writeFile } = require('fs/promises');
const path = require('path');

const syncGist = async (
  auth,
  gistId,
  action,
  filename,
  createIfNotExists = false,
  fileContent = '{}'
) => {
  const octokit = new Octokit({
    auth,
  });

  const parsedFileName = path.basename(filename);

  if (action === 'create') {
    try {
      const fileData = await readFile(filename, 'utf8');
      const { data } = await octokit.request('POST /gists', {
        files: {
          [parsedFileName]: {
            content: fileData,
          },
        },
      });
      return data;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  } else if (action === 'delete') {
    try {
      await octokit.request('DELETE /gists/{gist_id}', {
        gist_id: gistId,
      });
    } catch (error) {
      console.error({ error });
      throw error;
    }
  } else if (action === 'download') {
    try {
      const { data } = await octokit.request('GET /gists/{gist_id}', {
        gist_id: gistId,
      });
      const file = data.files[parsedFileName];
      if (!file.content) throw new Error('File content not found');
      await writeFile(filename, file.content);
      console.log(`Downloaded ${filename} from gist ${gistId}`);
      return { content: file.content, id: gistId };
    } catch (error) {
      // if gist doesn't exist and createIfNotExists is set, create it
      if (error.status === 404 && createIfNotExists) {
        console.log('Gist not found, creating...');
        await writeFile(filename, fileContent);
        const { id, files } = await syncGist(auth, '', 'create', filename);
        const content = files[parsedFileName].content;
        return { content, id };
      } else {
        console.error({ error });
        throw error;
      }
    }
  } else if (action === 'update') {
    try {
      const fileData = await readFile(filename, 'utf8');
      const {
        data: { files },
      } = await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: gistId,
        files: {
          [parsedFileName]: {
            content: fileData,
          },
        },
      });
      return files[parsedFileName].content;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  } else {
    throw new Error(`Action ${action} is not supported`);
  }
};

module.exports = syncGist;
