import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  /** Texto opcional abaixo da marca (ex.: carregar listas). */
  message?: string;
};

export function BrandedBootScreen({ message }: Props) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.14, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.28 + (pulse.value - 1) * 0.55,
  }));

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-slate-950 px-8">
      <StatusBar style="light" />
      <Animated.View
        style={orbStyle}
        className="absolute h-80 w-80 rounded-full bg-indigo-600"
      />

      <Animated.View entering={FadeInDown.delay(60).duration(560)} className="z-10 items-center">
        <Text className="text-center text-3xl font-bold tracking-tight text-white">
          Thais Costa
        </Text>
        <Animated.View entering={FadeInUp.delay(180).duration(500)}>
          <Text className="mt-1 text-center text-xl font-semibold text-indigo-300">
            English
          </Text>
        </Animated.View>
        <Text className="mt-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          efl-app
        </Text>
        {message ? (
          <Text className="mt-3 max-w-xs text-center text-sm leading-5 text-slate-400">
            {message}
          </Text>
        ) : (
          <Text className="mt-3 text-center text-sm text-slate-500">
            A preparar a sua experiência de estudo
          </Text>
        )}
        <Animated.View entering={FadeIn.delay(400).duration(420)} className="mt-10">
          <ActivityIndicator size="large" color="#a5b4fc" />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}
