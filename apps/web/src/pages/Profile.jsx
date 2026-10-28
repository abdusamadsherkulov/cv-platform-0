import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, getCurrentRole, getCurrentUserId, displayName } from '../api';
import { useToast, ToastContainer } from '../components/Toast';
import { useTranslation } from 'react-i18next';
import { Alert, PageHeader, PlusIcon, TrashIcon, StatusChip } from '../components/ui';
import AttributeInput from '../components/AttributeInput';
import ProjectItem from '../components/ProjectItem';

function Profile() {
  const { userId: paramUserId } = useParams();
  const myUserId = getCurrentUserId();
  const viewedUserId = paramUserId ? Number(paramUserId) : myUserId;

  const role = getCurrentRole();
  const isOwnProfile = viewedUserId === myUserId;
  const canEdit = isOwnProfile || role === 'admin';
  const showCandidateSections = isOwnProfile ? role === 'candidate' : true;

  const [values, setValues] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [error, setError] = useState('');
  const [attributeToAdd, setAttributeToAdd] = useState('');
  const [valueToAdd, setValueToAdd] = useState('');
  const selectedAttrToAdd = attributesList.find((a) => a.id === Number(attributeToAdd));
  const { t } = useTranslation();
  const [meFields, setMeFields] = useState({ firstName: '', lastName: '', location: '', name: '' });
  const meLoadedRef = useRef(false);
  const [cvs, setCvs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTagsInput, setProjectTagsInput] = useState('');

  const [showSalesforceForm, setShowSalesforceForm] = useState(false);
  const [sfCompanyName, setSfCompanyName] = useState('');
  const [sfPhone, setSfPhone] = useState('');
  const [sfNotes, setSfNotes] = useState('');
  const [sfResult, setSfResult] = useState(null);


  const meUrl = isOwnProfile ? '/profile/me' : `/profile/${viewedUserId}/me`;
  const valuesUrl = isOwnProfile ? '/profile' : `/profile/${viewedUserId}/values`;
  const valueUrl = (attributeId) => isOwnProfile ? `/profile/${attributeId}` : `/profile/${viewedUserId}/values/${attributeId}`;
  const cvsUrl = isOwnProfile ? '/cvs' : `/cvs/user/${viewedUserId}`;
  const projectsUrl = isOwnProfile ? '/projects' : `/projects/user/${viewedUserId}`;
  const { toasts, showToast } = useToast();

  async function loadValues() {
    try {
      const data = await apiFetch(valuesUrl);
      setValues(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadAttributesList() {
    try {
      const data = await apiFetch('/attributes');
      setAttributesList(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMe() {
    try {
      const data = await apiFetch(meUrl);
      setMeFields(data);
      meLoadedRef.current = true;
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSalesforceSync(e) {
    e.preventDefault();
    setError('');
    setSfResult(null);
    try {
      const result = await apiFetch('/salesforce/sync', {
        method: 'POST',
        body: JSON.stringify({ companyName: sfCompanyName, phone: sfPhone, notes: sfNotes }),
      });
      setSfResult(result);
      setShowSalesforceForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadCvs() {
    if (!showCandidateSections) return;
    try {
      const data = await apiFetch(cvsUrl);
      setCvs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCv(cvId) {
    setError('');
    try {
      await apiFetch(`/cvs/${cvId}`, { method: 'DELETE' });
      loadCvs();
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadProjects() {
    if (!showCandidateSections) return;
    try {
      const data = await apiFetch(projectsUrl);
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    setError('');
    try {
      const tags = projectTagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: projectName, startDate: projectStartDate, endDate: projectEndDate || null, description: projectDescription, tags }),
      });
      setProjectName('');
      setProjectStartDate('');
      setProjectEndDate('');
      setProjectDescription('');
      setProjectTagsInput('');
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteProject(id) {
    setError('');
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' });
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    meLoadedRef.current = false; // reset the auto-save guard whenever we switch to viewing a different profile
    loadValues();
    loadAttributesList();
    loadMe();
    loadCvs();
    loadProjects();
  }, [viewedUserId]);

  // auto-save for the "Me" fields - only when it's your own profile (matches spec's auto-save requirement)
  useEffect(() => {
    if (!isOwnProfile || !meLoadedRef.current) return;

    const timer = setTimeout(async () => {
      showToast(t('profile.saving'), 'saving');
      try {
        await apiFetch(meUrl, {
          method: 'PUT',
          body: JSON.stringify(meFields),
        });
        showToast(t('profile.saved'), 'saved');
      } catch (err) {
        setError(err.message);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [meFields]);

  // for viewing someone else's profile (admin editing), save immediately on blur instead of debouncing
  async function handleMeBlurSave() {
    if (isOwnProfile) return; // own profile already auto-saves via the effect above
    try {
      await apiFetch(meUrl, { method: 'PUT', body: JSON.stringify(meFields) });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddAttribute() {
    if (!attributeToAdd) return;
    setError('');
    try {
      await apiFetch(valueUrl(attributeToAdd), {
        method: 'PUT',
        body: JSON.stringify({ value: valueToAdd }),
      });
      setAttributeToAdd('');
      setValueToAdd('');
      loadValues();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(attributeId) {
    setError('');
    try {
      await apiFetch(valueUrl(attributeId), { method: 'DELETE' });
      loadValues();
    } catch (err) {
      setError(err.message);
    }
  }

  const addedIds = values.map((v) => v.attributeId);
  const availableToAdd = attributesList.filter((a) => !addedIds.includes(a.id));

  return (
    <div className="page max-w-5xl">
      <ToastContainer toasts={toasts} />
      <PageHeader title={isOwnProfile ? t('profile.title') : displayName(meFields)} />
      <Alert>{error}</Alert>

      {/* Me */}
      <section>
        {isOwnProfile && <h2 className="section-title mb-3">{t('profile.me')}</h2>}
        <div className="grid gap-3 sm:grid-cols-3">
          <input className="input" placeholder={t('profile.firstName')} aria-label={t('profile.firstName')} value={meFields.firstName} disabled={!canEdit}
            onChange={(e) => setMeFields((f) => ({ ...f, firstName: e.target.value }))} onBlur={handleMeBlurSave} />
          <input className="input" placeholder={t('profile.lastName')} aria-label={t('profile.lastName')} value={meFields.lastName} disabled={!canEdit}
            onChange={(e) => setMeFields((f) => ({ ...f, lastName: e.target.value }))} onBlur={handleMeBlurSave} />
          <input className="input" placeholder={t('profile.location')} aria-label={t('profile.location')} value={meFields.location} disabled={!canEdit}
            onChange={(e) => setMeFields((f) => ({ ...f, location: e.target.value }))} onBlur={handleMeBlurSave} />
        </div>

        {canEdit && (
          <div className="mt-4">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowSalesforceForm((v) => !v)}>
              Sync to Salesforce
            </button>

            {sfResult && (
              <div className="alert alert-ok mt-3">
                Synced! Account ID: {sfResult.accountId}, Contact ID: {sfResult.contactId}
              </div>
            )}

            {showSalesforceForm && (
              <form onSubmit={handleSalesforceSync} className="mt-3 grid gap-3 sm:grid-cols-3">
                <input className="input" placeholder="Company Name" value={sfCompanyName} onChange={(e) => setSfCompanyName(e.target.value)} />
                <input className="input" placeholder="Phone" value={sfPhone} onChange={(e) => setSfPhone(e.target.value)} />
                <input className="input" placeholder="Notes" value={sfNotes} onChange={(e) => setSfNotes(e.target.value)} />
                <div className="sm:col-span-3">
                  <button type="submit" className="btn btn-primary btn-sm">Submit to Salesforce</button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>

      {/* Info */}
      <section className="mt-12">
        <h2 className="section-title mb-3">{t('profile.info')}</h2>
        <ul className="list">
          {values.map((v) => (
            <ValueRow key={v.attributeId} value={v} canEdit={canEdit} onRemove={handleRemove} onSaved={loadValues} valueUrl={valueUrl} showToast={showToast} />
          ))}
        </ul>

        {canEdit && (
          <div className="mt-4 flex flex-wrap gap-2">
            <select
              className="input w-auto min-w-48 flex-1"
              value={attributeToAdd}
              onChange={(e) => { setAttributeToAdd(e.target.value); setValueToAdd(''); }}
            >
              <option value="">{t('profile.selectAttribute')}</option>
              {availableToAdd.map((attr) => <option key={attr.id} value={attr.id}>{attr.name} ({attr.category.name})</option>)}
            </select>

            {selectedAttrToAdd && (
              <div className="min-w-48 flex-1">
                <AttributeInput
                  type={selectedAttrToAdd.type}
                  options={selectedAttrToAdd.options}
                  value={valueToAdd}
                  onChange={setValueToAdd}
                />
              </div>
            )}

            <button className="btn btn-primary" onClick={handleAddAttribute} aria-label={t('positionDetail.add')}>
              <PlusIcon size={16} /> {t('positionDetail.add')}
            </button>
          </div>
        )}
      </section>

      {showCandidateSections && (
        <>
          <section className="mt-12">
            <h2 className="section-title mb-3">{isOwnProfile ? t('profile.myCvs') : t('profile.cvs')}</h2>
            <ul className="list">
              {cvs.map((cv) => (
                <li key={cv.id} className="flex items-center justify-between gap-3 py-3">
                  <Link className="link" to={`/cvs/${cv.id}`}>{cv.position.title}</Link>
                  <div className="flex items-center gap-2">
                    <StatusChip status={cv.status} label={t(`cvDetail.${cv.status}`)} />
                    {canEdit && (
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteCv(cv.id)} aria-label={t('projects.delete')}><TrashIcon /></button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="section-title mb-1">{isOwnProfile ? t('profile.myProjects') : t('profile.projects')}</h2>
            <ul className="list">
              {projects.map((proj) => (
                <ProjectItem
                  key={proj.id}
                  project={proj}
                  canEdit={canEdit}
                  useAdminUrl={!isOwnProfile}
                  onDelete={handleDeleteProject}
                  onSaved={loadProjects}
                />
              ))}
            </ul>

            {canEdit && (
              <>
                <h3 className="section-title mb-3 mt-10">{t('projects.addNew')}</h3>
                <form onSubmit={handleCreateProject} className="surface grid gap-3 p-5 sm:grid-cols-2">
                  <input className="input" placeholder={t('projects.namePlaceholder')} value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                  <input className="input" placeholder={t('projects.tagsPlaceholder')} value={projectTagsInput} onChange={(e) => setProjectTagsInput(e.target.value)} />
                  <input className="input" type="date" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} required />
                  <input className="input" type="date" value={projectEndDate} onChange={(e) => setProjectEndDate(e.target.value)} />
                  <textarea className="input sm:col-span-2" placeholder={t('projects.descriptionPlaceholder')} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} required />
                  <div className="sm:col-span-2">
                    <button type="submit" className="btn btn-primary"><PlusIcon size={16} /> {t('projects.addButton')}</button>
                  </div>
                </form>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ValueRow({ value, canEdit, onRemove, onSaved, valueUrl, showToast }) {
  const [input, setInput] = useState(value.value);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function saveNow() {
    setError('');
    showToast(t('profile.saving'), 'saving');
    try {
      await apiFetch(valueUrl(value.attributeId), {
        method: 'PUT',
        body: JSON.stringify({ value: input, version: value.version }),
      });
      showToast(t('profile.saved'), 'saved');
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  // auto-save 5 seconds after the last edit
  useEffect(() => {
    if (input === value.value) return;
    const timer = setTimeout(saveNow, 5000);
    return () => clearTimeout(timer);
  }, [input]);

  return (
    <li className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr_auto] sm:gap-6">
      <span className="pt-2 text-sm font-medium">{value.attribute.name}</span>
      <div className="max-w-md">
        <AttributeInput
          type={value.attribute.type}
          options={value.attribute.options}
          value={input}
          disabled={!canEdit}
          onChange={setInput}
        />
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
      {canEdit && (
        <button className="btn-icon btn-icon-danger" onClick={() => onRemove(value.attributeId)} aria-label={t('projects.delete')}><TrashIcon /></button>
      )}
    </li>
  );
}

export default Profile;
