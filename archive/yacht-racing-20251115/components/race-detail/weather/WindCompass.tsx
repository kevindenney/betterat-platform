/**
 * WindCompass Component
 *
 * A simple visual compass showing wind direction
 * Used by WeatherCard to display wind direction
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WindCompassProps {
  direction: number; // Wind direction in degrees (0-360)
  size?: number; // Size of the compass in pixels
}

export const WindCompass: React.FC<WindCompassProps> = ({
  direction,
  size = 80
}) => {
  // Convert wind direction to a readable cardinal direction
  const getCardinalDirection = (degrees: number): string => {
    const normalized = ((degrees % 360) + 360) % 360;
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(normalized / 22.5) % 16;
    return directions[index];
  };

  const cardinal = getCardinalDirection(direction);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer circle */}
      <View style={[styles.compass, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Direction arrow */}
        <View
          style={[
            styles.arrow,
            {
              transform: [{ rotate: `${direction}deg` }],
            }
          ]}
        >
          <View style={styles.arrowHead} />
          <View style={styles.arrowTail} />
        </View>

        {/* Cardinal direction label */}
        <View style={styles.labelContainer}>
          <Text style={styles.cardinalText}>{cardinal}</Text>
          <Text style={styles.degreesText}>{Math.round(direction)}°</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compass: {
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  arrow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#3B82F6',
    marginTop: -10,
  },
  arrowTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#94A3B8',
    marginTop: 10,
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  cardinalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  degreesText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
});
