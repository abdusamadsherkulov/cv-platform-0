import { useState, useEffect } from 'react';
import { apiFetch, getCurrentRole } from '../api';
import { useTranslation } from 'react-i18next';
import { Alert, PageHeader } from '../components/ui';
import ProjectItem from '../components/ProjectItem';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const role = getCurrentRole();
  const isAdmin = role === 'admin';

  async function loadProjects() {
    try {
      const data = await apiFetch('/projects/all');
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleDelete(id) {
    setError('');
    try {
      await apiFetch(`/projects/${id}/admin`, { method: 'DELETE' });
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <PageHeader title={t('projects.title')} />
      <Alert>{error}</Alert>

      <ul className="list">
        {projects.map((proj) => (
          <ProjectItem
            key={proj.id}
            project={proj}
            canEdit={isAdmin}
            useAdminUrl
            showCandidate
            onDelete={handleDelete}
            onSaved={loadProjects}
          />
        ))}
      </ul>
    </div>
  );
}

export default Projects;
