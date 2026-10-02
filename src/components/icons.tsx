import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';

type P = { color?: string; size?: number };

export const BackIcon = ({ color = colors.slate, size = 18 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);
export const CloseIcon = ({ color = colors.slate, size = 18 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <Path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const PlusIcon = ({ color = colors.onSlate, size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);
export const TodayIcon = ({ color = colors.slate, size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={8} />
    <Path d="M12 8v4l3 2" />
  </Svg>
);
export const TrendIcon = ({ color = colors.slate, size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 17l6-6 4 4 8-8" />
    <Path d="M15 7h6v6" />
  </Svg>
);
export const MoonIcon = ({ color = colors.slateMid, size = 18 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Svg>
);
export const CheckIcon = ({ color = colors.onSlate, size = 12 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Path d="m5 12 5 5 9-10" />
  </Svg>
);
export const CameraIcon = ({ color = colors.onSlateMuted, size = 28 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <Circle cx={12} cy={13} r={3.5} />
  </Svg>
);
export const UpIcon = ({ color = colors.win, size = 18 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="m4 15 6-6 4 4 6-6" />
    <Path d="M14 7h6v6" />
  </Svg>
);
export const ChevronIcon = ({ color = colors.slate, size = 18 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="m9 18 6-6-6-6" />
  </Svg>
);
