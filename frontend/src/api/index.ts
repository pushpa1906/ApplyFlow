import { createApplication, deleteApplication, updateApplication } from "./applications";
import { getWorkspaceConfig, loadWorkspace, validateWorkspace } from "./workspace";

export const api = {
  config: getWorkspaceConfig,
  validate: validateWorkspace,
  list: loadWorkspace,
  create: createApplication,
  update: updateApplication,
  remove: deleteApplication,
};
