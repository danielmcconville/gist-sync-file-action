const syncGist = require('./syncGist');
const process = require('process');
const { readFile, unlink, writeFile } = require('fs/promises');

const gistPat = process.env['GIST_PAT'];
const filename = 'test.json';

const defaultFileData = '{}';
const modifiedFileData = '{"a":"b"}';

afterAll(() => unlink(filename));

test('create and delete gist', async () => {
  await writeFile(filename, defaultFileData);
  const { id } = await syncGist(gistPat, '', 'create', filename);
  expect(id).toBeDefined();
  await expect(
    syncGist(gistPat, id, 'delete', filename)
  ).resolves.not.toThrow();
});

test('download from gist with createIfNotExists set to true, then delete', async () => {
  const nonExistantGistId = '2926c7dba91544a59d830fe046b1c4e2';
  await writeFile(filename, defaultFileData);
  const { content, id } = await syncGist(
    gistPat,
    nonExistantGistId,
    'download',
    filename,
    true
  );
  await expect(content).toEqual(defaultFileData);
  await expect(id).toBeDefined();
  await expect(id).not.toEqual(nonExistantGistId);
  unlink(filename);
  await expect(
    syncGist(gistPat, id, 'delete', filename)
  ).resolves.not.toThrow();
});

test('create and download from gist, then delete', async () => {
  await writeFile(filename, defaultFileData);
  const { id } = await syncGist(gistPat, '', 'create', filename);
  expect(id).toBeDefined();
  unlink(filename);
  const { content } = await syncGist(gistPat, id, 'download', filename);
  await expect(readFile(filename, 'utf8')).resolves.toEqual(defaultFileData);
  await expect(content).toEqual(defaultFileData);
  await expect(
    syncGist(gistPat, id, 'delete', filename)
  ).resolves.not.toThrow();
});

test('create then update to gist, then delete', async () => {
  await writeFile(filename, defaultFileData);
  const { id } = await syncGist(gistPat, '', 'create', filename);
  expect(id).toBeDefined();
  await writeFile(filename, modifiedFileData);
  const content = await syncGist(gistPat, id, 'update', filename);
  expect(content).toEqual(modifiedFileData);
  await expect(
    syncGist(gistPat, id, 'delete', filename)
  ).resolves.not.toThrow();
});
