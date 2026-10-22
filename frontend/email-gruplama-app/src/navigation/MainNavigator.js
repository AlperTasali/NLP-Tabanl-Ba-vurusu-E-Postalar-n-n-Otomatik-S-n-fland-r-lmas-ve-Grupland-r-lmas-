import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompanyProfileScreen from '../screens/CompanyProfileScreen';
import IMAPSettingsScreen from '../screens/IMAPSettingsScreen';
import TestEmailScreen from '../screens/TestEmailScreen';
import colors from '../constants/colors';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CompanyProfile"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="CompanyProfile"
        component={CompanyProfileScreen}
        options={{ title: 'Şirket' }}
      />
      <Stack.Screen
        name="IMAPSettings"
        component={IMAPSettingsScreen}
        options={{ title: 'IMAP Ayarları' }}
      />
      <Stack.Screen
        name="TestEmail"
        component={TestEmailScreen}
        options={{ title: 'Test E-postası' }}
      />
    </Stack.Navigator>
  );
}