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
    return <img src={imageUrl} alt={alt} className={className} />;
  }

  return <span className={emojiClassName}>{imageUrl || '📦'}</span>;
}
