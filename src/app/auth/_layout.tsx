import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="choose-pet" />
      <Stack.Screen name="customize-pet" />
      <Stack.Screen name="tutorial" />
    </Stack>
  );
}
