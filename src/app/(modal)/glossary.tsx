// src/app/(modal)/glossary.tsx
// «Словарь игры» (макет): все слова игры простыми словами + поиск.
// Слова — в content/glossary.json (§25 ТЗ: контент отделён от UI).

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { SubpageHeader } from '@/components/shared';
import { getLocalContentRepository } from '@/data/content';
import { filterGlossary } from '@/domain/content/ReferenceContent';
import { createProgressSubpageStyles } from '@/styles/screens/modal/_progress-subpage.styles';
import { useResponsive, useTheme } from '@/theme';

const GLOSSARY = getLocalContentRepository().getGlossarySync();

export default function GlossaryScreen() {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createProgressSubpageStyles({ theme });
  const [query, setQuery] = useState('');
  const terms = filterGlossary(GLOSSARY, query);

  return (
    <View style={styles.container}>
      <SubpageHeader
        title="Словарь игры"
        subtitle="все слова игры простыми словами"
        help="glossary"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={scale(22)} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Найти слово"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { fontSize: scaledFont('lg') }]}
            accessibilityLabel="Найти слово"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        {terms.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { fontSize: scaledFont('lg') }]}>
              Такого слова пока нет
            </Text>
            <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
              Попробуй написать его по-другому или спроси у взрослого
            </Text>
          </View>
        ) : (
          terms.map((item) => (
            <View key={item.id} style={styles.itemCard} accessible>
              <Text style={[styles.itemTitle, { fontSize: scaledFont('lg') }]}>{item.term}</Text>
              <Text style={[styles.itemText, { fontSize: scaledFont('md') }]}>
                {item.definition}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
