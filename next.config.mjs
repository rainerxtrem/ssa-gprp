/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer ships its own React reconciler. Bundled through Next's
  // App Router webpack graph it resolves React under the "react-server"
  // condition and crashes with a minified React error #31. Marking it external
  // makes Node require() it directly at runtime instead, with a normal React.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
