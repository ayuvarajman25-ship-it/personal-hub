import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Text, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Btn, IconBtn, Muted } from '../../src/ui';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';

const INBOX = 'https://www.instagram.com/direct/inbox/';

// A normal Chrome user agent, so Instagram serves its regular mobile site instead of treating this as an embedded view.
const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

// Pages the app may leave the WebView on. Anything else (feed, explore, reels) is sent back to the inbox.
const MESSAGES_ONLY_GUARD = `
(function () {
  var ok = /^\\/(direct|accounts|challenge|two_factor|auth_platform|consent)(\\/|$)/;
  function check() { if (!ok.test(location.pathname)) location.replace('/direct/inbox/'); }
  ['pushState', 'replaceState'].forEach(function (k) {
    var orig = history[k];
    history[k] = function () { var r = orig.apply(this, arguments); setTimeout(check, 0); return r; };
  });
  window.addEventListener('popstate', check);
  check();
})();
true;
`;

const OWN_HOSTS = /(^|\.)(instagram\.com|cdninstagram\.com|fbcdn\.net|facebook\.com|facebook\.net)$/;

export default function Messages() {
  const t = useTheme();
  const { settings } = useStore();
  const messagesOnly = settings.messagesOnly !== false;
  const web = useRef<WebView>(null);
  const canGoBack = useRef(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // The phone's back button goes back inside Instagram first, and only then leaves the tab.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canGoBack.current) {
          web.current?.goBack();
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, []),
  );

  const onNav = (nav: WebViewNavigation) => {
    canGoBack.current = nav.canGoBack;
  };

  const reload = () => {
    setFailed(false);
    setLoading(true);
    web.current?.reload();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 4, minHeight: 52 }}>
        <Text style={{ flex: 1, fontSize: 22, fontWeight: '600', letterSpacing: -0.4, color: t.text }}>Messages</Text>
        <IconBtn name="refresh" label="Reload" onPress={reload} />
        <IconBtn name="open-outline" label="Open in browser" onPress={() => Linking.openURL(INBOX)} />
      </View>

      {failed ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
          <Muted style={{ textAlign: 'center' }}>Could not load Instagram. Check your connection and try again.</Muted>
          <Btn title="Try again" onPress={reload} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <WebView
            // A new WebView when the setting changes, so the guard script is added or removed.
            key={messagesOnly ? 'guarded' : 'open'}
            ref={web}
            source={{ uri: INBOX }}
            userAgent={USER_AGENT}
            style={{ flex: 1, backgroundColor: t.bg }}
            domStorageEnabled
            javaScriptEnabled
            thirdPartyCookiesEnabled
            setSupportMultipleWindows={false}
            injectedJavaScriptBeforeContentLoaded={messagesOnly ? MESSAGES_ONLY_GUARD : undefined}
            onNavigationStateChange={onNav}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => setFailed(true)}
            onShouldStartLoadWithRequest={(req) => {
              if (req.isTopFrame === false || req.url.startsWith('about:')) return true;
              try {
                const { protocol, hostname } = new URL(req.url);
                if ((protocol === 'https:' || protocol === 'http:') && OWN_HOSTS.test(hostname)) return true;
              } catch {
                // fall through and open it outside the app
              }
              Linking.openURL(req.url);
              return false;
            }}
          />
          {loading ? (
            <View pointerEvents="none" style={{ position: 'absolute', top: 12, left: 0, right: 0, alignItems: 'center' }}>
              <ActivityIndicator color={t.accent} />
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}
