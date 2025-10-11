import { Platform, StyleSheet } from 'react-native';

// ====================================================================
// 1. カラー定義 (Colors)
// ====================================================================

export const Colors = {
  // Main Palette (from index.tsx & CSS root)
  primary: 'hsl(210, 40%, 50%)',
  primaryForeground: 'hsl(0, 0%, 100%)', // White
  card: 'hsl(0, 0%, 100%)', // White
  muted: 'hsl(210, 40%, 96%)', // Light Grayish Blue
  mutedForeground: 'hsl(215, 10%, 45%)', // Dark Muted Gray
  border: 'hsl(210, 40%, 90%)', // Light Gray
  background: 'hsl(0, 0%, 100%)', // White
  destructive: 'hsl(0, 84.2%, 60.2%)', // Red
  greenSuccess: '#10B981', // Tailwind green-500
  
  // CSS変数からの追加: 標準テキスト色
  foreground: '#000000', // CSSの--foreground に近似
  
  // Derived Colors
  primaryLight: 'hsl(210, 40%, 50%, 0.1)', // ${Colors.primary}10 相当
  primaryBorder: 'hsl(210, 40%, 50%, 0.3)', // ${Colors.primary}30 相当
  primarySemiTransparent: 'hsl(210, 40%, 50%, 0.8)', // ${Colors.primary}CC 相当
  textSemiBlack: '#000000B3', // #000000B3 相当
  mutedOpacity: 'hsl(210, 40%, 96%, 0.7)', // ${Colors.muted}B3 相当
  greenDark: '#059669',
  greenLight: '#D1FAE5',
};

// ====================================================================
// 2. 基本的な定数
// ====================================================================

const FONT_SIZE_BASE = 16;
const FONT_WEIGHT_MEDIUM = '600';

// ====================================================================
// 3. スタイルシート (globalStyles)
// ====================================================================

export const globalStyles = StyleSheet.create({
  // --- レイアウト & コンテナ ---
  safeArea: { flex: 1, backgroundColor: Colors.background },
  appContainer: {
    flex: 1,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: Colors.background,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 80,
  },
  flexRow: { flexDirection: 'row', alignItems: 'center' },
  flexOne: { flex: 1 },
  
  // --- カード & シャドウ ---
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 1 },
      default: {},
    }),
  },

  // --- ヘッダー & ナビゲーション ---
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButtonBase: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 12,
  },
  navButtonLabel: {
    fontSize: 10, 
    marginTop: 4,
  },
  headerIconContainer: {
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: Colors.primary,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12,
  },

  // --- Typography ---
  textMutedForeground: { color: Colors.mutedForeground },
  textPrimary: { color: Colors.primary },
  textWhite: { color: Colors.primaryForeground },
  textSm: { fontSize: FONT_SIZE_BASE * 0.75 }, 
  textMd: { fontSize: FONT_SIZE_BASE * 0.875 }, 
  textBase: { fontSize: FONT_SIZE_BASE }, 
  textLg: { fontSize: FONT_SIZE_BASE * 1.125 }, 
  text2xl: { fontSize: FONT_SIZE_BASE * 1.5 }, 
  textBold: { fontWeight: 'bold' },
  textSemiBold: { fontWeight: FONT_WEIGHT_MEDIUM }, 
  
  headerTitleText: { 
    fontSize: FONT_SIZE_BASE * 1.125,
    fontWeight: FONT_WEIGHT_MEDIUM, 
    color: Colors.foreground,
  },
  headerSubtitleText: { 
    fontSize: FONT_SIZE_BASE * 0.75,
    color: Colors.mutedForeground, 
    marginTop: 2 
  },

  // --- Forms & Buttons ---
  inputBase: { 
    borderWidth: 1, 
    borderColor: Colors.border, 
    padding: 10, 
    borderRadius: 8, 
    backgroundColor: Colors.card,
    fontSize: FONT_SIZE_BASE, 
    color: Colors.foreground, // foreground を参照
  },
  label: { 
    fontSize: FONT_SIZE_BASE * 0.75, 
    fontWeight: FONT_WEIGHT_MEDIUM, 
    marginBottom: 4 
  },
  buttonPrimary: {
    height: 48, 
    borderRadius: 12, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: { 
    fontSize: FONT_SIZE_BASE, 
    color: Colors.primaryForeground, 
    fontWeight: FONT_WEIGHT_MEDIUM 
  },
  buttonSecondary: {
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // --- Content Sections ---
  contentSection: { 
    marginVertical: 10, 
    padding: 16, 
    backgroundColor: Colors.muted, 
    borderRadius: 8 
  },
  infoBox: {
    padding: 12, 
    backgroundColor: Colors.primaryLight, 
    borderWidth: 1, 
    borderColor: Colors.primaryBorder, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'flex-start',
  },
  infoBoxText: { 
    fontSize: FONT_SIZE_BASE * 0.75, 
    flex: 1, 
    color: Colors.textSemiBlack,
  },
  
  // --- Question/Answer Specific ---
  questionItemContainer: {
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 2, 
    marginBottom: 8,
  },
  tagBase: {
    fontSize: FONT_SIZE_BASE * 0.75, 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    color: Colors.mutedForeground, 
    marginRight: 8
  },
  answeredTag: {
    flexDirection: 'row',
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 10, 
    backgroundColor: Colors.greenLight, 
    alignItems: 'center'
  },
  aiResultBox: { 
    backgroundColor: Colors.primaryLight, 
    borderRadius: 12, 
    padding: 16 
  },
  aiAnswerStepText: { 
    fontWeight: 'bold', 
    fontSize: FONT_SIZE_BASE * 0.875,
    marginTop: 8 
  },
  aiAnswerBodyText: { 
    fontSize: FONT_SIZE_BASE * 0.875,
    lineHeight: 22 
  },
  communityAvatar: {
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: Colors.primary + '1A', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8
  },
  voteButton: {
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    backgroundColor: Colors.mutedOpacity, 
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // --- Timer Specific ---
  stopwatchDisplayBox: { 
    backgroundColor: Colors.primaryLight, 
    borderRadius: 12, 
    padding: 32, 
    alignItems: 'center', 
    marginBottom: 16 
  },
  stopwatchText: { 
    fontSize: 48, 
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold', 
    marginBottom: 24 
  },
  timerButtonDanger: {
    flex: 1, 
    height: 48, 
    borderRadius: 12, 
    backgroundColor: Colors.destructive, 
    justifyContent: 'center', 
    alignItems: 'center',
    flexDirection: 'row',
  },

  // --- Report Specific ---
  summaryCardBase: { 
    flex: 1, 
    padding: 16,
  },
  chartPlaceholder: {
    height: 200, 
    backgroundColor: Colors.muted, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: Colors.border, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  subjectBreakdownBar: {
    height: 10, 
    backgroundColor: Colors.muted, 
    borderRadius: 5, 
    overflow: 'hidden'
  },
});