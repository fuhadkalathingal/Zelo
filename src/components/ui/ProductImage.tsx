import { twMerge } from 'tailwind-merge';

interface ProductImageProps {
  imageUrl?: string;
  alt: string;
  className?: string;
  emojiClassName?: string;
}

const isRenderableImage = (value?: string) => {
  if (!value) return false;
  return value.startsWith('http') || value.startsWith('data:image/');
};

export default function ProductImage({ imageUrl, alt, className = '', emojiClassName = '' }: ProductImageProps) {
  if (isRenderableImage(imageUrl)) {
    // Combine base responsive classes with whatever the parent passes
    const finalClassName = twMerge("w-full h-full object-contain p-2", className);
    return <img src={imageUrl} alt={alt} className={finalClassName} />;
  }

  return <span className={emojiClassName}>{imageUrl || '📦'}</span>;
}
