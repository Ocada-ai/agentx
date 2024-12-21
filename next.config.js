/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      
      
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      // http: require.resolve('stream-http'),
      // https: require.resolve('https-browserify'),
      // zlib: require.resolve('browserify-zlib'),
    
    };
    return config;
  },
  transpilePackages: ['@solana/web3.js', 'rpc-websockets']
};

module.exports = nextConfig;
