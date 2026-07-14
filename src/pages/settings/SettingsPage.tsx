import { useGameStore } from '@/app/providers/store';
import { Button, Card } from '@/shared/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, setParentPin, removeParentPin, verifyParentPin, resetGame } =
    useGameStore();

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<'set' | 'change' | 'remove'>('set');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const hasPin = !!settings.parentPinHash;

  const handleOpenPinModal = (mode: 'set' | 'change' | 'remove') => {
    setPinMode(mode);
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const handlePinSubmit = () => {
    if (pinInput.length !== 4) {
      setPinError('PIN должен содержать 4 цифры');
      return;
    }
    if (!/^\d{4}$/.test(pinInput)) {
      setPinError('PIN должен содержать только цифры');
      return;
    }

    if (pinMode === 'set' || pinMode === 'change') {
      setParentPin(pinInput);
      setShowPinModal(false);
      Alert.alert('Успешно', 'Родительский PIN установлен');
    } else if (pinMode === 'remove') {
      const success = removeParentPin(pinInput);
      if (success) {
        setShowPinModal(false);
        Alert.alert('Успешно', 'Родительский PIN удалён');
      } else {
        setPinError('Неверный PIN');
      }
    }
  };

  const handleResetGame = () => {
    if (!hasPin) {
      Alert.alert('Требуется PIN', 'Для сброса прогресса сначала установите родительский PIN', [
        { text: 'OK' },
      ]);
      return;
    }
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    resetGame();
    setShowResetConfirm(false);
    router.replace('/auth/welcome');
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 pt-12 pb-8">
        {/* Шапка */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="p-2 mr-2">
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-text">Настройки</Text>
        </View>

        {/* Уведомления */}
        <Card className="mb-4">
          <Text className="text-lg font-bold text-text mb-3">🔔 Уведомления</Text>
          <ToggleRow
            label="Напоминания о заданиях"
            value={settings.notifications.quests}
            onChange={(v) =>
              updateSettings({
                notifications: { ...settings.notifications, quests: v },
              })
            }
          />
          <ToggleRow
            label="Питомец голоден"
            value={settings.notifications.petHungry}
            onChange={(v) =>
              updateSettings({
                notifications: { ...settings.notifications, petHungry: v },
              })
            }
          />
          <ToggleRow
            label="Мотивационные сообщения"
            value={settings.notifications.motivation}
            onChange={(v) =>
              updateSettings({
                notifications: { ...settings.notifications, motivation: v },
              })
            }
          />
        </Card>

        {/* Звук */}
        <Card className="mb-4">
          <ToggleRow
            label="🔊 Звуковые эффекты"
            value={settings.soundEnabled}
            onChange={(v) => updateSettings({ soundEnabled: v })}
          />
        </Card>

        {/* Родительский режим */}
        <Card className="mb-4">
          <Text className="text-lg font-bold text-text mb-3">🔒 Родительский режим</Text>
          <Text className="text-sm text-gray-500 mb-3">
            PIN-код нужен для сброса прогресса и изменения важных настроек
          </Text>
          {hasPin ? (
            <View className="gap-2">
              <Pressable
                onPress={() => handleOpenPinModal('change')}
                className="bg-secondary py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white text-center font-semibold">Изменить PIN</Text>
              </Pressable>
              <Pressable
                onPress={() => handleOpenPinModal('remove')}
                className="bg-gray-200 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-text text-center font-semibold">Удалить PIN</Text>
              </Pressable>
            </View>
          ) : (
            <Button title="Установить PIN" onPress={() => handleOpenPinModal('set')} fullWidth />
          )}
        </Card>

        {/* Опасная зона */}
        <Card className="mb-4 border-2 border-red-200">
          <Text className="text-lg font-bold text-red-600 mb-2">⚠️ Опасная зона</Text>
          <Text className="text-sm text-gray-500 mb-3">
            Сброс удалит весь прогресс, питомца и монеты. Это действие нельзя отменить.
          </Text>
          <Pressable
            onPress={handleResetGame}
            className="bg-red-500 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-white text-center font-semibold">Сбросить прогресс</Text>
          </Pressable>
        </Card>

        {/* О приложении */}
        <Card>
          <Text className="text-lg font-bold text-text mb-2">ℹ️ О приложении</Text>
          <Text className="text-sm text-gray-500">Версия: 1.0.0</Text>
          <Text className="text-sm text-gray-500">Хакатон LCT 2025</Text>
          <Text className="text-sm text-gray-500 mt-2">
            Финансовый питомец — приложение для обучения детей финансовой грамотности через игру.
          </Text>
        </Card>
      </View>

      {/* Модалка ввода PIN */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-xl font-bold text-text mb-2">
              {pinMode === 'set' && 'Установить PIN'}
              {pinMode === 'change' && 'Новый PIN'}
              {pinMode === 'remove' && 'Введите текущий PIN'}
            </Text>
            <Text className="text-sm text-gray-500 mb-4">Введите 4 цифры</Text>
            <TextInput
              value={pinInput}
              onChangeText={(text) => {
                setPinInput(text.replace(/\D/g, '').slice(0, 4));
                setPinError('');
              }}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              className="bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 text-2xl text-center tracking-widest text-text"
              placeholder="••••"
            />
            {pinError ? <Text className="text-red-500 text-sm mt-2">{pinError}</Text> : null}
            <View className="flex-row gap-2 mt-4">
              <Pressable
                onPress={() => setShowPinModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-text text-center font-semibold">Отмена</Text>
              </Pressable>
              <Pressable
                onPress={handlePinSubmit}
                disabled={pinInput.length !== 4}
                className={`flex-1 py-3 rounded-xl active:opacity-80 ${
                  pinInput.length === 4 ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    pinInput.length === 4 ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  Подтвердить
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модалка подтверждения сброса */}
      <Modal
        visible={showResetConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetConfirm(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-xl font-bold text-red-600 mb-2">Точно сбросить?</Text>
            <Text className="text-sm text-gray-500 mb-4">
              Весь прогресс будет удалён без возможности восстановления.
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-text text-center font-semibold">Отмена</Text>
              </Pressable>
              <Pressable
                onPress={confirmReset}
                className="flex-1 bg-red-500 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white text-center font-semibold">Сбросить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
    >
      <Text className="text-base text-text flex-1">{label}</Text>
      <View
        className={`w-12 h-7 rounded-full justify-center px-1 ${
          value ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <View className={`w-5 h-5 bg-white rounded-full ${value ? 'self-end' : 'self-start'}`} />
      </View>
    </Pressable>
  );
}
