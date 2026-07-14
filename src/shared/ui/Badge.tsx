import { Text, View } from 'react-native';

interface BadgeProps {
  icon: string;
  value: number | string;
  variant?: 'coins' | 'savings' | 'level' | 'streak';
}

const variantClasses = {
  coins: 'bg-yellow-100 border-yellow-300',
  savings: 'bg-green-100 border-green-300',
  level: 'bg-purple-100 border-purple-300',
  streak: 'bg-orange-100 border-orange-300',
};

export function Badge({ icon, value, variant = 'coins' }: BadgeProps) {
  return (
    <View
      className={`flex-row items-center px-3 py-1.5 rounded-full border ${variantClasses[variant]}`}
    >
      <Text className="text-base mr-1">{icon}</Text>
      <Text className="text-sm font-bold text-text">{value}</Text>
    </View>
  );
}
