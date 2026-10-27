// Shared UI primitives used across pages

function Icon({ size = 18, children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const PencilIcon = (p) => <Icon {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Icon>;
export const TrashIcon = (p) => <Icon {...p}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></Icon>;
export const PlusIcon = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
export const XIcon = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
export const MenuIcon = (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>;
export const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
export const SunIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></Icon>;
export const MoonIcon = (p) => <Icon {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></Icon>;
export const ArrowLeftIcon = (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;
export const ThumbIcon = ({ filled, ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

export function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="spinner" role="status" aria-label="Loading" />
    </div>
  );
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  return <div className={`alert ${kind === 'ok' ? 'alert-ok' : 'alert-error'}`} role={kind === 'ok' ? 'status' : 'alert'}>{children}</div>;
}

export function PageHeader({ title, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="page-title">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function StatusChip({ status, label }) {
  return <span className={`chip ${status === 'published' ? 'chip-accent' : ''}`}>{label}</span>;
}

export function Tag({ children, onRemove }) {
  return (
    <span className="chip">
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} className="-mr-1 rounded-full p-0.5 hover:bg-line hover:text-ink" aria-label="Remove tag">
          <XIcon size={12} />
        </button>
      )}
    </span>
  );
}

export function Period({ start, end, ongoing }) {
  return (
    <>
      {new Date(start).toLocaleDateString()} – {end ? new Date(end).toLocaleDateString() : ongoing}
    </>
  );
}
