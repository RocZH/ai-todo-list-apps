import { Redirect } from 'expo-router';

/**
 * This component handles direct access to /two route by redirecting to the tabs/two route.
 * This fixes 404 errors when refreshing on web or accessing the URL directly.
 * The redirect ensures web browsers and deployment platforms like Vercel 
 * can properly handle the route without showing a 404 error.
 */
export default function TwoPage() {
  return <Redirect href="/(tabs)/two" />;
}