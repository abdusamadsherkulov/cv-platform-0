import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch, getCurrentRole } from '../api';
import { MenuIcon, XIcon, SearchIcon, SunIcon, MoonIcon, Logo } from './ui';

function SearchBox({ onNavigate }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const data = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
      setResults(data);
      setOpen(true);
    } catch {
      setResults(null);
    }
  }

  function goToPosition(id) {
    setResults(null);
    setQuery('');
    setOpen(false);
    onNavigate?.();
    navigate(`/positions/${id}`);
  }

  const empty = results && results.positions.length === 0 && results.attributes.length === 0;

  return (
    <form className="relative" onSubmit={handleSearch} ref={ref} role="search">
      <input
        className="input h-9 pl-9"
        placeholder={t('nav.searchPlaceholder')}
        aria-label={t('nav.searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && setOpen(true)}
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"><SearchIcon size={16} /></span>

      {open && results && (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2.5rem)] rounded-panel border border-line bg-surface p-2 shadow-xl">
          {empty && <p className="px-3 py-2 text-sm text-muted">{t('nav.noResults')}</p>}

          {results.positions.length > 0 && (
            <div className="mb-1">
              <p className="px-3 py-1.5 text-xs font-medium text-muted">{t('nav.positions')}</p>
              {results.positions.map((p) => (
                <button key={p.id} type="button" onClick={() => goToPosition(p.id)} className="block w-full rounded-control px-3 py-2 text-left text-sm hover:bg-soft">
                  {p.title}
                </button>
              ))}
            </div>
          )}

          {results.attributes.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-medium text-muted">{t('nav.attributes')}</p>
              {results.attributes.map((a) => (
                <p key={a.id} className="px-3 py-2 text-sm">{a.name}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { t, i18n } = useTranslation();
  const role = getCurrentRole();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function changeLanguage(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  if (location.pathname === '/login') return null;

  const links = [
    { to: '/attributes', label: t('nav.attributes') },
    { to: '/positions', label: t('nav.positions') },
    ...(role !== 'candidate' ? [{ to: '/all-cvs', label: t('nav.allCvs') }, { to: '/projects', label: t('nav.projects') }] : []),
    { to: '/profile', label: t('nav.profile') },
    ...(role === 'admin' ? [{ to: '/users', label: t('nav.users') }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `rounded-control px-3 py-1.5 text-sm font-medium no-underline transition-colors ${isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-soft hover:text-ink'
    }`;

  const langBtn = (lang, label) => (
    <button
      key={lang}
      onClick={() => changeLanguage(lang)}
      className={`px-2.5 py-1 text-xs font-medium transition-colors ${i18n.language.startsWith(lang) ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
        }`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-8">
        <Link to="/" className="mr-2 text-ink no-underline"><Logo /></Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {links.map((l) => <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>)}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden w-48 md:block"><SearchBox /></div>

          <div className="flex overflow-hidden rounded-control border border-line" role="group" aria-label="Language">
            {langBtn('en', 'EN')}
            {langBtn('ru', 'RU')}
          </div>

          <button className="btn-icon" onClick={() => setTheme((x) => (x === 'light' ? 'dark' : 'light'))} aria-label={t('nav.theme')}>
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          {isLoggedIn ? (
            <button className="btn btn-secondary btn-sm hidden sm:inline-flex" onClick={handleLogout}>{t('nav.logout')}</button>
          ) : (
            <Link className="btn btn-primary btn-sm" to="/login">{t('nav.login')}</Link>
          )}

          <button className="btn-icon lg:hidden" onClick={() => setMenuOpen((m) => !m)} aria-label="Menu" aria-expanded={menuOpen}>
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-surface px-5 pb-5 pt-3 lg:hidden">
          <div className="mb-3 md:hidden"><SearchBox onNavigate={() => setMenuOpen(false)} /></div>
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>)}
          </nav>
          {isLoggedIn && (
            <button className="btn btn-secondary mt-3 w-full sm:hidden" onClick={handleLogout}>{t('nav.logout')}</button>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
