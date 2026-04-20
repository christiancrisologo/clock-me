import React from 'react';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/auth/Login';
import { SharedDashboardPage } from './components/features/analytics/SharedDashboardPage';
import App from './App';
import { getSharedDashboardSnapshotFromUrl } from './utils/share';

const AppWrapper: React.FC = () => {
  const sharedSnapshot = React.useMemo(() => getSharedDashboardSnapshotFromUrl(), []);

  if (sharedSnapshot) {
    return <SharedDashboardPage snapshot={sharedSnapshot} />;
  }

  const { session, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Clock Me...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <Login />;
  }

  return <App userId={user.id} isGuest={user.isGuest} userName={user.username} />;
};

export default AppWrapper;
