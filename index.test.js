const syncGist = require('./syncGist');
const process = require('process');
const { readFile } = require('fs/promises');

const gistPat = process.env['GIST_PAT'];
const gistId = process.env['GIST_ID'];
const filename = process.env['FILENAME'];

test('download from gist', async () => {
  await expect(
    syncGist(gistPat, gistId, 'download', filename)
  ).resolves.not.toThrow();
  await expect(readFile(filename, 'utf8')).resolves.not.toThrow();
});

test('upload to gist', async () => {
  syncGist(gistPat, gistId, 'download', filename);
  await expect(
    syncGist(gistPat, gistId, 'upload', filename)
  ).resolves.not.toThrow();
});
