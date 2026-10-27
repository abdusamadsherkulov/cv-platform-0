import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch, getCurrentRole } from '../api';
import { useTranslation } from 'react-i18next';
import { Loading, Alert, PageHeader, StatusChip, ThumbIcon, Tag, Period } from '../components/ui';
import AttributeInput from '../components/AttributeInput';

function CVDetail() {
  const { id } = useParams();
  const [cv, setCv] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const role = getCurrentRole();
  const canLike = role === 'recruiter' || role === 'admin';
  const canEdit = role === 'candidate' || role === 'admin';

  const { t } = useTranslation();

  async function loadCv() {
    try {
      const data = await apiFetch(`/cvs/${id}`);
      setCv(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCv();
  }, [id]);

  async function handleFieldSave(attributeId, newValue, version) {
    setError('');
    setMessage('');
    try {
      await apiFetch(`/cvs/${id}/attributes/${attributeId}`, {
        method: 'PUT',
        body: JSON.stringify({ value: newValue, version }),
      });
      loadCv();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePublish() {
    setError('');
    setMessage('');
    try {
      await apiFetch(`/cvs/${id}/publish`, { method: 'POST' });
      setMessage('CV published successfully!');
      loadCv();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleLike() {
    setError('');
    try {
      if (cv.userLiked) {
        await apiFetch(`/likes/${id}`, { method: 'DELETE' });
      } else {
        await apiFetch(`/likes/${id}`, { method: 'POST' });
      }
      loadCv();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!cv) return <Loading />;

  return (
    <div className="page max-w-3xl">
      <PageHeader title={cv.position.title}>
        {cv.status === 'draft' && (
          <button className="btn btn-primary" onClick={handlePublish}>{t('cvDetail.publish')}</button>
        )}
      </PageHeader>

      <div className="-mt-4 mb-8 flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-2 text-muted">
          {t('cvDetail.status')}: <StatusChip status={cv.status} label={t(`cvDetail.${cv.status}`)} />
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          {t('cvDetail.likes')}: <span className="font-medium text-ink">{cv.likeCount}</span>
          {canLike && (
            <button
              onClick={handleToggleLike}
              className={`btn-icon size-8 ${cv.userLiked ? 'text-accent' : ''}`}
              aria-pressed={cv.userLiked}
              aria-label={cv.userLiked ? t('cvDetail.unlike') : t('cvDetail.like')}
            >
              <ThumbIcon filled={cv.userLiked} size={16} />
            </button>
          )}
        </span>
      </div>

      <Alert>{error}</Alert>
      <Alert kind="ok">{message}</Alert>

      <section>
        <h2 className="section-title mb-3">{t('cvDetail.attributes')}</h2>
        <ul className="list">
          {cv.fields.map((field) => (
            <FieldRow key={field.attributeId} field={field} onSave={handleFieldSave} canEdit={canEdit} />
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="section-title mb-3">{t('cvDetail.projects')}</h2>
        <ul className="list">
          {cv.projects.map((proj) => (
            <li key={proj.id} className="py-5">
              <h3 className="font-semibold">{proj.name}</h3>
              <p className="text-sm text-muted"><Period start={proj.startDate} end={proj.endDate} ongoing={t('projects.ongoing')} /></p>
              {proj.description && <p className="mt-2 max-w-prose text-sm">{proj.description}</p>}
              {proj.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {proj.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function FieldRow({ field, onSave, canEdit }) {
  const { t } = useTranslation();
  const [input, setInput] = useState(field.value);
  const [saveStatus, setSaveStatus] = useState('');

  const isEmpty = !field.value?.trim();

  // auto-save 5 seconds after the last edit
  useEffect(() => {
    if (input === field.value) return;
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      await onSave(field.attributeId, input, field.version);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 5000);
    return () => clearTimeout(timer);
  }, [input]);

  return (
    <li className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <div className="pt-2 text-sm">
        <span className={isEmpty ? 'text-danger' : 'font-medium'}>{field.name}</span>
        {saveStatus && (
          <p className="mt-0.5 text-xs text-muted">{saveStatus === 'saving' ? t('profile.saving') : t('profile.saved')}</p>
        )}
      </div>
      <div className="max-w-md">
        <AttributeInput
          ns="cvDetail"
          type={field.type}
          options={field.options}
          value={input}
          disabled={!canEdit}
          onChange={setInput}
        />
      </div>
    </li>
  );
}

export default CVDetail;
