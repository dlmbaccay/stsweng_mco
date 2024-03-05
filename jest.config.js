module.exports = {
    testEnvironment: 'jsdom',
    moduleDirectories: ['node_modules', '<rootDir>/'],
    moduleNameMapper: {
      // Handle module aliases (if you have them in your Next.js project)
      '^@components/(.*)$': '<rootDir>/components/$1',
      // Mock static asset imports (images, stylesheets) which Jest can't process
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transform: {
      // Use babel-jest to transpile tests in JS/JSX
      '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },
  };
  