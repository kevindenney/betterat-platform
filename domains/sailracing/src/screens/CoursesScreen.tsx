import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DomainDashboardProps } from '@betterat/domain-sdk';

export const CoursesScreen: React.FC<DomainDashboardProps> = ({ userId, services }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courses</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0369A1',
  },
});
