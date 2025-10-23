'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function DashboardProfessionalsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al dashboard profesional real
    router.push('/professional-dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
        <p className="text-gray-600">Redirecting to professional dashboard...</p>
      </div>
    </div>
  );
}
