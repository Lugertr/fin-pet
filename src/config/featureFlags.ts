// config/featureFlags.ts
// §26 ТЗ: полный набор флагов функций — content/features.json (данные, не код,
// тот же принцип, что content/*.json для учебного контента, §25).
//
// Большинство флагов здесь документируют, какие подсистемы реально собраны
// (все, кроме online_auth/content_sync_server/admin_panel — они по «Жёстким
// ограничениям» CLAUDE.md не будут реализованы вообще). Рантайм-переключателями
// являются только те, где выключение имеет однозначный смысл без риска
// оставить пользователя в противоречивом состоянии: ai_assistant_local
// (Этап 11 — заглушка чата), demo_mode и adult_section (Этап 12 — скрывают
// точки входа, не трогая уже накопленные данные).

import featuresJson from '../../content/features.json';

export type FeatureFlagKey = keyof typeof featuresJson.features;

export const FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = featuresJson.features;

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return FEATURE_FLAGS[flag] === true;
}
