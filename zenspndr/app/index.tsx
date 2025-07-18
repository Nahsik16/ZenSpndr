import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the splash screen first
    router.replace('/splash');
  }, [router]);

  return null;
}
