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
    setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.js'],
    // Collect coverage from all files except those in the node_modules directory
    collectCoverageFrom: ['src/**/*.{js,jsx}', '!**/node_modules/**'],
    // Ignore the following directories when collecting coverage
    coveragePathIgnorePatterns: ['src/pages', 'src/styles', 'src/tests', 'src/lib'],
    // Configure the coverage report
    coverageReporters: ['text', 'lcov', 'clover'],


  };