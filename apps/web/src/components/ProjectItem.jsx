import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiFetch, displayName } from '../api';
import { PencilIcon, TrashIcon, Tag, Period } from './ui';

// One project entry. Used on the Profile page and on the recruiter/admin Projects overview.
// useAdminUrl: save through /projects/:id/admin (admins editing someone else's project).
function ProjectItem({ project, canEdit, useAdminUrl, showCandidate, onDelete, onSaved }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [startDate, setStartDate] = useState(project.startDate.slice(0, 10));
  const [endDate, setEndDate] = useState(project.endDate ? project.endDate.slice(0, 10) : '');
  const [tagsInput, setTagsInput] = useState(project.tags.join(', '));
  const [description, setDescription] = useState(project.description);
  const [error, setError] = useState('');

  const url = useAdminUrl ? `/projects/${project.id}/admin` : `/projects/${project.id}`;

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      const tags = tagsInput.split(',').map((x) => x.trim()).filter(Boolean);
      await apiFetch(url, {
        method: 'PUT',
        body: JSON.stringify({ name, startDate, endDate: endDate || null, description, tags }),
      });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveTag(tagToRemove) {
    setError('');
    try {
      await apiFetch(url, {
        method: 'PUT',
        body: JSON.stringify({
          name: project.name,
          startDate: project.startDate,
          endDate: project.endDate,
          description: project.description,
          tags: project.tags.filter((x) => x !== tagToRemove),
        }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  if (editing) {
    return (
      <li className="py-5">
        <form onSubmit={handleSave} className="grid gap-3 sm:grid-cols-2">
          <input className="input" aria-label={t('projects.colName')} value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" aria-label={t('projects.colTags')} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <textarea className="input sm:col-span-2" aria-label={t('projects.colDescription')} value={description} onChange={(e) => setDescription(e.target.value)} />
          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn btn-primary btn-sm">{t('cvDetail.save')}</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>{t('cvDetail.cancel')}</button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-4 py-5">
      <div className="min-w-0">
        {showCandidate && (
          <Link className="link text-sm" to={`/profile/${project.user.id}`}>{displayName(project.user)}</Link>
        )}
        <h3 className="font-semibold">{project.name}</h3>
        <p className="text-sm text-muted">
          <Period start={project.startDate} end={project.endDate} ongoing={t('projects.ongoing')} />
        </p>
        {project.description && <p className="mt-2 max-w-prose text-sm">{project.description}</p>}
        {project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Tag key={tag} onRemove={canEdit ? () => handleRemoveTag(tag) : undefined}>{tag}</Tag>
            ))}
          </div>
        )}
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>
      {canEdit && (
        <div className="flex shrink-0 gap-1">
          <button className="btn-icon" onClick={() => setEditing(true)} aria-label={t('projects.edit')}><PencilIcon /></button>
          <button className="btn-icon btn-icon-danger" onClick={() => onDelete(project.id)} aria-label={t('projects.delete')}><TrashIcon /></button>
        </div>
      )}
    </li>
  );
}

export default ProjectItem;
