// src/components/adultSection/PinGate/PinGate.tsx
// Барьер входа в раздел для взрослого — настоящий 4-значный PIN-код (по
// решению пользователя заменяет арифметический пример §17.1 ТЗ как основной
// гейт). Владеет собственной стейт-машиной: первичная настройка PIN,
// повторный вход, восстановление через арифметический пример (когда PIN
// забыт — в приложении без аккаунтов это единственный правдоподобный способ
// подтвердить, что за экраном взрослый).
//
// Арифметический гейт (ParentalGate/generateArithmeticChallenge) не удалён —
// переиспользуется как есть в роли recovery-проверки.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { HelpButton } from '@/components/shared';
import { IconButton } from '@/components/ui';
import {
  ArithmeticChallenge,
  generateArithmeticChallenge,
} from '@/domain/parentalGate/ParentalGate';
import type { IconName } from '@/types/icons';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { setPin as savePin, verifyPin } from '@/lib/security/parentalPin';
import { useResponsive, useTheme } from '@/theme';
import { ParentalGate } from '../ParentalGate';
import { PinPad } from '../PinPad';
import { createPinGateStyles } from './PinGate.styles';

type Mode =
  | 'setup-enter'
  | 'setup-confirm'
  | 'entry'
  | 'recovery-arithmetic'
  | 'recovery-set-enter'
  | 'recovery-set-confirm';

const COPY: Record<Mode, { title: string; subtitle: string }> = {
  'setup-enter': {
    title: 'Придумай PIN-код',
    subtitle: 'Введи 4 цифры, чтобы защитить раздел для взрослых',
  },
  'setup-confirm': {
    title: 'Повтори PIN-код',
    subtitle: 'Введи те же 4 цифры ещё раз',
  },
  entry: {
    title: 'Раздел для взрослых',
    subtitle: 'Введи PIN-код из четырёх цифр, который ты задал при первом входе.',
  },
  'recovery-arithmetic': { title: '', subtitle: '' }, // рендерится отдельно, через ParentalGate
  'recovery-set-enter': {
    title: 'Новый PIN-код',
    subtitle: 'Придумай новый 4-значный код',
  },
  'recovery-set-confirm': {
    title: 'Повтори новый PIN-код',
    subtitle: 'Введи те же 4 цифры ещё раз',
  },
};

/** Открытый замок при входе (разблокировать), закрытый — когда PIN только
 * создаётся/меняется (setup/recovery-set). */
const BADGE_ICON_BY_MODE: Record<Mode, IconName> = {
  'setup-enter': 'lock-closed',
  'setup-confirm': 'lock-closed',
  entry: 'lock-open',
  'recovery-arithmetic': 'lock-closed',
  'recovery-set-enter': 'lock-closed',
  'recovery-set-confirm': 'lock-closed',
};

export function PinGate({
  initialMode,
  onUnlocked,
  onBack,
}: {
  initialMode: 'setup' | 'entry';
  onUnlocked: () => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createPinGateStyles({ theme });

  const [mode, setMode] = useState<Mode>(initialMode === 'setup' ? 'setup-enter' : 'entry');
  const [digits, setDigits] = useState('');
  const [pendingPin, setPendingPin] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const [challenge, setChallenge] = useState<ArithmeticChallenge>(() =>
    generateArithmeticChallenge()
  );
  const [arithmeticAnswer, setArithmeticAnswer] = useState('');
  const [arithmeticError, setArithmeticError] = useState(false);

  const handleDigit = async (digit: string) => {
    if (digits.length >= 4) return;
    const next = digits + digit;

    if (next.length < 4) {
      setDigits(next);
      return;
    }

    // 4-я цифра введена — сразу обрабатываем, экран не ждёт отдельного тапа "Готово"
    setDigits(next);

    if (mode === 'setup-enter') {
      setPendingPin(next);
      setError(false);
      setTimeout(() => {
        setDigits('');
        setMode('setup-confirm');
      }, 150);
      return;
    }

    if (mode === 'setup-confirm') {
      if (next === pendingPin) {
        await savePin(next);
        triggerHaptic('success');
        onUnlocked();
      } else {
        triggerHaptic('error');
        setError(true);
        setTimeout(() => {
          setError(false);
          setDigits('');
          setPendingPin(null);
          setMode('setup-enter');
        }, 500);
      }
      return;
    }

    if (mode === 'entry') {
      const ok = await verifyPin(next);
      if (ok) {
        triggerHaptic('success');
        onUnlocked();
      } else {
        triggerHaptic('error');
        setError(true);
        setTimeout(() => {
          setError(false);
          setDigits('');
        }, 500);
      }
      return;
    }

    if (mode === 'recovery-set-enter') {
      setPendingPin(next);
      setError(false);
      setTimeout(() => {
        setDigits('');
        setMode('recovery-set-confirm');
      }, 150);
      return;
    }

    if (mode === 'recovery-set-confirm') {
      if (next === pendingPin) {
        await savePin(next);
        triggerHaptic('success');
        onUnlocked();
      } else {
        triggerHaptic('error');
        setError(true);
        setTimeout(() => {
          setError(false);
          setDigits('');
          setPendingPin(null);
          setMode('recovery-set-enter');
        }, 500);
      }
    }
  };

  const handleBackspace = () => {
    setError(false);
    setDigits((d) => d.slice(0, -1));
  };

  const handleForgotPin = () => {
    setChallenge(generateArithmeticChallenge());
    setArithmeticAnswer('');
    setArithmeticError(false);
    setDigits('');
    setError(false);
    setMode('recovery-arithmetic');
  };

  const handleCheckArithmetic = () => {
    if (Number(arithmeticAnswer) === challenge.answer) {
      triggerHaptic('success');
      setPendingPin(null);
      setDigits('');
      setMode('recovery-set-enter');
      return;
    }
    triggerHaptic('error');
    setArithmeticError(true);
    setArithmeticAnswer('');
    setChallenge(generateArithmeticChallenge());
  };

  if (mode === 'recovery-arithmetic') {
    return (
      <ParentalGate
        challenge={challenge}
        answer={arithmeticAnswer}
        gateError={arithmeticError}
        onAnswerChange={(text) => {
          setArithmeticAnswer(text.replace(/[^0-9-]/g, ''));
          setArithmeticError(false);
        }}
        onCheck={handleCheckArithmetic}
        onBack={() => setMode('entry')}
      />
    );
  }

  const { title, subtitle } = COPY[mode];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <IconButton icon="arrow-back" onPress={onBack} variant="surface" />
          <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>Родителям</Text>
          <HelpButton screen="parents" />
        </View>
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={theme.gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBadge}
        >
          <Ionicons name={BADGE_ICON_BY_MODE[mode]} size={scale(36)} color={theme.onGradient} />
        </LinearGradient>

        <Text style={[styles.title, { fontSize: scaledFont('xl') }]}>{title}</Text>
        <Text style={[styles.subtitle, { fontSize: scaledFont('md') }]}>{subtitle}</Text>

        {error && <Text style={styles.errorText}>Не совпадает, попробуйте ещё раз</Text>}

        <PinPad
          filledCount={digits.length}
          error={error}
          onDigit={handleDigit}
          onBackspace={handleBackspace}
        />

        <View style={styles.linksRow}>
          {mode === 'entry' && (
            <TouchableOpacity onPress={handleForgotPin}>
              <Text style={styles.link}>Забыли PIN-код?</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.linkMuted}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
