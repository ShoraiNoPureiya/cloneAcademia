export default function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-zinc-400">{description}</p>}
    </div>
  );
}
