// components/charts/SpiderChart.tsx
// Spider Chart на SVG — работает на всех платформах без CanvasKit

import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import Svg, { G, Line, Polygon, Circle as SvgCircle } from 'react-native-svg';

import { useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, fontWeights } from '@/theme/tokens';

interface SpiderChartProps {
  data: { label: string; value: number }[];
  color?: string;
  size?: number;
}

export function SpiderChart({ data, color, size: propSize }: SpiderChartProps) {
  const { theme } = useTheme();
  const resolvedColor = color ?? theme.primary;
  const { width } = useWindowDimensions();
  const size = propSize ?? Math.min(width - 80, 300);
  const padding = 40;
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = (size - padding * 2) / 2;
  const numPoints = data.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Вычисляем точку на графике
  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = (Math.max(0, Math.min(100, value)) / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // Конвертируем массив точек в строку для Polygon
  const pointsToString = (points: { x: number; y: number }[]): string => {
    return points.map((p) => `${p.x},${p.y}`).join(' ');
  };

  // Точки данных
  const dataPoints = useMemo(() => {
    return data.map((d, i) => getPoint(i, d.value));
  }, [data, maxRadius]);

  // Уровни сетки
  const gridLevels = [25, 50, 75, 100];

  // Оси
  const axisLines = useMemo(() => {
    return data.map((_, i) => {
      const endPoint = getPoint(i, 100);
      return {
        x1: centerX,
        y1: centerY,
        x2: endPoint.x,
        y2: endPoint.y,
      };
    });
  }, [data, maxRadius]);

  // Позиции подписей
  const labelPositions = useMemo(() => {
    return data.map((d, i) => {
      const point = getPoint(i, 115);
      const angle = i * angleStep - Math.PI / 2;

      let textAlign: 'left' | 'center' | 'right' = 'center';
      if (Math.cos(angle) > 0.3) textAlign = 'left';
      else if (Math.cos(angle) < -0.3) textAlign = 'right';

      return {
        x: point.x,
        y: point.y,
        textAlign,
        label: d.label,
        value: d.value,
      };
    });
  }, [data, maxRadius]);

  return (
    <View style={{ width: size, height: size + 60 }}>
      {/* SVG Spider Chart */}
      <Svg width={size} height={size}>
        {/* Сетка */}
        <G>
          {gridLevels.map((level, i) => {
            const points = data.map((_, idx) => getPoint(idx, level));
            return (
              <Polygon
                key={`grid-${i}`}
                points={pointsToString(points)}
                fill="none"
                stroke={theme.border}
                strokeWidth={1}
                opacity={0.6}
              />
            );
          })}
        </G>

        {/* Оси */}
        <G>
          {axisLines.map((line, i) => (
            <Line
              key={`axis-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={theme.divider}
              strokeWidth={1}
              opacity={0.5}
            />
          ))}
        </G>

        {/* Заливка данных */}
        <Polygon
          points={pointsToString(dataPoints)}
          fill={withAlpha(resolvedColor, 0.251)}
          stroke={resolvedColor}
          strokeWidth={2.5}
        />

        {/* Точки данных с свечением */}
        <G>
          {dataPoints.map((point, i) => (
            <G key={`point-${i}`}>
              {/* Внешнее свечение */}
              <SvgCircle cx={point.x} cy={point.y} r={7} fill={withAlpha(resolvedColor, 0.188)} />
              {/* Основная точка */}
              <SvgCircle
                cx={point.x}
                cy={point.y}
                r={4}
                fill={resolvedColor}
                stroke="white"
                strokeWidth={1.5}
              />
            </G>
          ))}
        </G>

        {/* Центральная точка */}
        <SvgCircle cx={centerX} cy={centerY} r={2} fill={theme.textMuted} />
      </Svg>

      {/* Подписи через обычные View/Text */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          pointerEvents: 'none',
        }}
      >
        {labelPositions.map((pos, i) => (
          <View
            key={`label-${i}`}
            style={{
              position: 'absolute',
              left: pos.x - 40,
              top: pos.y - 14,
              width: 80,
              alignItems:
                pos.textAlign === 'center'
                  ? 'center'
                  : pos.textAlign === 'left'
                    ? 'flex-start'
                    : 'flex-end',
            }}
          >
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                textAlign: pos.textAlign,
                fontWeight: fontWeights.medium,
                width: 80,
              }}
              numberOfLines={1}
            >
              {pos.label}
            </Text>
            <Text
              style={{
                color: resolvedColor,
                fontSize: 11,
                fontWeight: 'bold',
                textAlign: pos.textAlign,
                width: 80,
              }}
            >
              {pos.value}%
            </Text>
          </View>
        ))}
      </View>

      {/* Легенда снизу */}
      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: circleRadius(12),
            backgroundColor: withAlpha(resolvedColor, 0.376),
            borderWidth: 2,
            borderColor: resolvedColor,
          }}
        />
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Уровень компетенций</Text>
      </View>
    </View>
  );
}
