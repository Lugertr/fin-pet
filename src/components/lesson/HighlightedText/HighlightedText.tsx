// src/components/lesson/HighlightedText/HighlightedText.tsx
// Рендерит текст карточки урока, выделяя **term**-сегменты цветной пилюлей.

import { Text, TextStyle } from 'react-native';

import { parseInlineHighlights } from '@/lib/utils/richText';
import { useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontWeights } from '@/theme/tokens';

export function HighlightedText({
  text,
  style,
  highlightStyle,
}: {
  text: string;
  style?: TextStyle;
  highlightStyle?: TextStyle;
}) {
  const { theme } = useTheme();
  const segments = parseInlineHighlights(text);

  return (
    <Text style={style}>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <Text
            key={index}
            style={[
              {
                color: theme.primary,
                fontWeight: fontWeights.bold,
                backgroundColor: withAlpha(theme.primary, 0.102),
              },
              highlightStyle,
            ]}
          >
            {segment.text}
          </Text>
        ) : (
          <Text key={index}>{segment.text}</Text>
        )
      )}
    </Text>
  );
}
