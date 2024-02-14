import { info } from '@actions/core';
import { IRestResponse, RestClient } from 'typed-rest-client';
import { ArgoApplication } from './application';
import { IArgoCDApplication } from './interfaces/argocd-application';
import { ICreateApplication } from './interfaces/create-application';

interface ArgoCDApiArgs {
  /**
   * Access Token for API
   */
  accessToken?: string;
  /**
   * ArgoCD base url
   */
  baseUrl: string;
  /**
   * Client ID for API
   */
  clientId?: string;
  /**
   * Client Secret for API
   */
  clientSecret?: string;
}

export class ArgoCDApi {
  private readonly _client: RestClient;
  private _token?: string;

  constructor(
    private readonly _args: ArgoCDApiArgs,
    private readonly dryRun = false,
  ) {
    this._client = new RestClient(
      'gha-argocd-deploy/v1',
      `${_args.baseUrl}/api/v1`,
      [],
      { headers: {} },
    );
    if (_args.accessToken !== '') {
      this._token = _args.accessToken;
    }
  }

  /**
   * Creates an argo application in kubernetes
   */
  async createApplication(
    releaseName: string,
    args: ICreateApplication,
  ): Promise<ArgoApplication> {
    const app = new ArgoApplication(releaseName, args);

    if (this.dryRun) return app;

    // does the application exist?
    const appExists = await (
      await this._getClient()
    ).get(`applications/${releaseName}?project=${args.project}`);

    let res: IRestResponse<unknown>;

    info(`Tokenizing with: ${JSON.stringify(args.tokens, null, 2)}`);

    if (appExists.statusCode === 200) {
      info(`Updating application: ${releaseName}`);
      res = await (
        await this._getClient()
      ).replace(`applications/${releaseName}`, app.toManifest());
    } else {
      info(`Creating application: ${releaseName}`);
      res = await (
        await this._getClient()
      ).create(`applications`, app.toManifest());
    }

    if (res.statusCode === 200) {
      return app;
    }

    throw new Error(JSON.stringify(res));
  }

  /**
   * Removes an argo application from kubernetes
   */
  async destroyApplication(releaseName: string): Promise<void> {
    if (this.dryRun) return;

    const appRes = await (
      await this._getClient()
    ).get<IArgoCDApplication>(`applications/${releaseName}`);

    // if the deployment can't be found, return successfully since it's technically removed
    if (appRes.statusCode === 404) {
      return;
    }

    // now remove the application
    const deleteRes = await (
      await this._getClient()
    ).del(`applications/${releaseName}`);

    if (deleteRes.statusCode === 200) {
      return;
    }

    throw new Error(JSON.stringify(deleteRes));
  }

  get baseUrl(): string {
    return this._args.baseUrl;
  }

  private async _getToken(): Promise<string> {
    if (!this._token) {
      const res = await this._client.create<{ token: string }>('session', {
        username: this._args.clientId,
        password: this._args.clientSecret,
      });

      if (res.statusCode === 200 && res.result) {
        this._token = res.result.token;
        return this._token;
      }

      throw new Error(JSON.stringify(res));
    }

    return this._token;
  }

  private async _getClient(): Promise<RestClient> {
    const token = await this._getToken();

    if (this._client.client.requestOptions?.headers) {
      this._client.client.requestOptions.headers.Authorization = `Bearer ${token}`;
    }

    return this._client;
  }
}
