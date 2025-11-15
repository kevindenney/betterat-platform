// @ts-nocheck
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BoatTuningSnapshot {
  shrouds: number;
  backstay: number;
  forestay: number;
  mastButtPosition: number;
}

export interface Boat3DViewerProps {
  boatClass: string;
  tuning: BoatTuningSnapshot;
  width?: number | string;
  height?: number;
}

interface BoatRigProfile {
  name: string;
  forestayBaseline: number;
  headline: string;
  notes: string[];
}

const CLASS_SUMMARY: Record<string, BoatRigProfile> = {
  etchells: {
    name: 'Etchells',
    forestayBaseline: 10950,
    headline: 'Etchells tuned baseline',
    notes: [
      'Mast rake target: 47–47.5 in (forestay ~10950 mm)',
      'Upper shroud: 25–28 Loos PT-2M',
      'Lower shroud: 12–14 Loos PT-1M',
      'Backstay marks 0–7 with vang assist above 12 kts',
    ],
  },
  dragon: {
    name: 'Dragon',
    forestayBaseline: 10800,
    headline: 'Dragon base rig matrix',
    notes: [
      'Forestay baseline: 10800 mm with 120 mm pre-bend',
      'Upper shrouds: 28 Loos, lowers 18 for medium breeze',
      'Backstay adds ~40 mm bend at mark 6 (>14 kts)',
    ],
  },
};

export function Boat3DViewer({
  boatClass,
  tuning,
  width = '100%',
  height = 260,
}: Boat3DViewerProps) {
  const guide = CLASS_SUMMARY[boatClass.trim().toLowerCase()];

  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={styles.title}>3D viewer available on web</Text>
      <Text style={styles.body}>
        Open BetterAt Yacht Racing on desktop to interact with the live 3D rig model.
      </Text>
      <Text style={styles.metrics}>
        Shrouds {tuning.shrouds}% • Backstay {tuning.backstay}% • Forestay {tuning.forestay}mm
      </Text>
      {guide && (
        <View style={styles.guide}>
          <Text style={styles.guideHeadline}>{guide.headline}</Text>
          {guide.notes.map((note) => (
            <Text key={note} style={styles.guideNote}>
              • {note}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  body: {
    fontSize: 13,
    color: '#1E3A8A',
    textAlign: 'center',
  },
  metrics: {
    fontSize: 12,
    color: '#0F172A',
  },
  guide: {
    marginTop: 12,
    gap: 4,
  },
  guideHeadline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  guideNote: {
    fontSize: 11,
    color: '#1E3A8A',
    textAlign: 'left',
  },
});

export default Boat3DViewer;
