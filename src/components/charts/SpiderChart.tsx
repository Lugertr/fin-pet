// components/charts/SpiderChart.tsx
// Spider Chart на SVG — работает на всех платформах без CanvasKit

import { COLORS } from '@/constants/theme';
import { useMemo } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Svg, { G, Line, Polygon, Circle as SvgCircle } from 'react-native-svg';

interface SpiderChartProps {
  data: { label: string; value: number }[];
  color?: string;
  size?: number;
}

export function SpiderChart({ data, color = COLORS.primary, size: propSize }: SpiderChartProps) {
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
                stroke="#334155"
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
              stroke="#475569"
              strokeWidth={1}
              opacity={0.5}
            />
          ))}
        </G>

        {/* Заливка данных */}
        <Polygon
          points={pointsToString(dataPoints)}
          fill={`${color}40`}
          stroke={color}
          strokeWidth={2.5}
        />

        {/* Точки данных с свечением */}
        <G>
          {dataPoints.map((point, i) => (
            <G key={`point-${i}`}>
              {/* Внешнее свечение */}
              <SvgCircle cx={point.x} cy={point.y} r={7} fill={`${color}30`} />
              {/* Основная точка */}
              <SvgCircle
                cx={point.x}
                cy={point.y}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
              />
            </G>
          ))}
        </G>

        {/* Центральная точка */}
        <SvgCircle cx={centerX} cy={centerY} r={2} fill="#64748B" />
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
                color: COLORS.textSecondary,
                fontSize: 11,
                textAlign: pos.textAlign,
                fontWeight: '500',
                width: 80,
              }}
              numberOfLines={1}
            >
              {pos.label}
            </Text>
            <Text
              style={{
                color: color,
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
            borderRadius: 6,
            backgroundColor: `${color}60`,
            borderWidth: 2,
            borderColor: color,
          }}
        />
        <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>Уровень компетенций</Text>
      </View>
    </View>
  );
}
