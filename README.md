# action-argocd-deploy

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

<!-- action-docs-description -->

## Description

This action calls the ArgoCD API to create/update an application

<!-- action-docs-description -->

## Quickstart

To use this in your projects:

### minimal example

Using [access token](https://argo-cd.readthedocs.io/en/latest/user-guide/commands/argocd_account_generate-token/):

```yaml
- uses: ejhayes/action-argocd-deploy@releases/v1
  with:
    accessToken: MY_ACCESS_TOKEN
    baseUrl: http://argocd-api.example.com
    name: 'my-service'
    namespace: theNamespace
    project: myproject
    tokens: |
      SOME_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      MY_TOKEN: someValue
    valuesFile: ./values.yaml
    info: |
      environment: prod
```

Using username/password (or clientid/secret):

```yaml
- uses: ejhayes/action-argocd-deploy@releases/v1
  with:
    clientId: MY_USERNAME
    clientSecret: MY_PASSWORD
    baseUrl: http://argocd-api.example.com
    name: 'my-service'
    namespace: theNamespace
    project: myproject
    tokens: |
      SOME_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      MY_TOKEN: someValue
    valuesFile: ./values.yaml
    info: |
      environment: prod
```

**NOTE:** `valuesFile` will be interpolated using environment variables you specify. The example above would replace `__MY_TOKEN__` with `someValue`.

### fuller example

```yaml
on:
  - deployment
  - delete

jobs:
  tester:
    runs-on: ubuntu-latest
    steps:
      - uses: ejhayes/action-argocd-deploy@releases/v1
        with:
          clientId: ${{ secrets.ARGOCD_CLIENTID }}
          clientSecret: ${{ secrets.ARGOCD_CLIENTSECRET }}
          clusterName: 'default'
          baseUrl: https://example.com
          name: my-service
          namespace: default
          path: fixtures
          project: default
          valuesFile: fixtures/values.yml
          tokens: |
            MYSECRET: somestring-${{ secrets.GITHUB_TOKEN }}
            OTHERTOKEN: theOtherValue
          annotations: |
            myannotation: "true"
          labels: |
            group: group-a
            env: prod
          info: |
            rev: ${{ github.ref }}
            sha: ${{ github.sha }}
```

Example `fixtures/values.yml` would contain:

```yaml
service:
  someParam:
    repository: ealen/echo-server:__OTHERTOKEN__
    someSecret: __MYSECRET__
```

<!-- action-docs-inputs -->

## Inputs

| parameter    | description                                           | required | default                  |
| ------------ | ----------------------------------------------------- | -------- | ------------------------ |
| action       | Action to perform (upsert, delete)                    | `true`   | upsert                   |
| annotations  | Key/Value pair of annotations for the application     | `false`  | {}                       |
| clientId     | ArgoCD Client Id / Username                           | `false`  |                          |
| clientSecret | ArgoCD Client Secret / Password                       | `false`  |                          |
| clusterName  | Cluster name to deploy to                             | `true`   |                          |
| baseUrl      | ArgoCD base url to use                                | `true`   |                          |
| gitRef       | Revision to deploy to ArgoCD                          | `false`  | ${{ github.ref }}        |
| gitRepo      | GitHub repository to use                              | `false`  | ${{ github.repository }} |
| info         | Key/Value pair of argo info values                    | `false`  | {}                       |
| labels       | Key/Value pair of labels to apply to argo application | `false`  | {}                       |
| name         | Name of the application to create                     | `true`   |                          |
| namespace    | Namespace to deploy application to                    | `true`   |                          |
| path         | Path to helm chart                                    | `false`  |                          |
| project      | Argo project to create application in                 | `true`   |                          |
| tokens       | Key/Value list of tokens to replace in helm chart     | `false`  | {}                       |
| valuesFile   | Values file to pass to ArgoCD                         | `true`   |                          |

<!-- action-docs-inputs -->

<!-- action-docs-outputs -->

<!-- action-docs-outputs -->

<!-- action-docs-runs -->

## Runs

This action is a `node16` action.

<!-- action-docs-runs -->

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
