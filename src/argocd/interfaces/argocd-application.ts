export interface IArgoCDApplication {
  metadata: {
    annotations?: { [key: string]: string };
    labels?: { [key: string]: string };
    name: string;
  };
  spec?: {
    destination: {
      name?: string;
      namespace: string;
      server?: string;
    };
    info?: { name: string; value: string }[];
    project: string;
    source: {
      helm: {
        values: string;
      };
      path: string;
      repoURL: string;
      targetRevision: string;
    };
    syncPolicy: {
      automated: {
        prune: boolean;
        selfHeal: boolean;
      };
    };
  };
}
