import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch, getCurrentRole, displayName } from '../api';
import { useTranslation } from 'react-i18next';
import { Loading, Alert, ArrowLeftIcon, PencilIcon, TrashIcon, PlusIcon } from '../components/ui';

function PositionDetail() {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [attributesList, setAttributesList] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingInfo, setEditingInfo] = useState(false);

  const [projectTagsInput, setProjectTagsInput] = useState('');
  const [maxProjects, setMaxProjects] = useState(3);

  const [attributeToAdd, setAttributeToAdd] = useState('');

  const [ruleAttributeId, setRuleAttributeId] = useState('');
  const [ruleOperator, setRuleOperator] = useState('gt');
  const [ruleValue, setRuleValue] = useState('');

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  const role = getCurrentRole();
  const canManage = role === 'recruiter' || role === 'admin';
  const navigate = useNavigate();

  const { t } = useTranslation();

  async function loadPosition() {
    try {
      const data = await apiFetch(`/positions/${id}`);
      setPosition(data);
      setTitle(data.title);
      setDescription(data.description);
      setProjectTagsInput(data.projectTags.join(', '));
      setMaxProjects(data.maxProjects);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeletePosition() {
    setError('');
    try {
      await apiFetch(`/positions/${id}`, { method: 'DELETE' });
      navigate('/positions');
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

  useEffect(() => {
    loadPosition();
    loadAttributesList();
    loadPosts();
  }, [id]);

  async function handleSaveInfo(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const tags = projectTagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await apiFetch(`/positions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description,
          projectTags: tags,
          maxProjects: Number(maxProjects),
          version: position.version,
        }),
      });
      setMessage('Saved!');
      setEditingInfo(false);
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddAttribute() {
    if (!attributeToAdd) return;
    setError('');
    try {
      await apiFetch(`/positions/${id}/attributes`, {
        method: 'POST',
        body: JSON.stringify({ attributeId: Number(attributeToAdd) }),
      });
      setAttributeToAdd('');
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveAttribute(attributeId) {
    setError('');
    try {
      await apiFetch(`/positions/${id}/attributes/${attributeId}`, { method: 'DELETE' });
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddRule() {
    if (!ruleAttributeId || !ruleValue) return;
    setError('');
    try {
      await apiFetch(`/positions/${id}/access-rules`, {
        method: 'POST',
        body: JSON.stringify({
          attributeId: Number(ruleAttributeId),
          operator: ruleOperator,
          value: ruleValue,
        }),
      });
      setRuleAttributeId('');
      setRuleValue('');
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveRule(ruleId) {
    setError('');
    try {
      await apiFetch(`/positions/${id}/access-rules/${ruleId}`, { method: 'DELETE' });
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadPosts() {
    try {
      const data = await apiFetch(`/discussions/${id}`);
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePostSubmit(e) {
    e.preventDefault();
    if (!newPost.trim()) return;
    setError('');
    try {
      await apiFetch(`/discussions/${id}`, {
        method: 'POST',
        body: JSON.stringify({ content: newPost }),
      });
      setNewPost('');
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!position) return <Loading />;

  const attachedIds = position.attributes.map((a) => a.attributeId);
  const attributesNotYetAdded = attributesList.filter((a) => !attachedIds.includes(a.id));

  return (
    <div className="page max-w-3xl">
      <Link to="/positions" className="btn btn-ghost btn-sm -ml-3 mb-6">
        <ArrowLeftIcon size={16} /> {t('positionDetail.back')}
      </Link>

      <Alert>{error}</Alert>
      <Alert kind="ok">{message}</Alert>

      {editingInfo ? (
        <form onSubmit={handleSaveInfo} className="space-y-3">
          <input className="input text-lg font-semibold" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
            <input className="input" placeholder={t('positionDetail.projectTagsLabel')} value={projectTagsInput} onChange={(e) => setProjectTagsInput(e.target.value)} />
            <input className="input" type="number" placeholder={t('positionDetail.maxProjectsLabel')} value={maxProjects} onChange={(e) => setMaxProjects(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">{t('positionDetail.save')}</button>
            <button className="btn btn-secondary" type="button" onClick={() => setEditingInfo(false)}>{t('positionDetail.cancel')}</button>
          </div>
        </form>
      ) : (
        <header>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="page-title">{position.title}</h1>
            {canManage && (
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingInfo(true)}><PencilIcon size={14} /> {t('positionDetail.editButton')}</button>
                <button className="btn btn-secondary btn-sm text-danger" onClick={handleDeletePosition}><TrashIcon size={14} /> {t('positionDetail.delete')}</button>
              </div>
            )}
          </div>
          <p className="mt-3 max-w-prose text-base">{position.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {position.projectTags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
            <span className="text-sm text-muted">{t('positionDetail.maxProjectsLabel')}: {position.maxProjects}</span>
          </div>
        </header>
      )}

      <section className="mt-12">
        <h2 className="section-title mb-3">{t('positionDetail.attributes')}</h2>
        <ul className="list">
          {position.attributes.map((posAttr) => (
            <li key={posAttr.attributeId} className="flex items-center justify-between gap-3 py-2.5">
              <span>{posAttr.attribute.name}</span>
              {canManage && (
                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveAttribute(posAttr.attributeId)}>{t('positionDetail.remove')}</button>
              )}
            </li>
          ))}
        </ul>

        {canManage && (
          <div className="mt-4 flex gap-2">
            <select className="input" value={attributeToAdd} onChange={(e) => setAttributeToAdd(e.target.value)}>
              <option value="">{t('positionDetail.selectAttribute')}</option>
              {attributesNotYetAdded.map((attr) => <option key={attr.id} value={attr.id}>{attr.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={handleAddAttribute}><PlusIcon size={16} /> {t('positionDetail.add')}</button>
          </div>
        )}
      </section>

      {canManage && (
        <section className="mt-12">
          <h2 className="section-title mb-3">{t('positionDetail.accessRules')}</h2>
          <ul className="list">
            {position.accessRules?.map((rule) => (
              <li key={rule.id} className="flex items-center justify-between gap-3 py-2.5">
                <span>{rule.attribute.name} <span className="chip mx-1">{rule.operator}</span> {rule.value}</span>
                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveRule(rule.id)}>{t('positionDetail.remove')}</button>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_9rem_1fr_auto]">
            <select className="input" value={ruleAttributeId} onChange={(e) => setRuleAttributeId(e.target.value)}>
              <option value="">{t('positionDetail.selectAttribute')}</option>
              {attributesList.map((attr) => <option key={attr.id} value={attr.id}>{attr.name}</option>)}
            </select>
            <select className="input" value={ruleOperator} onChange={(e) => setRuleOperator(e.target.value)}>
              <option value="gt">{t('positionDetail.greaterThan')}</option>
              <option value="lt">{t('positionDetail.lessThan')}</option>
              <option value="eq">{t('positionDetail.equals')}</option>
            </select>
            <input className="input" placeholder={t('positionDetail.valuePlaceholder')} value={ruleValue} onChange={(e) => setRuleValue(e.target.value)} />
            <button className="btn btn-primary" onClick={handleAddRule}>{t('positionDetail.addRule')}</button>
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="section-title mb-3">{t('positionDetail.discussion')}</h2>
        <ul className="list">
          {posts.map((post) => (
            <li key={post.id} className="py-4">
              <p className="text-sm">
                <strong className="font-semibold">{displayName(post.author)}</strong>{' '}
                <span className="text-muted">{new Date(post.createdAt).toLocaleString()}</span>
              </p>
              <p className="mt-1">{post.content}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={handlePostSubmit} className="mt-4 flex gap-2">
          <input className="input" placeholder={t('positionDetail.postPlaceholder')} aria-label={t('positionDetail.postPlaceholder')} value={newPost} onChange={(e) => setNewPost(e.target.value)} />
          <button className="btn btn-primary" type="submit">{t('positionDetail.post')}</button>
        </form>
      </section>
    </div>
  );
}

export default PositionDetail;
