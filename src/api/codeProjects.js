import { mockCodeProjects, mockSnapshots } from './mockData';

let projectsStore = [...mockCodeProjects];
let snapshotsStore = { ...mockSnapshots };

export async function getCodeProjects() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...projectsStore]);
    }, 50);
  });
}

export async function getProjectById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const proj = projectsStore.find((p) => p.id === id);
      if (proj) {
        resolve({ ...proj });
      } else {
        reject(new Error(`Project with id ${id} not found`));
      }
    }, 50);
  });
}

export async function createCodeProject(projectData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProject = {
        id: `proj-${Date.now()}`,
        watchStatus: 'watching',
        snapshotCount: 1,
        lastSnapshot: 'Just now',
        lastCommitMessage: 'feat: initial project snapshot tracking',
        lastCommitTime: 'Just now',
        branch: 'main',
        ...projectData,
      };

      projectsStore = [newProject, ...projectsStore];

      // Seed initial snapshot
      snapshotsStore[newProject.id] = [
        {
          id: `snap-${Date.now()}`,
          projectId: newProject.id,
          hash: Math.random().toString(16).substring(2, 9),
          summary: '12 files tracked in shadow repository',
          details: 'Initialized shadow git dir with cloud mirroring pipeline',
          timestamp: 'Just now',
          filesCount: 12,
          mirroredToCloud: true,
          size: '8.4 KB',
        },
      ];

      resolve(newProject);
    }, 100);
  });
}

export async function pushCodeProject(id, commitMessage) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const proj = projectsStore.find((p) => p.id === id);
      if (!proj) {
        reject(new Error(`Project with id ${id} not found`));
        return;
      }

      const msg = commitMessage || `Auto-commit: Consolidated ${proj.snapshotCount} fine-grained shadow snapshots`;
      projectsStore = projectsStore.map((p) =>
        p.id === id
          ? {
              ...p,
              lastCommitMessage: msg,
              lastCommitTime: 'Just now',
            }
          : p
      );

      resolve({
        success: true,
        id,
        commitMessage: msg,
        pushedAt: new Date().toISOString(),
      });
    }, 600);
  });
}

export async function toggleWatchStatus(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const proj = projectsStore.find((p) => p.id === id);
      if (!proj) {
        reject(new Error(`Project with id ${id} not found`));
        return;
      }

      const newStatus = proj.watchStatus === 'watching' ? 'paused' : 'watching';
      projectsStore = projectsStore.map((p) =>
        p.id === id ? { ...p, watchStatus: newStatus } : p
      );

      resolve({ success: true, id, status: newStatus });
    }, 100);
  });
}

export async function getProjectSnapshots(projectId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...(snapshotsStore[projectId] || [])]);
    }, 50);
  });
}
