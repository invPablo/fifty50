import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type IconName = keyof typeof Feather.glyphMap;

interface Slide {
  icon: IconName;
  title: string;
}

const SLIDES: Slide[] = [
  { icon: 'users', title: 'Divide gastos con amigos al instante' },
  { icon: 'map', title: 'Organiza cualquier viaje o piso compartido' },
  { icon: 'check-circle', title: 'Saldad cuentas sin líos ni números' },
];

const AUTO_ADVANCE_MS = 2000;

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [logoAnim]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % SLIDES.length;
        scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(newIndex);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.logoRow,
          {
            opacity: logoAnim,
            transform: [
              {
                scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.logoMark, { backgroundColor: theme.accent }]}>
          <Feather name="repeat" size={22} color="#FFFFFF" />
        </View>
        <Text style={[styles.logoText, { color: theme.text, fontFamily: Fonts.heading }]}>
          Tranzfr
        </Text>
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.carousel}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.illustrationBlob, { backgroundColor: theme.accentSoft }]}>
              <Feather name={slide.icon} size={72} color={theme.accent} />
            </View>
            <Text style={[styles.slideTitle, { color: theme.text, fontFamily: Fonts.heading }]}>
              {slide.title}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? theme.accent : theme.border,
                width: i === index ? 22 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push('/signup')}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>Empezar viaje</Text>
        </Pressable>

        <Link href="/login" style={[styles.loginLink, { color: theme.textSecondary }]}>
          ¿Ya tienes cuenta? <Text style={{ color: theme.accent, fontWeight: '700' }}>Iniciar sesión</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 24,
    paddingBottom: 8,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
  },
  carousel: {
    flexGrow: 0,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  illustrationBlob: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 12,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loginLink: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 18,
  },
});
