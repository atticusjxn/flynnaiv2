// Flynn.ai v2 - Authentication Test Component
'use client';

import { useAuthContext } from './MinimalAuthProvider';

export default function AuthTest() {
  const { user, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="text-sm text-gray-600">🔄 Checking authentication...</div>
    );
  }

  if (!user) {
    return <div className="text-sm text-red-600">❌ Not authenticated</div>;
  }

  return (
    <div className="text-sm space-y-1">
      <div className="text-green-600">✅ Authenticated successfully!</div>
      <div className="text-gray-600">
        User: {profile?.full_name || user.email}
      </div>
      {profile?.industry_type && (
        <div className="text-gray-600">
          Industry: {profile.industry_type.replace('_', ' ').toUpperCase()}
        </div>
      )}
    </div>
  );
}
