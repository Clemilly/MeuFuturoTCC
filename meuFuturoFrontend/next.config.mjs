/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'MeuFuturo',
  },
  // Configurações para suportar arquivos grandes do Unity WebGL
  serverExternalPackages: [],
  // Aumentar limites de tamanho
  webpack: (config, { isServer }) => {
    // Aumentar limite de tamanho para arquivos estáticos
    config.module.rules.push({
      test: /\.(wasm|data|framework\.js)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/vlibras/[name][ext]',
      },
    })
    
    // Configurações para arquivos grandes
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vlibras: {
            test: /[\\/]vlibras[\\/]/,
            name: 'vlibras',
            chunks: 'all',
            priority: 30,
            maxSize: 100 * 1024 * 1024, // 100MB
          },
        },
      },
    }
    
    return config
  },
  async rewrites() {
    return [
      {
        source: '/vlibras/target/:path*',
        destination: 'https://vlibras.gov.br/app/vlibras/target/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/vlibras/target/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
          // Headers para arquivos grandes
          {
            key: 'Content-Length',
            value: '0',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
      // Headers globais para arquivos grandes
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

export default nextConfig
