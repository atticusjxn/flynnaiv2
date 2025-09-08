// Flynn.ai v2 - AuthProvider Compatibility Layer
'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Re-export everything from MinimalAuthProvider to maintain compatibility
export { MinimalAuthProvider, useAuthContext } from './MinimalAuthProvider';

// Also export MinimalAuthProvider as AuthProvider for backwards compatibility
export { MinimalAuthProvider as AuthProvider } from './MinimalAuthProvider';

// Default export for any components that might be importing like: import AuthProvider from './AuthProvider'
export default function AuthProvider({ children }: { children: ReactNode }) {
  // Just forward to MinimalAuthProvider
  const { MinimalAuthProvider } = require('./MinimalAuthProvider');
  return React.createElement(MinimalAuthProvider, null, children);
}