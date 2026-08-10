import type { CSSProperties, ImgHTMLAttributes } from "react";

/**
 * `<img>` that prefers a WebP sibling and falls back to the original file.
 *
 * Every .png/.jpg under public/ has a .webp generated next to it by
 * scripts/generate-webp.mjs (64% smaller across the set). Rather than
 * rewriting ~240 hardcoded paths across the data files, this derives the
 * .webp name from the original and offers it through a <source> — modern
 * browsers take the small one, and anything that doesn't understand WebP
 * (an old Safari on an old Mac, exactly the hardware we care about) keeps
 * getting the original, no JS and no broken image.
 *
 * `display: contents` on the <picture> is load-bearing: without it the
 * wrapper introduces an inline box between the img and its flex/grid
 * parent, which quietly breaks every `width: 100%` / `objectFit` layout
 * this replaces. Browsers too old to support `display: contents` are the
 * same ones taking the JPEG fallback, and they degrade to a normal inline
 * wrapper rather than anything broken.
 */
export default function Picture({
  src,
  alt,
  style,
  pictureStyle,
  ...imgProps
}: ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  pictureStyle?: CSSProperties;
}) {
  // Only local paths get a <source>: scripts/generate-webp.mjs walks public/
  // and can't create siblings on someone else's CDN. Offering one for an
  // external URL points the browser at a file that doesn't exist there — and
  // because <picture> treats a matching <source> as authoritative, it does
  // NOT silently fall back to the <img>, it just renders broken. (Exactly
  // what happened to the T-Cloud hero, which is still on a remote host.)
  const isLocal = src.startsWith("/");
  const webpSrc = src.replace(/\.(png|jpe?g)$/i, ".webp");

  // Anything already .webp/.svg/.gif has no sibling to offer either — render
  // a plain img rather than emit a <source> for a file that isn't there.
  if (!isLocal || webpSrc === src) {
    return <img src={src} alt={alt} style={style} {...imgProps} />;
  }

  return (
    <picture style={{ display: "contents", ...pictureStyle }}>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={src} alt={alt} style={style} {...imgProps} />
    </picture>
  );
}
