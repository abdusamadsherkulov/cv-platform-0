import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, displayName } from '../api';
import { useTranslation } from 'react-i18next';
import { Alert, PageHeader, ThumbIcon } from '../components/ui';

function AllCVs() {
  const [cvs, setCvs] = useState([]);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function loadCvs() {
    try {
      const data = await apiFetch('/cvs/all/published');
      setCvs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCvs();
  }, []);

  return (
    <div className="page">
      <PageHeader title={t('allCvs.title')} />
      <Alert>{error}</Alert>

      <div className="surface overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('allCvs.colCandidate')}</th>
              <th>{t('allCvs.colPosition')}</th>
              <th>{t('allCvs.colLikes')}</th>
            </tr>
          </thead>
          <tbody>
            {cvs.map((cv) => (
              <tr key={cv.id}>
                <td><Link className="link" to={`/profile/${cv.user.id}`}>{displayName(cv.user)}</Link></td>
                <td><Link className="link" to={`/cvs/${cv.id}`}>{cv.position.title}</Link></td>
                <td>
                  <span className="inline-flex items-center gap-1.5 text-muted"><ThumbIcon size={15} /> {cv.likeCount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllCVs;
