import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useTranslation } from 'react-i18next';
import { Alert, PageHeader } from '../components/ui';

function CreatePosition() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attributesList, setAttributesList] = useState([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);
  const [projectTagsInput, setProjectTagsInput] = useState('');
  const [maxProjects, setMaxProjects] = useState(3);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { t } = useTranslation();

  async function loadAttributesList() {
    try {
      const data = await apiFetch('/attributes');
      setAttributesList(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAttributesList();
  }, []);

  function toggleAttribute(id) {
    setSelectedAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const tags = projectTagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const position = await apiFetch('/positions', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          attributeIds: selectedAttributeIds,
          projectTags: tags,
          maxProjects: Number(maxProjects),
        }),
      });
      // access rules are added as a follow-up step, straight on the new position's detail page
      navigate(`/positions/${position.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-narrow">
      <PageHeader title={t('positions.createNew')} />
      <Alert>{error}</Alert>

      <form onSubmit={handleCreate} className="space-y-3">
        <input className="input" placeholder={t('positions.titlePlaceholder')} aria-label={t('positions.titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="input" placeholder={t('positions.descriptionPlaceholder')} aria-label={t('positions.descriptionPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} required />
        <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
          <input className="input" placeholder={t('positionDetail.projectTagsLabel')} aria-label={t('positionDetail.projectTagsLabel')} value={projectTagsInput} onChange={(e) => setProjectTagsInput(e.target.value)} />
          <input className="input" type="number" placeholder={t('positionDetail.maxProjectsLabel')} aria-label={t('positionDetail.maxProjectsLabel')} value={maxProjects} onChange={(e) => setMaxProjects(e.target.value)} />
        </div>

        <fieldset className="pt-4">
          <legend className="section-title mb-3">{t('positions.attributesLabel')}</legend>
          <div className="flex flex-wrap gap-2">
            {attributesList.map((attr) => (
              <label key={attr.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={selectedAttributeIds.includes(attr.id)}
                  onChange={() => toggleAttribute(attr.id)}
                />
                <span className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm transition-colors hover:bg-soft peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                  {attr.name} <span className="ml-1.5 opacity-60">{attr.category.name}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="pt-6">
          <button type="submit" className="btn btn-primary">{t('positions.createButton')}</button>
        </div>
      </form>
    </div>
  );
}

export default CreatePosition;
