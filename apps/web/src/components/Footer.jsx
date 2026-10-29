import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from './ui';

const PORTFOLIO_URL = 'https://sam-sherkulov-portfolio.vercel.app';

function Footer() {
    const { t } = useTranslation();

    const links = [
        { to: '/positions', label: t('nav.positions') },
        { to: '/attributes', label: t('nav.attributes') },
        { to: '/profile', label: t('nav.profile') },
    ];

    return (
        <footer className="mt-5 border-t border-line bg-surface">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <div className="grid gap-10 py-12 md:grid-cols-[2fr_1fr]">
                    <div className="max-w-sm">
                        <Link to="/" className="text-ink no-underline"><Logo /></Link>
                        <p className="mt-4 text-sm text-muted">{t('footer.tagline')}</p>
                    </div>

                    <nav aria-label={t('footer.platform')}>
                        <h2 className="mb-3 text-sm font-semibold">{t('footer.platform')}</h2>
                        <ul className="flex flex-wrap gap-x-6 gap-y-2 md:flex-col md:gap-y-2.5">
                            {links.map((l) => (
                                <li key={l.to}>
                                    <Link to={l.to} className="text-sm text-muted no-underline transition-colors hover:text-ink">{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="flex flex-col items-center gap-1 border-t border-line py-6 text-center text-sm text-muted sm:flex-row sm:justify-center sm:gap-3">
                    <p>© {new Date().getFullYear()} CV Platform</p>
                    <span className="hidden sm:inline" aria-hidden="true">·</span>
                    <p>
                        {t('footer.builtBy')}{' '}
                        <a
                            href={PORTFOLIO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-ink underline-offset-4 transition-colors hover:text-accent hover:underline"
                        >
                            Sam Sherkulov
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;