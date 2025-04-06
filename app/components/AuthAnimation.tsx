import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, G } from "react-native-svg";
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

interface AuthAnimationProps {
  type: "login" | "register";
}

export function AuthAnimation({ type }: AuthAnimationProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  const rotation = useSharedValue(0);
  const pathLength = useSharedValue(0);

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
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
      opacity: opacity.value,
    };
  });

  const pathStyle = useAnimatedStyle(() => {
    return {
      strokeDashoffset: withTiming(pathLength.value === 1 ? 0 : 1000, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.svgContainer, animatedStyle]}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <G>
            {/* Background circle */}
            <Circle cx="100" cy="100" r="90" fill="#FF6B6B" fillOpacity="0.1" />

            {/* Animated path for login/register icon */}
            <AnimatedPath
              d={
                type === "login"
                  ? "M70,100 L100,130 L130,70" // Checkmark for login
                  : "M70,100 L100,130 L130,70 M70,70 L130,70 M70,100 L130,100 M70,130 L130,130" // Plus sign for register
              }
              stroke="#FF6B6B"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={pathStyle}
            />

            {/* Decorative circles */}
            <Circle cx="40" cy="40" r="5" fill="#4ECDC4" fillOpacity="0.7" />
            <Circle cx="160" cy="40" r="5" fill="#45B7D1" fillOpacity="0.7" />
            <Circle cx="40" cy="160" r="5" fill="#96CEB4" fillOpacity="0.7" />
            <Circle cx="160" cy="160" r="5" fill="#FF6B6B" fillOpacity="0.7" />
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
    width: 200,
    height: 200,
  },
});
