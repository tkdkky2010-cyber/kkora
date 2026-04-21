export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  Checklist: undefined;
  Challenge: { challengeId: string };
  Result: { challengeId: string };
  Profile: undefined;
  History: undefined;
  Settings: undefined;
  Charge: undefined;
  Withdraw: undefined;
  DisputeList: undefined;
  DisputeSubmit: { challengeId?: string } | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
