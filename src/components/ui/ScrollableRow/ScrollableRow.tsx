// src/components/ui/ScrollableRow/ScrollableRow.tsx
// Обёртка над горизонтальным ScrollView — показывает стрелки по краям, когда
// есть куда проскроллить в эту сторону. Факт «это можно проскроллить» не
// всегда очевиден без явной подсказки — особенно на широких экранах, где
// узкая лента вкладок легко принимается за полный список, обрезанный по
// ширине. Стрелки ещё и кликабельны — доскроллить на «страницу» за один тап,
// полезно на вебе, где нет тачскролла свайпом.

import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { circleRadius } from '@/theme/tokens';
import { useResponsive, useTheme } from '@/theme';
import { createScrollableRowStyles } from './ScrollableRow.styles';

const EDGE_THRESHOLD = 4; // px допуска, чтобы стрелка не мигала прямо на границе
const ARROW_SIZE = 28;

interface ScrollableRowProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** Для карусели со снэпом по карточке (см. Step3PetType.tsx) — стрелка
   * тогда тоже листает ровно на один снэп-интервал, а не на 80% вьюпорта. */
  snapToInterval?: number;
  decelerationRate?: ScrollViewProps['decelerationRate'];
}

export function ScrollableRow({
  children,
  contentContainerStyle,
  style,
  snapToInterval,
  decelerationRate,
}: ScrollableRowProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const styles = createScrollableRowStyles({ theme });

  const scrollRef = useRef<ScrollView>(null);
  const scrollXRef = useRef(0);
  const contentWidthRef = useRef(0);
  const viewportWidthRef = useRef(0);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const refreshArrows = () => {
    const maxScroll = Math.max(0, contentWidthRef.current - viewportWidthRef.current);
    setCanScrollLeft(scrollXRef.current > EDGE_THRESHOLD);
    setCanScrollRight(scrollXRef.current < maxScroll - EDGE_THRESHOLD);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollXRef.current = event.nativeEvent.contentOffset.x;
    refreshArrows();
  };

  const handleContentSizeChange = (width: number) => {
    contentWidthRef.current = width;
    refreshArrows();
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    viewportWidthRef.current = event.nativeEvent.layout.width;
    refreshArrows();
  };

  const scrollByPage = (direction: 1 | -1) => {
    const step = snapToInterval ?? viewportWidthRef.current * 0.8;
    const maxScroll = Math.max(0, contentWidthRef.current - viewportWidthRef.current);
    const nextX = Math.max(0, Math.min(maxScroll, scrollXRef.current + direction * step));
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  };

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
        snapToInterval={snapToInterval}
        decelerationRate={decelerationRate}
      >
        {children}
      </ScrollView>

      {canScrollLeft && (
        <TouchableOpacity
          onPress={() => scrollByPage(-1)}
          activeOpacity={0.8}
          style={[styles.arrow, styles.arrowLeft]}
        >
          <View
            style={[
              styles.arrowBadge,
              {
                width: scale(ARROW_SIZE),
                height: scale(ARROW_SIZE),
                borderRadius: circleRadius(scale(ARROW_SIZE)),
              },
            ]}
          >
            <Ionicons name="chevron-back" size={scale(16)} color={theme.textPrimary} />
          </View>
        </TouchableOpacity>
      )}
      {canScrollRight && (
        <TouchableOpacity
          onPress={() => scrollByPage(1)}
          activeOpacity={0.8}
          style={[styles.arrow, styles.arrowRight]}
        >
          <View
            style={[
              styles.arrowBadge,
              {
                width: scale(ARROW_SIZE),
                height: scale(ARROW_SIZE),
                borderRadius: circleRadius(scale(ARROW_SIZE)),
              },
            ]}
          >
            <Ionicons name="chevron-forward" size={scale(16)} color={theme.textPrimary} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
