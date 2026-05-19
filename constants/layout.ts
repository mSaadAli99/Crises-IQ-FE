import { TextStyle, ViewStyle } from 'react-native';

/** Use on flex children that contain text — prevents row overflow on narrow screens. */
export const textShrink: TextStyle = {
  flexShrink: 1,
  minWidth: 0,
};

export const card: ViewStyle = {
  backgroundColor: '#161B22',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#30363D',
  overflow: 'hidden',
};

export const screenPadding = 16;
export const tabBarClearance = 100;
