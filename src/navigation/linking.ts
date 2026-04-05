import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from '../types/navigation';

const prefix = Linking.createURL('/');

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, 'kkora://'],
  config: {
    screens: {
      Home: '',
      Challenge: 'challenge/:challengeId',
      Result: 'result/:challengeId',
      Profile: 'profile',
      Charge: 'charge',
      History: 'history',
      Settings: 'settings',
      Checklist: 'checklist',
      Onboarding: 'onboarding',
      Login: 'login',
      Withdraw: 'withdraw',
    },
  },
};
