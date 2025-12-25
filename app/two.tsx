import { Redirect } from 'expo-router';

// Redirect from /two to the tabs/two route to fix 404 errors when refreshing on web
export default function TwoPage() {
  return <Redirect href="/(tabs)/two" />;
}