import { readFile } from 'fs';
import { promisify } from 'util';
import * as core from '@actions/core';
import { createTwoFilesPatch } from 'diff';
import { dump, load } from 'js-yaml';
import { ArgoCDApi } from './argocd';

enum INPUTS {
  ACCESS_TOKEN = 'accessToken',
  ACTION = 'action',
  ANNOTATIONS = 'annotations',
  BASE_URL = 'baseUrl',
  CLIENT_ID = 'clientId',
  CLIENT_SECRET = 'clientSecret',
  CLUSTER_NAME = 'clusterName',
  DRY_RUN = 'dryRun',
  INFO = 'info',
  LABELS = 'labels',
  NAME = 'name',
  NAMESPACE = 'namespace',
  PATH = 'path',
  PROJECT = 'project',
  TOKENS = 'tokens',
  VALUES_FILE = 'valuesFile',
}
interface KeyVal {
  [key: string]: string;
}

interface ActionArgs {
  /**
   * ArgoCD Access Token
   */
  accessToken: string;
  /**
   * Action type to perform
   */
  action: 'upsert' | 'delete';
  /**
   * Annotations to apply
   */
  annotations: KeyVal;
  /**
   * ArgoCD Base Url
   */
  baseUrl: string;
  /**
   * ArgoCD client id / username
   */
  clientId: string;
  /**
   * ArgoCD client secret / password
   */
  clientSecret: string;
  /**
   * Cluster name to deploy to
   */
  clusterName: string;
  /**
   * Dry run mode
   */
  dryRun: boolean;
  /**
   * Git revision to deploy
   */
  gitRef: string;
  /**
   * Git repo url to deploy (e.g. git://...)
   */
  gitRepoUrl: string;
  /**
   * Git SHA of the deployment
   */
  gitSha: string;
  /**
   * GitHub web url
   */
  gitWebUrl: string;
  /**
   * Info tags to add to argo application
   */
  info: KeyVal;
  /**
   * Labels to add to argo application
   */
  labels: KeyVal;
  /**
   * Name of the release
   */
  name: string;
  /**
   * Namespace to deploy to
   */
  namespace: string;
  /**
   * Path to helm chart in repo
   */
  path: string;
  /**
   * Argo project to deploy to
   */
  project: string;
  /**
   * Tokens to replace in values file
   */
  tokens: { [key: string]: string };
  /**
   * Values file to use
   */
  valuesFile: string;
}

async function run() {
  console.log('Starting action');
  const args = getInputs();

  switch (args.action) {
    case 'delete':
      return await deleteApplication(args);
    case 'upsert':
      return await upsertApplication(args);
    default:
      core.setFailed(`Unsupported action type: ${args.action}`);
      return;
  }
}

async function upsertApplication(args: ActionArgs) {
  const client = getClient(args);

  const app = await client.createApplication(args.name, {
    clusterName: args.clusterName,
    gitRef: args.gitSha,
    gitRepo: args.gitRepoUrl,
    helmValues: await promisify(readFile)(args.valuesFile),
    namespace: args.namespace,
    project: args.project,
    annotations: args.annotations,
    info: args.info,
    labels: args.labels,
    path: args.path,
    prune: true,
    selfHeal: true,
    tokens: args.tokens,
  });

  const webUiUrl = `${args.gitWebUrl}/blob/${args.gitSha}`;

  try {
    await app.toManifest();
  } catch (err) {
    core.error(err);
    throw err;
  }

  const manifestDiff = createTwoFilesPatch(
    `${args.valuesFile}.original`,
    `${args.valuesFile}.tokenized`,
    dump(app.toManifest(false)),
    dump(app.toManifest()),
  );

  core.summary.addRaw(`# ${
    args.dryRun
      ? ':construction: :construction: DRY RUN :construction: :construction:'
      : ''
  } ArgoCD Actions Summary

- **Application:** [${args.name}](${args.baseUrl}/applications/${args.name})
- **Action:** :rocket: CREATED/UPDATED :rocket:

## Generated Manifest
- **Values File:** [${args.valuesFile}](${webUiUrl}/${args.valuesFile})
- **Chart:** [${args.path}](${webUiUrl}/${args.path})

### diff
\`\`\`diff
${manifestDiff}
\`\`\`

### full spec
\`\`\`yaml
${dump(app.toManifest())}
\`\`\`

  `);
  core.summary.write();
}

