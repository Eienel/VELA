import { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Mood, MOOD_META } from '../lib/api';

interface Props {
  mood: Mood;
  speaking: boolean;
  thinking: boolean;
  size?: number;
}

export default function MoodFace({ mood, speaking, thinking, size = 120 }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  const meta = MOOD_META[mood];

  useEffect(() => {
    if (speaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 350, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.96, duration: 350, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [speaking]);

  useEffect(() => {
    if (thinking) {
      Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 1600, useNativeDriver: true })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, { toValue: -6, duration: 500, useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      spin.setValue(0);
      bounce.setValue(0);
    }
  }, [thinking]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: meta.bg,
          borderColor: meta.color + '30',
          transform: [
            { scale: pulse },
            { translateY: bounce },
          ],
        },
      ]}
    >
      {/* Spinning ring when thinking */}
      {thinking && (
        <Animated.View
          style={[
            styles.ring,
            {
              width: size + 16,
              height: size + 16,
              borderRadius: (size + 16) / 2,
              borderColor: meta.color,
              transform: [{ rotate }],
            },
          ]}
        />
      )}
      <Text style={{ fontSize: size * 0.52, lineHeight: size * 0.65 }}>{meta.emoji}</Text>

      {/* Mood label */}
      <View style={[styles.badge, { backgroundColor: meta.color + '18', borderColor: meta.color + '40' }]}>
        <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderTopColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    bottom: -10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
