export interface ICreateApplication {
  /**
   * Annotations
   */
  annotations?: { [key: string]: string };
  /**
   * Kubernetes cluster name to deploy this application to
   */
  clusterName: string;
  /**
   * Git revision to point at (branch, commit, tag, etc)
   */
  gitRef: string;
  /**
   * Git repository containing code
   */
  gitRepo: string;
  /**
   * Path to helm values file (this file should be tokenized)
   */
  helmValues: Buffer;
  /**
   * Additional information about the application
   */
  info?: { [key: string]: string };
  /**
   * Additional labels to attach to the application
   */
  labels?: { [key: string]: string };
  /**
   * Namespace of the cluster to deploy the app in
   */
  namespace: string;
  /**
   * Path containing helm values
   */
  path?: string;
  /**
   * ArgoCD Project to deploy the app in
   */
  project: string;
  /**
   * Automatically prune resources no longer needed (defaults to false)
   */
  prune?: boolean;
  /**
   * Automatically heal (defaults to false)
   */
  selfHeal?: boolean;
  /**
   * Token Mappings to replace in helm file
   */
  tokens?: { [key: string]: string };
}
