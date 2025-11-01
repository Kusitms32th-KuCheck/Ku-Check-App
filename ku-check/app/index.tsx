import {ActivityIndicator, Platform, StyleSheet, View} from 'react-native';
import { WebView } from 'react-native-webview';

export default function Home() {
    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: 'https://ku-check.vercel.app/' }}
                style={styles.webview}
                mixedContentMode="always" // Android에서 http/https 모두 허용 (필요 시만)
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback={true} // iOS 자동 재생 허용
                mediaPlaybackRequiresUserAction={false} // true면 유저 동작 필요
                originWhitelist={['https://*']} // 모든 HTTPS만 허용
                startInLoadingState={true} // 로딩 중 indicator
                renderLoading={() => (
                    <ActivityIndicator
                        color="#999999"
                        size="large"
                        style={styles.loading}
                    />
                )}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    loading: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 30,
        left: 0,
        right: 0,
    },
});
