import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Line } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

const { width, height } = Dimensions.get('screen');
const GRID_SIZE = 60;

/**
 * AppBackground — renders the Sui × Walrus grid + radial glow effect.
 * Matches globals.css body::before (grid) and body::after (glow).
 * Use as the first child in every screen.
 */
export default function AppBackground() {
  const cols = Math.ceil(width / GRID_SIZE) + 1;
  const rows = Math.ceil(height / GRID_SIZE) + 1;

  const verticalLines = Array.from({ length: cols }, (_, i) => i * GRID_SIZE);
  const horizontalLines = Array.from({ length: rows }, (_, i) => i * GRID_SIZE);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          {/* Radial glow at top center */}
          <RadialGradient
            id="glow"
            cx="50%"
            cy="0%"
            rx="50%"
            ry="40%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#4FC3F7" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#4FC3F7" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Grid lines — vertical */}
        {verticalLines.map((x) => (
          <Line
            key={`v-${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={height}
            stroke="rgba(255,255,255,0.025)"
            strokeWidth={1}
          />
        ))}

        {/* Grid lines — horizontal */}
        {horizontalLines.map((y) => (
          <Line
            key={`h-${y}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="rgba(255,255,255,0.025)"
            strokeWidth={1}
          />
        ))}

        {/* Radial glow overlay */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height * 0.6}
          fill="url(#glow)"
        />
      </Svg>
    </View>
  );
}
