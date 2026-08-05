/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // react-pdf/pdfjs-dist ship ESM-only (.mjs) builds — transpilePackages
  // routes them through Next's own loader instead of leaving them as raw
  // webpack externals, which otherwise throws a module-interop error
  // ("Object.defineProperty called on non-object") at runtime.
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
  webpack: (config) => {
    // pdfjs-dist's Node-targeted code path optionally requires the native
    // `canvas` package for server-side rendering, which isn't needed (or
    // installed) here — this is only ever used in the browser.
    config.resolve.alias.canvas = false;
    return config;
  },
};
export default nextConfig;
