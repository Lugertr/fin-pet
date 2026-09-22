// lib/security/parentalPin.ts
// Хранилище PIN-кода родительского раздела (замена арифметического примера
// §17.1 ТЗ по решению пользователя — см. план редизайна профиля). PIN хранится
// как обычная 4-значная строка без дополнительного хеширования: SecureStore
// уже шифрует данные на уровне OS Keychain/Keystore, а хеш 4-значного кода не
// даёт значимой доп.защиты против ребёнка с доступом к устройству.
//
// SecureStore недоступен на вебе — тот же паттерн Platform.OS === 'web'
// фолбэка на AsyncStorage, что уже используется в services/feedback.ts.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PIN_KEY = 'finsputnik_parental_pin_v1';

async function readPin(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(PIN_KEY);
  }
  return SecureStore.getItemAsync(PIN_KEY);
}

async function writePin(pin: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(PIN_KEY, pin);
    return;
  }
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

async function removePin(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(PIN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(PIN_KEY);
}

export async function hasPinSet(): Promise<boolean> {
  const pin = await readPin();
  return pin !== null;
}

export async function setPin(pin: string): Promise<void> {
  await writePin(pin);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await readPin();
  return stored !== null && stored === pin;
}

export async function clearPin(): Promise<void> {
  await removePin();
}