async function deleteApplication(args: ActionArgs) {
  const client = getClient(args);

  await client.destroyApplication(args.name);

  core.summary.addRaw(`# ${
    args.dryRun
      ? ':construction: :construction: DRY RUN :construction: :construction:'
      : ''
  } ArgoCD Actions Summary 

- **Application:** [${args.name}](${args.baseUrl}/applications/${args.name})
- **Action:** :boom: DELETED :boom:
  `);
  core.summary.write();
}

function getClient(args: ActionArgs) {
  return new ArgoCDApi(
    {
      accessToken: args.accessToken,
      baseUrl: args.baseUrl,
      clientId: args.clientId,
      clientSecret: args.clientSecret,
    },
    args.dryRun,
  );
}

function getInputs(): ActionArgs {
  const inputs = {
    accessToken: core.getInput(INPUTS.ACCESS_TOKEN, { required: false }),
    action: core.getInput(INPUTS.ACTION, { required: true }) as any,
    annotations: (load(
      core.getInput(INPUTS.ANNOTATIONS, { required: false }),
    ) || {}) as KeyVal,
    baseUrl: core.getInput(INPUTS.BASE_URL, { required: true }),
    clientId: core.getInput(INPUTS.CLIENT_ID, { required: false }),
    clientSecret: core.getInput(INPUTS.CLIENT_SECRET, { required: false }),
    clusterName: core.getInput(INPUTS.CLUSTER_NAME, { required: true }),
    dryRun: core.getBooleanInput(INPUTS.DRY_RUN, { required: false }),
    /**
     * Get the ref as follows:
     * 1) User specified
     * 2) If pull request, return the head_ref
     * 3) Extract from GITHUB_REF
     */
    gitRef:
      process.env.GITHUB_HEAD_REF ||
      process.env.GITHUB_REF.replace(/refs\/[^\/]+\/([^\/]+).*/, '$1'),
    gitSha: process.env.GITHUB_SHA,
    gitWebUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`,
    /**
     * TODO: this can be either https or git depending on argocd setup. rather than
     * making an assumption here this should be cleaned up to be configurable
     */
    gitRepoUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`,
    name: core.getInput(INPUTS.NAME, { required: true }),
    namespace: core.getInput(INPUTS.NAMESPACE, { required: true }),
    project: core.getInput(INPUTS.PROJECT, { required: true }),
    valuesFile: core.getInput(INPUTS.VALUES_FILE, { required: true }),
    info: (load(core.getInput(INPUTS.INFO, { required: false })) ||
      {}) as KeyVal,
    labels: (load(core.getInput(INPUTS.LABELS, { required: true })) ||
      {}) as KeyVal,
    path: core.getInput(INPUTS.PATH, { required: true }),
    tokens: (load(core.getInput(INPUTS.TOKENS, { required: true })) ||
      {}) as KeyVal,
  };

  // check for correct access credentials (only one should be specified)
  const accessTokenExists = inputs.accessToken.trim() !== '';
  const clientCredentialsExists =
    inputs.clientId.trim() !== '' && inputs.clientSecret.trim() !== '';

  if (accessTokenExists && clientCredentialsExists) {
    core.setFailed(
      'You must specify access token OR client credentials, not both',
    );
    throw new Error('Invalid credentials');
  }

  if (!accessTokenExists && !clientCredentialsExists) {
    core.setFailed('No access credentials provided');
    throw new Error('No credentials');
  }

  return inputs;
}

run();
