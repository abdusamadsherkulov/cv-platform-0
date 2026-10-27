import { useState, useEffect } from 'react';
import { apiFetch, getCurrentRole } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, PageHeader, PlusIcon } from '../components/ui';

function Positions() {
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState('');
  const role = getCurrentRole();
  const canManage = role === 'recruiter' || role === 'admin';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isCandidate = role === 'candidate';
  const [myCvs, setMyCvs] = useState([]);
  const positionIdsWithCv = myCvs.map((cv) => cv.positionId);

  async function loadPositions() {
    try {
      const data = await apiFetch('/positions');
      setPositions(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMyCvs() {
    if (!isCandidate) return;
    try {
      const data = await apiFetch('/cvs');
      setMyCvs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadPositions();
    loadMyCvs();
  }, []);

  async function handleCreateCv(positionId) {
    setError('');
    try {
      const cv = await apiFetch('/cvs', {
        method: 'POST',
        body: JSON.stringify({ positionId }),
      });
      navigate(`/cvs/${cv.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <PageHeader title={t('positions.title')}>
        {canManage && (
          <Link to="/positions/new" className="btn btn-primary">
            <PlusIcon size={16} /> {t('positions.addPosition')}
          </Link>
        )}
      </PageHeader>

      <Alert>{error}</Alert>

      <ul className="list">
        {positions.map((pos) => (
          <li key={pos.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 py-5">
            <div className="min-w-0 flex-1">
              <Link className="link text-base" to={`/positions/${pos.id}`}>{pos.title}</Link>
              <p className="mt-0.5 max-w-prose text-sm">{pos.description}</p>
              <p className="mt-2 text-sm text-muted">
                {t('positions.colAttributes')}: {pos.attributes.map((a) => a.attribute.name).join(', ') || '—'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {pos.projectTags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
                <span className="text-xs text-muted">{t('positions.colMaxProjects')}: {pos.maxProjects}</span>
              </div>
            </div>
            {isCandidate && (
              <button
                className="btn btn-primary btn-sm"
                disabled={positionIdsWithCv.includes(pos.id)}
                onClick={() => handleCreateCv(pos.id)}
              >
                {t('positions.createCv')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Positions;
