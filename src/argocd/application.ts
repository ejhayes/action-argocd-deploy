import { dump, load } from 'js-yaml';
import { IArgoCDApplication } from './interfaces/argocd-application';
import { ICreateApplication } from './interfaces/create-application';

export class ArgoApplication {
  constructor(
    private readonly releaseName: string,
    private readonly args: ICreateApplication,
  ) {}

  toManifest(replaceTokens = true): IArgoCDApplication {
    return {
      metadata: {
        name: this.releaseName,
        annotations: this.args.annotations,
        labels: this.args.labels,
      },
      spec: {
        destination: {
          namespace: this.args.namespace,
          name: this.args.clusterName,
        },
        source: {
          path: this.args.path || '',
          repoURL: this.args.gitRepo,
          targetRevision: this.args.gitRef,
          helm: {
            values: dump(
              load(
                replaceTokens
                  ? this.replaceTokens(
                      this.args.helmValues.toString(),
                      this.args.tokens,
                    )
                  : this.args.helmValues.toString(),
              ),
              { noCompatMode: true },
            ),
          },
        },
        project: this.args.project,
        syncPolicy: {
          automated: {
            prune: !!this.args.prune,
            selfHeal: !!this.args.selfHeal,
          },
        },
        info: Object.entries(this.args.info).map((val) => ({
          name: val[0],
          value: val[1],
        })),
      },
    };
  }

  private replaceTokens(
    str: string,
    tokens?: { [key: string]: string },
    tokenPrefix = '__',
    tokenSuffix = '__',
  ): string {
    if (!tokens) {
      return str;
    }
    const missingTokens = new Set();

    const re = new RegExp(`${tokenPrefix}\\s*(\\w+)\\s*${tokenSuffix}`, 'g');
    const ret = str.replace(re, (matched, key) => {
      if (tokens.hasOwnProperty(key)) {
        return tokens[key];
      }

      missingTokens.add(key);
    });

    if (missingTokens.size > 0) {
      throw new Error(
        `Missing token values for: ${Array.from(missingTokens).join(', ')}`,
      );
    }

    return ret;
  }
}
