import {ActivityIndicator, Platform, StyleSheet, View} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useEffect, useState } from 'react';
import * as Device from 'expo-device';
import { useExpoNotifications } from '@/hooks/useExpoNotifications';

export default function Home() {
    const webViewRef = useRef<WebView>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    // 알림 Hook 사용 - 앱 시작 시 자동으로 권한 요청 및 토큰 획득
    const { pushToken, isLoading: notificationLoading } = useExpoNotifications();

    useEffect(() => {
        const getDeviceId = async () => {
            try {
                const modelName = Device.modelName || 'unknown';
                const id = `${modelName}-${Date.now()}`;

                console.log('✅ 디바이스 ID 획득:', id);
                setDeviceId(id);
            } catch (err) {
                console.error('❌ 실패:', err);
                setDeviceId(`device-${Date.now()}`);
            }
        };
        getDeviceId();
    }, []);

    const onWebViewLoadEnd = () => {
        console.log('🌐 WebView 로드 완료, deviceId:', deviceId);
        console.log('🔔 Expo Push Token:', pushToken);

        // deviceId, pushToken, platform을 모두 WebView에 전송
        // 웹사이트에서 이 정보를 받아서 푸시 알림을 설정할 수 있음
        if (deviceId && webViewRef.current) {
            const message = {
                deviceId: deviceId,
                platform: Platform.OS,
                pushToken: pushToken || null,  // 푸시 토큰 추가
                timestamp: new Date().getTime(),
            };

            setTimeout(() => {
                console.log('📤 메시지 전송 (deviceId + pushToken):', JSON.stringify(message));
                webViewRef.current?.postMessage(JSON.stringify(message));
            }, 300);
        }
    };

    return (
        <View style={styles.container}>
            {/* 알림 초기화 중 로딩 표시 */}
            {notificationLoading && (
                <View style={styles.notificationLoadingOverlay}>
                    <ActivityIndicator
                        color="#0066cc"
                        size="small"
                    />
                </View>
            )}

            <WebView
                ref={webViewRef}
                source={{ uri: 'https://ku-check.vercel.app/' }}
                style={styles.webview}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState={true}
                renderLoading={() => (
                    <ActivityIndicator
                        color="#999999"
                        size="large"
                        style={styles.loading}
                    />
                )}
                onLoadEnd={onWebViewLoadEnd}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('❌ WebView error:', nativeEvent);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    webview: {
        flex: 1
    },
    loading: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 30,
        left: 0,
        right: 0,
    },
    notificationLoadingOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 999,
    },
});
