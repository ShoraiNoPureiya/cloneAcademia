export default function OptimizedImage({ src, alt, className = '', sizes = '100vw' }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      sizes={sizes}
      className={className}
    />
  );
}
