import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface PushToken {
    token: string;
    platform: string;
    deviceId: string;
}

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

class ExpoNotificationService {
    private async setupAndroidChannel() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                sound: 'default',
                enableVibrate: true,
                enableLights: true,
            });

            await Notifications.setNotificationChannelAsync('attendance', {
                name: 'Attendance',
                importance: Notifications.AndroidImportance.MAX,
                sound: 'default',
                vibrationPattern: [0, 250, 250, 250, 250, 250],
                enableVibrate: true,
            });
        }
    }

    async requestPushNotificationPermissions(): Promise<boolean> {
        if (!Device.isDevice) {
            console.log('Must use physical device for push notifications');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return false;
        }

        await this.setupAndroidChannel();
        return true;
    }

    async getExpoPushToken(): Promise<PushToken | null> {
        try {
            const hasPermission = await this.requestPushNotificationPermissions();
            if (!hasPermission) {
                return null;
            }

            const token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            });

            const deviceId = Device.osBuildId || Device.modelName || `device-${Date.now()}`;

            const pushToken: PushToken = {
                token: token.data,
                platform: Platform.OS,
                deviceId,
            };

            console.log('✅ Expo Push Token obtained:', pushToken.token);
            return pushToken;
        } catch (error) {
            console.error('Error getting Expo push token:', error);
            return null;
        }
    }

    setupForegroundNotificationListener(
        onNotificationReceived?: (notification: Notifications.Notification) => void
    ) {
        const subscription = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('📬 Notification received in foreground:', notification);

                if (onNotificationReceived) {
                    onNotificationReceived(notification);
                }
            }
        );

        return subscription;
    }

    setupNotificationResponseListener(
        onNotificationPressed?: (response: Notifications.NotificationResponse) => void
    ) {
        const subscription = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log('👆 Notification pressed:', response);

                if (onNotificationPressed) {
                    onNotificationPressed(response);
                }
            }
        );

        return subscription;
    }

    async sendLocalNotification(notification: NotificationPayload) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: notification.title,
                    body: notification.body,
                    data: notification.data || {},
                    sound: 'default',
                    badge: 1,
                },
                trigger: null,
            });

            console.log('✅ Local notification scheduled');
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    }

    removeNotificationListeners(
        foregroundSubscription?: Notifications.EventSubscription | null,
        responseSubscription?: Notifications.EventSubscription | null
    ) {
        if (foregroundSubscription) {
            foregroundSubscription.remove();
        }
        if (responseSubscription) {
            responseSubscription.remove();
        }
    }
}

export const notificationService = new ExpoNotificationService();
