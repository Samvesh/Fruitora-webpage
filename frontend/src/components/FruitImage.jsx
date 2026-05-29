import { useState } from "react";

const fallbackImage = "/fruits/fallback.svg";

export default function FruitImage({ src, alt, className = "" }) {
  const [imageSrc, setImageSrc] = useState(src || fallbackImage);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (imageSrc !== fallbackImage) setImageSrc(fallbackImage);
      }}
    />
  );
}
