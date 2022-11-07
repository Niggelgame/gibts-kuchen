/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/Nicolas',
        permanent: true,
      },
    ]
  },
  i18n: {
    locales: ['de'],
    defaultLocale: 'de',
  },
}

module.exports = nextConfig
