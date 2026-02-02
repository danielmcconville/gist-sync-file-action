# Gist Sync File Action

<p align="center">
  <a href="https://github.com/danielmcconville/gist-sync-file-action/actions"><img alt="javscript-action status" src="https://github.com/danielmcconville/gist-sync-file-action/workflows/units-test/badge.svg"></a>
</p>

This action provides the following GitHub Gist functionality

- Create a new Gist from a file
- Delete an existing Gist
- Update an existing Gist from a file
- Download an existing Gist into a file

## Usage

See [action.yml](action.yml)

<!-- start usage -->
```yaml
- uses: danielmcconville/gist-sync-file-action@v2.0.0
  with:
    # Personal access token with read/write access for Gist
    gistPat: ''

    # id of the gist - only required for delete, update and download
    gistId:

    # Action to perform, either "create", "delete", "update" or "download"
    action: ''

    # name of the file containing the content to upload or download, can be a file path such as dir/subdir/file.md
    filename: ''

    # optional, set to true if you are using the download action and you want a gist created if it doesn't
    # already exist.
    createIfNotExists: false

    # optional, but required if createIfNotExists is true. Defines the content of the file to create if the gist does not exist
    # when downloading. Defaults to '{}'
    fileContent: '{}'
```
<!-- end usage -->

```YAML
steps:
- uses: actions/checkout@v4
- run: echo '{}' > $fileName
- name: Create Gist
  uses: danielmcconville/gist-sync-file-action@v2.0.0
  id: create
  with:
    gistPat: ${{ secrets.GIST_PAT }}
    action: create
    filename: ${{ env.fileName }}
- name: Download Gist
  uses: danielmcconville/gist-sync-file-action@v2.0.0
  with:
    gistPat: ${{ secrets.GIST_PAT }}
    gistId: ${{ steps.create.outputs.gistId }}
    action: download
    filename: ${{ env.fileName }}
    fileContent: '{}'
- run: echo '{a:b}' > $fileName
- name: Update Gist
  uses: danielmcconville/gist-sync-file-action@v2.0.0
  with:
    gistPat: ${{ secrets.GIST_PAT }}
    gistId: ${{ steps.create.outputs.gistId }}
    action: update
    filename: ${{ env.fileName }}
- name: Delete Gist
  uses: danielmcconville/gist-sync-file-action@v2.0.0
  with:
    gistPat: ${{ secrets.GIST_PAT }}
    gistId: ${{ steps.create.outputs.gistId }}
    action: delete
    filename: ${{ env.fileName }}
```

You need to provide a Git personal access token (PAT) with GIST read/write permissions to the actions `gistPat` input. See [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) for instructions on creating one of these.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

## Contributions

Install the dependencies

```bash
npm install
```

Run the tests :heavy_check_mark:

```bash
$ npm test

 PASS  src/syncGist.test.js (7.401 s)
  ✓ create and delete gist (1434 ms)
  ✓ download from gist with createIfNotExists set to true, then delete (1851 ms)
  ✓ create and download from gist, then delete (1857 ms)
  ✓ create then update to gist, then delete (2075 ms)
...
```

Note you will have to set a environment variable called GIST_PAT to a PAT that can access your GISTS (read/write)/

### Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm ci
```

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add .
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Commit to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
