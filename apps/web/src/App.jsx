import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CountUp from './components/CountUp';
import { Loading, Alert } from './components/ui';

const API_URL = 'https://cw-platform.onrender.com';

function App() {
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('statsCache')); } catch { return null; }
  });
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((fresh) => {
        setData(fresh);
        localStorage.setItem('statsCache', JSON.stringify(fresh));
      })
      .catch(() => { if (!data) setError('Could not load stats'); });
  }, []);

  if (error) return <div className="page"><Alert>{error}</Alert></div>;
  if (!data) return <Loading />;

  const stats = [
    [data.stats.totalPositions, t('home.positions')],
    [data.stats.totalCandidates, t('home.candidates')],
    [data.stats.totalRecruiters, t('home.recruiters')],
    [data.stats.totalCVs, t('home.totalCvs')],
    [data.stats.recentCVs, t('home.CVsLast24h')],
  ];

  return (
    <div className="page">
      <h1 className="max-w-2xl text-4xl font-semibold leading-[1.1] sm:text-5xl">{t('home.title')}</h1>

      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line lg:grid-cols-5">
        {stats.map(([value, label], i) => (
          <div key={label} className={`bg-surface p-5 ${i === stats.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}>
            <p className="text-3xl font-semibold tabular-nums"><CountUp end={value} /></p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="section-title mb-4">{t('home.latestPositions')}</h2>
          <ul className="list">
            {data.latestPositions.map((pos) => (
              <li key={pos.id} className="py-3.5">
                <Link to={`/positions/${pos.id}`} className="link">{pos.title}</Link>
                <p className="line-clamp-2 text-sm text-muted">{pos.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="section-title mb-4">{t('home.popularPositions')}</h2>
          <ol className="list">
            {data.popularPositions.map((pos, i) => (
              <li key={pos.id} className="flex items-center gap-4 py-3.5">
                <span className="w-5 text-sm tabular-nums text-muted">{i + 1}</span>
                <Link to={`/positions/${pos.id}`} className="link flex-1">{pos.title}</Link>
                <span className="chip">{pos._count.cvs}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="mt-14">
        <h2 className="section-title mb-4">{t('home.tagCloud')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {data.tagCloud.map(({ tag, count }) => (
            <Link
              key={tag}
              to="/positions"
              className="chip px-3 py-1 no-underline hover:bg-accent-soft hover:text-accent"
              style={{ fontSize: `${Math.min(1.25, 0.8 + count * 0.1)}rem` }}
            >
              {tag} <span className="opacity-60">{count}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
