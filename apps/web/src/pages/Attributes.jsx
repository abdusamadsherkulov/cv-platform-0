import { useState, useEffect } from 'react';
import { apiFetch, getCurrentRole } from '../api';
import { useTranslation } from 'react-i18next';
import { Alert, PageHeader, PlusIcon } from '../components/ui';

function Attributes() {
  const [attributes, setAttributes] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('string');
  const [categoryId, setCategoryId] = useState('');
  const [optionsText, setOptionsText] = useState('');

  const role = getCurrentRole();
  const canManage = role === 'recruiter' || role === 'admin';

  const [categoriesList, setCategoriesList] = useState([]);

  const { t } = useTranslation();

  async function loadAttributes() {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiFetch(`/attributes${query}`);
      setAttributes(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadCategories() {
    try {
      const data = await apiFetch('/categories');
      setCategoriesList(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAttributes();
    loadCategories();
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const options = type === 'enum'
        ? optionsText.split(',').map((o) => o.trim()).filter(Boolean)
        : [];

      await apiFetch('/attributes', {
        method: 'POST',
        body: JSON.stringify({ name, description, type, categoryId: Number(categoryId), options }),
      });
      setName('');
      setDescription('');
      setCategoryId('');
      setOptionsText('');
      loadAttributes();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <PageHeader title={t('attributes.title')} />
      <Alert>{error}</Alert>

      <input
        className="input mb-4 max-w-sm"
        placeholder={t('attributes.searchPlaceholder')}
        aria-label={t('attributes.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="surface overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('attributes.colName')}</th>
              <th>{t('attributes.colCategory')}</th>
              <th>{t('attributes.colType')}</th>
              <th>{t('attributes.colDescription')}</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr) => (
              <tr key={attr.id}>
                <td className="font-medium">{attr.name}</td>
                <td>{attr.category.name}</td>
                <td><span className="chip">{t(`attributes.type-${attr.type}`)}</span></td>
                <td className="text-muted">{attr.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage && (
        <section className="mt-12">
          <h2 className="section-title mb-4">{t('attributes.addNew')}</h2>
          <form onSubmit={handleCreate} className="surface grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <input className="input" placeholder={t('attributes.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="input" placeholder={t('attributes.descriptionPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} required />
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {['string', 'text', 'numeric', 'date', 'period', 'boolean', 'enum', 'image'].map((tp) => (
                <option key={tp} value={tp}>{t(`attributes.type-${tp}`)}</option>
              ))}
            </select>
            {type === 'enum' && (
              <input className="input" placeholder={t('attributes.optionsPlaceholder')} value={optionsText} onChange={(e) => setOptionsText(e.target.value)} required />
            )}
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">{t('attributes.selectCategory')}</option>
              {categoriesList.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <div>
              <button type="submit" className="btn btn-primary" aria-label={t('attributes.addNew')}><PlusIcon size={16} /> {t('attributes.addNew')}</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default Attributes;
