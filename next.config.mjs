/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  typescript: {
    ignoreBuildErrors: true, // 忽略所有TypeScript错误
  },
};

export default nextConfig;