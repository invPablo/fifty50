import { Feather } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  image: ImageSourcePropType;
  title: string;
}

const SLIDES: Slide[] = [
  {
    image: require('../../../assets/images/onboarding/friends.jpg'),
    title: 'Divide gastos con amigos al instante',
  },
  {
    image: require('../../../assets/images/onboarding/trip.jpg'),
    title: 'Organiza cualquier viaje o piso compartido',
  },
  {
    image: require('../../../assets/images/onboarding/explore.jpg'),
    title: 'Explora ciudades nuevas sin perder la cuenta',
  },
  {
    image: require('../../../assets/images/onboarding/escape.jpg'),
    title: 'Desde una escapada de finde hasta el viaje de tu vida',
  },
  {
    image: require('../../../assets/images/onboarding/flamingo.jpg'),
    title: 'Disfruta del viaje, nosotros llevamos las cuentas',
  },
  {
    image: require('../../../assets/images/onboarding/settled.jpg'),
    title: 'Saldad cuentas sin líos ni números',
  },
];

const AUTO_ADVANCE_MS = 2000;
const isIOS = Platform.OS === 'ios';
const SCRIM_GRADIENT = require('../../../assets/images/onboarding/scrim-gradient.png');

export default function WelcomeScreen() {
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
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={StyleSheet.absoluteFill}
      >
        {SLIDES.map((slide, i) => (
          <ImageBackground key={i} source={slide.image} style={styles.slide} resizeMode="cover">
            <Image source={SCRIM_GRADIENT} style={StyleSheet.absoluteFill} resizeMode="stretch" />
          </ImageBackground>
        ))}
      </ScrollView>

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']} pointerEvents="box-none">
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
          <GlassView
            style={[styles.logoPill, !isIOS && styles.glassFallback]}
            glassEffectStyle="regular"
            tintColor="rgba(0,0,0,0.25)"
          >
            <View style={styles.logoMark}>
              <Feather name="repeat" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.logoText, { fontFamily: Fonts.heading }]}>Tranzfr</Text>
          </GlassView>
        </Animated.View>

        <View style={styles.spacer} />

        <GlassView
          style={[styles.bottomPanel, !isIOS && styles.glassFallback]}
          glassEffectStyle="regular"
          tintColor="rgba(0,0,0,0.3)"
        >
          <Text style={[styles.slideTitle, { fontFamily: Fonts.heading }]}>
            {SLIDES[index].title}
          </Text>

          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === index ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                    width: i === index ? 22 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <Pressable
            onPress={() => router.push('/signup')}
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.buttonText}>Empezar viaje</Text>
          </Pressable>

          <Link href="/login" style={styles.loginLink}>
            ¿Ya tienes cuenta? <Text style={styles.loginLinkStrong}>Iniciar sesión</Text>
          </Link>
        </GlassView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  glassFallback: {
    backgroundColor: 'rgba(20,20,28,0.55)',
  },
  logoRow: {
    alignItems: 'center',
    paddingTop: 12,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
  logoMark: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  spacer: {
    flex: 1,
  },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  slideTitle: {
    fontSize: 21,
    textAlign: 'center',
    lineHeight: 28,
    color: '#FFFFFF',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    color: '#16161D',
    fontSize: 15,
    fontWeight: '700',
  },
  loginLink: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  loginLinkStrong: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
