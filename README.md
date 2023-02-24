# action-argocd-deploy

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
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

| parameter | description | required | default |
| - | - | - | - |
| accessToken | ArgoCD access token | `false` |  |
| action | Action to perform (upsert, delete) | `false` | upsert |
| annotations | Key/Value pair of annotations for the application | `false` | {} |
| baseUrl | ArgoCD base url to use | `true` |  |
| clientId | ArgoCD Client Id / Username | `true` |  |
| clientSecret | ArgoCD Client Secret / Password | `true` |  |
| clusterName | Cluster name to deploy to | `true` |  |
| dryRun | Dry run mode (do not create or delete anything) | `false` | false |
| info | Key/Value pair of argo info values | `false` | {} |
| labels | Key/Value pair of labels to apply to argo application | `false` | {} |
| name | Name of the application to create | `true` |  |
| namespace | Namespace to deploy application to | `true` |  |
| path | Path to helm chart | `false` |  |
| project | Argo project to create application in | `true` |  |
| tokens | Key/Value list of tokens to replace in helm chart | `false` | {} |
| valuesFile | Values file to pass to ArgoCD | `true` |  |



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
<table>
  <tr>
    <td align="center"><a href="https://github.com/ejhayes"><img src="https://avatars.githubusercontent.com/u/310233?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eric Hayes</b></sub></a><br /><a href="https://github.com/ejhayes/action-argocd-deploy/commits?author=ejhayes" title="Documentation">📖</a> <a href="#infra-ejhayes" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/ejhayes/action-argocd-deploy/commits?author=ejhayes" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/rfun"><img src="https://avatars.githubusercontent.com/u/2608543?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rohit Khattar</b></sub></a><br /><a href="https://github.com/ejhayes/action-argocd-deploy/commits?author=rfun" title="Documentation">📖</a> <a href="#infra-rfun" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/ejhayes/action-argocd-deploy/commits?author=rfun" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
