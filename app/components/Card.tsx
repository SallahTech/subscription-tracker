import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ title, children, style }: CardProps) {
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, style]}>
      {title && (
        <View style={styles.titleContainer}>
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
}); 