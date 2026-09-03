import React, { createContext, useContext, useState, useCallback } from 'react';
import { mockCodeProjects, mockSnapshots } from '../api/mockData';

const CodeProjectsContext = createContext(null);

export function CodeProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => [...mockCodeProjects]);
  const [snapshots, setSnapshots] = useState(() => ({ ...mockSnapshots }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addProject = useCallback(async (projectData) => {
    try {
      const newProjectId = `proj-${Date.now()}`;
      const newProject = {
        id: newProjectId,
        name: projectData.name,
        path: projectData.path || `~/projects/${projectData.name.toLowerCase().replace(/\s+/g, '-')}`,
        watchStatus: 'watching',
        interval: Number(projectData.interval) || 15,
        accountId: projectData.accountId,
        provider: projectData.provider,
        accountEmail: projectData.accountEmail,
        snapshotCount: 1,
        lastSnapshot: 'Just now',
        lastCommitMessage: 'feat: initialize shadow repo tracking',
        lastCommitTime: 'Just now',
        branch: 'main',
      };

      const initialSnapshot = {
        id: `snap-${Date.now()}`,
        projectId: newProjectId,
        hash: Math.random().toString(16).substring(2, 9),
        summary: 'Project initialized in shadow repository',
        details: 'Initial snapshot created and mirrored to cloud backup',
        timestamp: 'Just now',
        filesCount: 8,
        mirroredToCloud: true,
        size: '11.5 KB',
      };

      setProjects((prev) => [newProject, ...prev]);
      setSnapshots((prev) => ({
        ...prev,
        [newProjectId]: [initialSnapshot],
      }));

      return newProject;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const pushToGitHub = useCallback(async (id, commitMessage) => {
    try {
      const targetProj = projects.find((p) => p.id === id);
      const message = commitMessage || `chore: consolidate ${targetProj?.snapshotCount || 0} shadow snapshots into clean commit`;

      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                lastCommitMessage: message,
                lastCommitTime: 'Just now',
              }
            : p
        )
      );

      return { success: true, id, commitMessage: message };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [projects]);

  const toggleWatch = useCallback((id) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              watchStatus: p.watchStatus === 'watching' ? 'paused' : 'watching',
            }
          : p
      )
    );
  }, []);

  const removeProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setSnapshots((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const getSnapshots = useCallback(
    (projectId) => {
      return snapshots[projectId] || [];
    },
    [snapshots]
  );

  return (
    <CodeProjectsContext.Provider
      value={{
        projects,
        snapshots,
        loading,
        error,
        addProject,
        removeProject,
        pushToGitHub,
        toggleWatch,
        getSnapshots,
        refetch: async () => {},
      }}
    >
      {children}
    </CodeProjectsContext.Provider>
  );
}

export function useCodeProjectsContext() {
  const context = useContext(CodeProjectsContext);
  if (!context) {
    throw new Error('useCodeProjectsContext must be used within a CodeProjectsProvider');
  }
  return context;
}
