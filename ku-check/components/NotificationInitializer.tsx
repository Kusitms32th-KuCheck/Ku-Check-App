import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useExpoNotifications } from '@/hooks/useExpoNotifications';

interface NotificationInitializerProps {
    children: React.ReactNode;
}

export const NotificationInitializer = ({
                                            children,
                                        }: NotificationInitializerProps) => {
    const { pushToken, isLoading, error } = useExpoNotifications();

    // 로딩 중일 때 표시
    if (isLoading && !pushToken) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>알림 설정 중...</Text>
            </View>
        );
    }

    // 에러 표시
    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorBox}>
                    <Text style={styles.errorTitle}>알림 설정 오류</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                </View>
                {children}
            </View>
        );
    }

    // 정상 렌더링
    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorBox: {
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#856404',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#856404',
        marginBottom: 12,
    },
});
