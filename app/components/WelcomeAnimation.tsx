import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, G, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function WelcomeAnimation() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  const rotation = useSharedValue(0);
  const pathLength = useSharedValue(0);
  const rectHeight = useSharedValue(40);

  useEffect(() => {
    // Subtle breathing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite repeat
      true // Reverse
    );

    // Fade in/out animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    // Path drawing animation
    pathLength.value = withTiming(1, {
      duration: 2000,
      easing: Easing.inOut(Easing.ease),
    });

    // Subscription box animation
    rectHeight.value = withRepeat(
      withSequence(
        withTiming(60, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(40, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.svgContainer, animatedStyle]}>
        <Svg width={250} height={250} viewBox="0 0 250 250">
          <G>
            {/* Background circle */}
            <Circle
              cx="125"
              cy="125"
              r="110"
              fill="#FF6B6B"
              fillOpacity="0.1"
            />

            {/* Subscription box */}
            <AnimatedRect
              x="75"
              y="95"
              width="100"
              height={rectHeight.value}
              rx="5"
              fill="#FF6B6B"
              fillOpacity="0.2"
            />

            {/* Calendar icon */}
            <AnimatedPath
              d="M85,105 L85,115 M165,105 L165,115 M85,125 L165,125 M85,135 L165,135 M85,145 L165,145"
              stroke="#FF6B6B"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDashoffset={pathLength.value === 1 ? 0 : 1000}
            />

            {/* Decorative elements */}
            <Circle cx="50" cy="50" r="8" fill="#4ECDC4" fillOpacity="0.7" />
            <Circle cx="200" cy="50" r="8" fill="#45B7D1" fillOpacity="0.7" />
            <Circle cx="50" cy="200" r="8" fill="#96CEB4" fillOpacity="0.7" />
            <Circle cx="200" cy="200" r="8" fill="#FF6B6B" fillOpacity="0.7" />

            {/* Subscription icon */}
            <Circle cx="125" cy="115" r="15" fill="#FF6B6B" fillOpacity="0.3" />
            <AnimatedPath
              d="M115,115 L135,115 M125,105 L125,125"
              stroke="#FF6B6B"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDashoffset={pathLength.value === 1 ? 0 : 1000}
            />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  svgContainer: {
    width: 250,
    height: 250,
  },
});
