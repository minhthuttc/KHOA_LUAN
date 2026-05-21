/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false, // Tắt indicator "compiling..."
    appIsrStatus: false,  // Tắt ISR status
  },
  // Tắt Next.js DevTools overlay
  experimental: {
    devOverlays: false,
  },
};

export default nextConfig;
