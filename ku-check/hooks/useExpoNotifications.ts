import { useEffect, useRef, useCallback, useState } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '@/services/notificationService';

interface UseExpoNotificationsReturn {
    pushToken: string | null;
    isLoading: boolean;
    error: string | null;
    initializeNotifications: () => Promise<void>;
    sendTestNotification: () => Promise<void>;
    clearError: () => void;
}

export const useExpoNotifications = (): UseExpoNotificationsReturn => {
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const foregroundSubscriptionRef = useRef<Notifications.EventSubscription | null>(null);
    const responseSubscriptionRef = useRef<Notifications.EventSubscription | null>(null);

    const initializeNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = await notificationService.getExpoPushToken();

            if (!token) {
                setError('알림 권한을 거부했거나 실제 기기가 아닙니다');
                setIsLoading(false);
                return;
            }

            setPushToken(token.token);

            await AsyncStorage.setItem('expo_push_token', token.token);
            await AsyncStorage.setItem('device_id', token.deviceId);
            await AsyncStorage.setItem('platform', token.platform);

            foregroundSubscriptionRef.current =
                notificationService.setupForegroundNotificationListener((notification) => {
                    console.log('Processing foreground notification:', notification);
                });

            responseSubscriptionRef.current =
                notificationService.setupNotificationResponseListener((response) => {
                    const data = response.notification.request.content.data;
                    console.log('User tapped notification with data:', data);
                });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : '알림 초기화 중 오류가 발생했습니다';
            setError(errorMessage);
            console.error('Notification initialization error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendTestNotification = useCallback(async () => {
        try {
            await notificationService.sendLocalNotification({
                title: '테스트 알림',
                body: '이것은 테스트 알림입니다',
                data: {
                    screen: 'details',
                    id: '123',
                },
            });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : '알림 전송 실패';
            setError(errorMessage);
            console.error('Error sending test notification:', err);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    useEffect(() => {
        initializeNotifications();

        const restorePushToken = async () => {
            const savedToken = await AsyncStorage.getItem('expo_push_token');
            if (savedToken) {
                setPushToken(savedToken);
            }
        };

        restorePushToken();

        return () => {
            notificationService.removeNotificationListeners(
                foregroundSubscriptionRef.current,
                responseSubscriptionRef.current
            );
        };
    }, [initializeNotifications]);

    return {
        pushToken,
        isLoading,
        error,
        initializeNotifications,
        sendTestNotification,
        clearError,
    };
};
