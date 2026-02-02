const syncGist = require('./syncGist');

jest.mock('@octokit/core', () => {
  const mockRequest = jest.fn();
  return {
    Octokit: jest.fn(() => ({ request: mockRequest })),
    __mockRequest: mockRequest,
  };
});

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

const { __mockRequest: mockRequest } = require('@octokit/core');
const { readFile, writeFile } = require('fs/promises');

const token = 'fake-token';
const defaultFileData = '{}';
const modifiedFileData = '{"a":"b"}';

beforeEach(() => {
  jest.clearAllMocks();
  readFile.mockResolvedValue(defaultFileData);
  writeFile.mockResolvedValue(undefined);
});

test('create gist', async () => {
  mockRequest.mockResolvedValue({
    data: { id: 'gist-123', files: { 'test.json': { content: defaultFileData } } },
  });

  const result = await syncGist(token, '', 'create', 'test.json');

  expect(result.id).toBe('gist-123');
  expect(readFile).toHaveBeenCalledWith('test.json', 'utf8');
  expect(mockRequest).toHaveBeenCalledWith('POST /gists', {
    files: { 'test.json': { content: defaultFileData } },
  });
});

test('create gist from nested file uses basename as gist key', async () => {
  mockRequest.mockResolvedValue({
    data: { id: 'gist-456', files: { 'test.json': { content: defaultFileData } } },
  });

  const result = await syncGist(token, '', 'create', 'test_folder/test.json');

  expect(result.id).toBe('gist-456');
  expect(readFile).toHaveBeenCalledWith('test_folder/test.json', 'utf8');
  expect(mockRequest).toHaveBeenCalledWith('POST /gists', {
    files: { 'test.json': { content: defaultFileData } },
  });
});

test('delete gist', async () => {
  mockRequest.mockResolvedValue({});

  await expect(
    syncGist(token, 'gist-123', 'delete', 'test.json')
  ).resolves.not.toThrow();

  expect(mockRequest).toHaveBeenCalledWith('DELETE /gists/{gist_id}', {
    gist_id: 'gist-123',
  });
});

test('download gist writes file content', async () => {
  mockRequest.mockResolvedValue({
    data: {
      files: { 'test.json': { content: defaultFileData } },
    },
  });

  const result = await syncGist(token, 'gist-123', 'download', 'test.json');

  expect(result).toEqual({ content: defaultFileData, id: 'gist-123' });
  expect(writeFile).toHaveBeenCalledWith('test.json', defaultFileData);
  expect(mockRequest).toHaveBeenCalledWith('GET /gists/{gist_id}', {
    gist_id: 'gist-123',
  });
});

test('download with createIfNotExists creates gist when not found', async () => {
  const notFoundError = new Error('Not Found');
  notFoundError.status = 404;

  mockRequest
    .mockRejectedValueOnce(notFoundError)
    .mockResolvedValueOnce({
      data: { id: 'new-gist', files: { 'test.json': { content: defaultFileData } } },
    });

  const result = await syncGist(
    token,
    'nonexistent-id',
    'download',
    'test.json',
    true,
    '{}'
  );

  expect(result.content).toEqual(defaultFileData);
  expect(result.id).toBe('new-gist');
  expect(result.id).not.toBe('nonexistent-id');
  expect(writeFile).toHaveBeenCalledWith('test.json', '{}');
  expect(mockRequest).toHaveBeenCalledWith('POST /gists', {
    files: { 'test.json': { content: defaultFileData } },
  });
});

test('update gist', async () => {
  mockRequest.mockResolvedValue({
    data: {
      files: { 'test.json': { content: modifiedFileData } },
    },
  });
  readFile.mockResolvedValue(modifiedFileData);

  const content = await syncGist(token, 'gist-123', 'update', 'test.json');

  expect(content).toEqual(modifiedFileData);
  expect(readFile).toHaveBeenCalledWith('test.json', 'utf8');
  expect(mockRequest).toHaveBeenCalledWith('PATCH /gists/{gist_id}', {
    gist_id: 'gist-123',
    files: { 'test.json': { content: modifiedFileData } },
  });
});

test('update gist with nested file uses basename as gist key', async () => {
  mockRequest.mockResolvedValue({
    data: {
      files: { 'test.json': { content: modifiedFileData } },
    },
  });
  readFile.mockResolvedValue(modifiedFileData);

  const content = await syncGist(token, 'gist-123', 'update', 'test_folder/test.json');

  expect(content).toEqual(modifiedFileData);
  expect(readFile).toHaveBeenCalledWith('test_folder/test.json', 'utf8');
  expect(mockRequest).toHaveBeenCalledWith('PATCH /gists/{gist_id}', {
    gist_id: 'gist-123',
    files: { 'test.json': { content: modifiedFileData } },
  });
});

test('unsupported action throws', async () => {
  await expect(
    syncGist(token, '', 'invalid', 'test.json')
  ).rejects.toThrow('Action invalid is not supported');
});
