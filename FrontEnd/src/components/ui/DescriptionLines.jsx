export default function DescriptionLines({ text, className = '' }) {
  const lines = splitDescription(text);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export function splitDescription(text = '') {
  return String(text)
    .split(/\r?\n|\s*\+\s*/g)
    .map((line) => line.trim())
    .filter(Boolean);
}
