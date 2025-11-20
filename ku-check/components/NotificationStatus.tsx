import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useExpoNotifications } from '@/hooks/useExpoNotifications';

export const NotificationStatus = () => {
    const { pushToken, sendTestNotification } = useExpoNotifications();
    const [deviceInfo, setDeviceInfo] = useState<Record<string, string> | null>(null);

    useEffect(() => {
        const loadDeviceInfo = async () => {
            try {
                const platform = await AsyncStorage.getItem('platform');
                const deviceId = await AsyncStorage.getItem('device_id');
                const token = await AsyncStorage.getItem('expo_push_token');

                setDeviceInfo({
                    platform: platform || 'Unknown',
                    deviceId: deviceId || 'Unknown',
                    token: token || 'Not set',
                });
            } catch (error) {
                console.error('Error loading device info:', error);
            }
        };

        loadDeviceInfo();
    }, [pushToken]);

    const handleCopyToken = () => {
        if (pushToken) {
            Alert.alert('토큰 정보', '토큰이 선택되었습니다:\n\n' + pushToken);
        }
    };

    const handleSendTestNotification = async () => {
        await sendTestNotification();
        Alert.alert('성공', '테스트 알림이 발송되었습니다');
    };

    if (!deviceInfo) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>로딩 중...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📱 기기 정보</Text>

                <View style={styles.infoCard}>
                    <Text style={styles.label}>플랫폼</Text>
                    <Text style={styles.value}>{deviceInfo.platform}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.label}>기기 ID</Text>
                    <Text style={styles.value} numberOfLines={2}>
                        {deviceInfo.deviceId}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔔 푸시 토큰</Text>

                <View style={styles.infoCard}>
                    <Text style={styles.label}>Expo Push Token</Text>
                    <Text style={styles.tokenValue} numberOfLines={4} selectable>
                        {pushToken || '토큰을 가져오는 중...'}
                    </Text>
                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={handleCopyToken}
                        disabled={!pushToken}
                    >
                        <Text style={styles.copyButtonText}>
                            {pushToken ? '📋 토큰 보기' : '토큰 없음'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.hint}>
                    이 토큰을 백엔드에 저장하고 푸시 알림을 보낼 때 사용합니다.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ 테스트</Text>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={handleSendTestNotification}
                >
                    <Text style={styles.testButtonText}>📤 테스트 알림 전송</Text>
                </TouchableOpacity>

                <Text style={styles.hint}>
                    버튼을 누르면 로컬 테스트 알림이 1초 후 발송됩니다.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingVertical: 16,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: '#222',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#0066cc',
    },
    label: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#333',
    },
    tokenValue: {
        fontSize: 11,
        color: '#666',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 4,
        marginVertical: 8,
        lineHeight: 16,
    },
    copyButton: {
        marginTop: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#e3f2fd',
        borderRadius: 4,
        alignItems: 'center',
    },
    copyButtonText: {
        fontSize: 12,
        color: '#0066cc',
        fontWeight: '600',
    },
    testButton: {
        backgroundColor: '#4caf50',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    testButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        fontStyle: 'italic',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
});
