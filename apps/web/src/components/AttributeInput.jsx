import { useTranslation } from 'react-i18next';

// Renders the right input for an attribute type (enum, boolean, text, period, numeric, date, string).
// ns picks the i18n namespace for the "select value / yes / no" labels ('cvDetail' or 'profile').
function AttributeInput({ type, options = [], value, onChange, disabled, ns = 'profile', small = false }) {
  const { t } = useTranslation();
  const sm = small ? ' input-sm' : '';

  if (type === 'enum') {
    return (
      <select className={`input${sm}`} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t(`${ns}.selectValue`)}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (type === 'boolean') {
    return (
      <select className={`input${sm}`} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t(`${ns}.selectValue`)}</option>
        <option value="true">{t(`${ns}.yes`)}</option>
        <option value="false">{t(`${ns}.no`)}</option>
      </select>
    );
  }
  if (type === 'text') {
    return <textarea className="input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />;
  }
  if (type === 'period') {
    const [from = '', to = ''] = value.split(',');
    return (
      <div className="flex gap-2">
        <input className={`input${sm}`} type="date" disabled={disabled} value={from} onChange={(e) => onChange(`${e.target.value},${to}`)} />
        <input className={`input${sm}`} type="date" disabled={disabled} value={to} onChange={(e) => onChange(`${from},${e.target.value}`)} />
      </div>
    );
  }
  return (
    <input
      className={`input${sm}`}
      type={type === 'numeric' ? 'number' : type === 'date' ? 'date' : 'text'}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default AttributeInput;
