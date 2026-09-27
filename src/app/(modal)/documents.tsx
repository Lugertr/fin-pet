// src/app/(modal)/documents.tsx
// «Документы» — список PDF-документов из content/documents.json. Пока список
// пустой (решение пользователя 27.09.2026): экран показывает пустое
// состояние; просмотр PDF добавится вместе с самими файлами.

import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { SubpageHeader } from '@/components/shared';
import { getLocalContentRepository } from '@/data/content';
import { createProgressSubpageStyles } from '@/styles/screens/modal/_progress-subpage.styles';
import { useResponsive, useTheme } from '@/theme';
import { colorPalettes } from '@/theme/tokens';

const DOCUMENTS = getLocalContentRepository().getDocumentsSync();

export default function DocumentsScreen() {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createProgressSubpageStyles({ theme });

  return (
    <View style={styles.container}>
      <SubpageHeader title="Документы" subtitle="правила и материалы в PDF" help="documents" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {DOCUMENTS.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={scale(48)} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { fontSize: scaledFont('lg') }]}>
              Документов пока нет
            </Text>
            <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
              Скоро здесь появятся документы в PDF
            </Text>
          </View>
        ) : (
          DOCUMENTS.map((doc) => (
            <View key={doc.id} style={[styles.itemCard, styles.operationRow]} accessible>
              <Ionicons
                name="document-text-outline"
                size={scale(26)}
                color={colorPalettes.emerald[500]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { fontSize: scaledFont('lg') }]}>{doc.title}</Text>
                <Text style={[styles.itemText, { fontSize: scaledFont('md') }]}>
                  {doc.description}
                </Text>
              </View>
              <Text style={[styles.itemText, { fontSize: scaledFont('sm') }]}>PDF</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
