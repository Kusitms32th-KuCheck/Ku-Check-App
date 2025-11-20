import { Stack } from 'expo-router';
import { NotificationInitializer } from '../components/NotificationInitializer';

export default function RootLayout() {
    return (
        <NotificationInitializer>
            <Stack screenOptions={{ headerShown: false }} />
        </NotificationInitializer>
    );
}
