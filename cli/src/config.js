import Conf from 'conf';
import path from 'path';
import os from 'os';

const config = new Conf({
  projectName: 'dockmore',
  cwd: path.join(os.homedir(), '.dockmore'),
  schema: {
    authToken: { type: 'string', default: '' },
    activeAccountId: { type: 'string', default: '' },
    projects: { type: 'object', default: {} },
  },
});

export const API_BASE = process.env.DOCKMORE_API_URL || 'http://localhost:5000';

export function getToken() {
  const token = config.get('authToken');
  if (!token) return null;
  return token;
}

export function setToken(token) {
  config.set('authToken', token);
}

export function clearToken() {
  config.delete('authToken');
}

export function getActiveAccountId() {
  return config.get('activeAccountId') || null;
}

export function setActiveAccountId(id) {
  config.set('activeAccountId', id);
}

export function getProject(projectPath) {
  const projects = config.get('projects') || {};
  return projects[projectPath] || null;
}

export function setProject(projectPath, data) {
  const projects = config.get('projects') || {};
  projects[projectPath] = { ...projects[projectPath], ...data };
  config.set('projects', projects);
}

export function removeProject(projectPath) {
  const projects = config.get('projects') || {};
  delete projects[projectPath];
  config.set('projects', projects);
}

export function getAllProjects() {
  return config.get('projects') || {};
}

export default config;
