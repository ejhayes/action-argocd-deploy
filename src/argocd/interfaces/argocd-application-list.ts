import { IArgoCDApplication } from './argocd-application';

export interface IArgoCDApplicationList {
  items?: IArgoCDApplication[] | null;
  metadata: {
    resourceVersion: string;
  };
}
