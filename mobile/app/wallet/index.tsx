import React from 'react';
import { Redirect } from 'expo-router';

export default function WalletIndexRedirect() {
  return <Redirect href="/(tabs)/wallet" />;
}
