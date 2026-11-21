/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/jobs',
        permanent: false, // Set to true if it's a permanent 301 redirect
      },
    ]
  },
}


module.exports = nextConfig
