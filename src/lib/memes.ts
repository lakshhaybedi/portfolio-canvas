// The meme wall on /me.
//
// TO ADD ONE: drop the image in `public/memes/` and add a line below. That's
// it — the prebuild WebP step (scripts/generate-webp.mjs) picks up any new
// PNG/JPG automatically on the next build, same as every other image on this
// site. No CMS, because a static export has nowhere to put one.
//
// (Browser-side uploading that other visitors could see would need a hosted
// store + a public write endpoint — see the guestbook note. Same decision.)

export type Meme = {
  src: string;
  /** Shown under the image and used as alt text, so write it like a caption. */
  caption: string;
};

export const MEMES: Meme[] = [
  // { src: "/memes/example.jpg", caption: "me explaining design tokens to nobody" },
];
