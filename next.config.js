// next.config.js
module.exports = {
  transpilePackages: [
    '@tiptap',
    '@floating-ui'
  ],
  reactStrictMode: true,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mdtstreet.mdtsublimados.com.ar',
        port: '',
        pathname: '/img/**',  // opcional, pero recomendado para limitar a /img/
      },
    ],
  },
};

module.exports = nextConfig;