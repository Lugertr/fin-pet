import { useGameStore } from '@/app/providers/store';
import { Card } from '@/shared/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export function DebugPage() {
  const router = useRouter();
  const store = useGameStore();
  const {
    pet,
    finances,
    inventory,
    dailyQuests,
    achievements,
    activeAdventure,
    addCoins,
    setCoins,
    setPetLevel,
    setPetHunger,
    setPetHappiness,
    setPetEnergy,
    levelUpPet,
    maxPetStats,
    completeAllQuests,
    unlockAllAchievements,
    giveAllItems,
    startRandomAdventure,
    completeActiveAdventure,
    removeActiveAdventure,
    resetGame,
  } = store;

  const [coinsInput, setCoinsInput] = useState('');
  const [levelInput, setLevelInput] = useState('');
  const [hungerInput, setHungerInput] = useState('');
  const [happinessInput, setHappinessInput] = useState('');
  const [energyInput, setEnergyInput] = useState('');

  const handleResetGame = () => {
    Alert.alert('Warning', 'Delete all progress?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetGame();
          router.replace('/auth/welcome');
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 pt-12 pb-8">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="p-2 mr-2">
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-text">🔧 Debug</Text>
        </View>

        <Card className="mb-4">
          <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">State</Text>
          <Text className="text-sm text-text">
            🪙 {finances.coins} | 🐱 Lv.{pet?.level ?? '-'} | 📦 {inventory.length}
          </Text>
          <Text className="text-sm text-text">
            📚 {dailyQuests.filter((q) => q.completed).length}/{dailyQuests.length} | 🏆{' '}
            {achievements.filter((a) => a.unlocked).length}/{achievements.length}
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-text mb-3">💰 Coins</Text>
          <View className="flex-row gap-2 mb-3">
            <DevButton label="+100" onPress={() => addCoins(100)} />
            <DevButton label="+500" onPress={() => addCoins(500)} />
            <DevButton label="+1000" onPress={() => addCoins(1000)} />
          </View>
          <View className="flex-row gap-2">
            <TextInput
              value={coinsInput}
              onChangeText={setCoinsInput}
              placeholder="Amount"
              keyboardType="numeric"
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-text"
              placeholderTextColor="#999"
            />
            <DevButton
              label="Set"
              onPress={() => {
                const v = parseInt(coinsInput, 10);
                if (!isNaN(v)) {
                  setCoins(v);
                  setCoinsInput('');
                }
              }}
            />
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-text mb-3">🐱 Pet</Text>
          <View className="gap-2 mb-3">
            <DevButton label="Level +1" onPress={levelUpPet} disabled={!pet} />
            <DevButton label="Max stats" onPress={maxPetStats} disabled={!pet} />
          </View>
          <Text className="text-sm text-gray-500 mb-2">Set level:</Text>
          <View className="flex-row gap-2 mb-3">
            <TextInput
              value={levelInput}
              onChangeText={setLevelInput}
              placeholder="1-50"
              keyboardType="numeric"
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-text"
              placeholderTextColor="#999"
            />
            <DevButton
              label="Set"
              onPress={() => {
                const v = parseInt(levelInput, 10);
                if (!isNaN(v) && v > 0) {
                  setPetLevel(v);
                  setLevelInput('');
                }
              }}
              disabled={!pet}
            />
          </View>
          <Text className="text-sm text-gray-500 mb-2">Hunger (0-100):</Text>
          <View className="flex-row gap-2 mb-3">
            <TextInput
              value={hungerInput}
              onChangeText={setHungerInput}
              placeholder="0-100"
              keyboardType="numeric"
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-text"
              placeholderTextColor="#999"
            />
            <DevButton
              label="Set"
              onPress={() => {
                const v = parseInt(hungerInput, 10);
                if (!isNaN(v)) {
                  setPetHunger(v);
                  setHungerInput('');
                }
              }}
              disabled={!pet}
            />
          </View>
          <Text className="text-sm text-gray-500 mb-2">Happiness (0-100):</Text>
          <View className="flex-row gap-2 mb-3">
            <TextInput
              value={happinessInput}
              onChangeText={setHappinessInput}
              placeholder="0-100"
              keyboardType="numeric"
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-text"
              placeholderTextColor="#999"
            />
            <DevButton
              label="Set"
              onPress={() => {
                const v = parseInt(happinessInput, 10);
                if (!isNaN(v)) {
                  setPetHappiness(v);
                  setHappinessInput('');
                }
              }}
              disabled={!pet}
            />
          </View>
          <Text className="text-sm text-gray-500 mb-2">Energy (0-100):</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={energyInput}
              onChangeText={setEnergyInput}
              placeholder="0-100"
              keyboardType="numeric"
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-text"
              placeholderTextColor="#999"
            />
            <DevButton
              label="Set"
              onPress={() => {
                const v = parseInt(energyInput, 10);
                if (!isNaN(v)) {
                  setPetEnergy(v);
                  setEnergyInput('');
                }
              }}
              disabled={!pet}
            />
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-text mb-3">📚 Quests</Text>
          <DevButton
            label={`Complete all (${dailyQuests.filter((q) => !q.completed).length} left)`}
            onPress={completeAllQuests}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-text mb-3">🏆 Achievements</Text>
          <DevButton
            label={`Unlock all (${achievements.filter((a) => !a.unlocked).length} locked)`}
            onPress={unlockAllAchievements}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-text mb-3">🛍️ Inventory</Text>
          <DevButton label="Give all items" onPress={giveAllItems} />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-text mb-3">🗺️ Adventures</Text>
          <View className="gap-2">
            <DevButton
              label="Start random (10s)"
              onPress={startRandomAdventure}
              disabled={!!activeAdventure}
            />
            <DevButton
              label="Complete active"
              onPress={completeActiveAdventure}
              disabled={!activeAdventure}
            />
            <DevButton
              label="Remove active"
              onPress={removeActiveAdventure}
              disabled={!activeAdventure}
            />
          </View>
        </Card>

        <Card className="mb-4 border-2 border-red-200">
          <Text className="text-lg font-bold text-red-600 mb-3">⚠️ Reset</Text>
          <Pressable
            onPress={handleResetGame}
            className="bg-red-500 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-white text-center font-semibold">Reset game</Text>
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}

function DevButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`py-3 px-4 rounded-xl active:opacity-80 ${
        disabled ? 'bg-gray-200' : 'bg-blue-500'
      }`}
    >
      <Text className={`text-center font-semibold ${disabled ? 'text-gray-400' : 'text-white'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
