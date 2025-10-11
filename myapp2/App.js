import { useFocusEffect } from '@react-navigation/native'; // タイマーの再描画にHooksを模擬的に使用
import * as Clipboard from 'expo-clipboard'; // クリップボード機能にExpoのライブラリを使用
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Expo環境では必須

// ====================================================================
// 1. カラー定義とStyleSheetの作成
// ====================================================================

// Tailwind CSSの設定をReact NativeのStyleSheet用に変換
const Colors = {
  primary: 'hsl(210, 40%, 50%)',
  primaryForeground: 'hsl(0, 0%, 100%)',
  card: 'hsl(0, 0%, 100%)',
  muted: 'hsl(210, 40%, 96%)',
  mutedForeground: 'hsl(215, 10%, 45%)',
  border: 'hsl(210, 40%, 90%)',
  background: 'hsl(0, 0%, 100%)',
  destructive: 'hsl(0, 84.2%, 60.2%)',
  greenSuccess: '#10B981', // Tailwind green-500に近い色
};

const styles = StyleSheet.create({
  // グローバルスタイル
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  appContainer: {
    flex: 1,
    maxWidth: 448, // max-w-md (448px) に相当
    width: '100%',
    alignSelf: 'center',
    backgroundColor: Colors.background,
  },
  // HTMLの .card スタイルを再現
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12, // 'xl'
    borderWidth: 1,
    borderColor: Colors.border,
    // RNでのシャドウ表現 (box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05) を簡略化)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  header: {
    position: 'absolute', // sticky top-0 を模擬
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // bg-card/80
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16, // px-4
    paddingVertical: 16, // py-4
    // backdrop-blur-lg の簡易的な再現 (Web以外は難しい)
  },
  nav: {
    position: 'absolute', // fixed bottom-0 を模擬
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // bg-card/80
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    // backdrop-blur-lg の簡易的な再現
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16, // px-4
    paddingTop: 80, // Headerの高さ（約64px + padding）に合わせて調整
    paddingBottom: 80, // Navの高さ（約70px）に合わせて調整
  },
  // Text Styles
  textMutedForeground: {
    color: Colors.mutedForeground,
  },
  textPrimary: {
    color: Colors.primary,
  },
  textWhite: {
    color: Colors.primaryForeground,
  },
  // Flex Utilities
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexCol: {
    flexDirection: 'column',
  },
  flexOne: {
    flex: 1,
  },
});

// ====================================================================
// 2. モックデータ (HTMLからそのまま移行)
// ====================================================================

const mockQuestion = '三角形ABCにおいて、AB=5cm, BC=12cm, ∠B=90°のとき、ACの長さを求めよ。';

const mockPreviousQuestions = [
  { id: '1', text: '三角形ABCにおいて、AB=5cm, BC=12cm, ∠B=90°のとき、ACの長さを求めよ。', subject: '数学', date: '10/6', answered: true, unit: '三平方の定理' },
  { id: '2', text: 'The book was read by many students. この文を能動態に書き換えよ。', subject: '英語', date: '10/5', answered: true, unit: '受動態と能動態' },
  { id: '3', text: '質量2kgの物体に10Nの力を加えたとき、加速度を求めよ。', subject: '物理', date: '10/4', answered: true, unit: '運動の法則' },
  { id: '4', text: 'CH₄ + 2O₂ → CO₂ + 2H₂O の反応において、メタン16gが完全燃焼したとき、生成する二酸化炭素の質量を求めよ。', subject: '化学', date: '10/3', answered: true, unit: '化学反応式' },
  { id: '5', text: '光合成において、葉緑体のどの部分で光エネルギーが化学エネルギーに変換されるか答えよ。', subject: '生物', date: '10/2', answered: false, unit: '光合成' },
  { id: '6', text: '2次方程式 x² - 5x + 6 = 0 を解け。', subject: '数学', date: '10/1', answered: true, unit: '2次方程式' },
];

const mockAIAnswer = `【AI解答】

この問題を解くには、三平方の定理を使用します。

**ステップ1: 条件の確認**
- AB = 5cm
- BC = 12cm
- ∠B = 90°（直角）

**ステップ2: 三平方の定理の適用**
直角三角形において、斜辺の2乗は他の2辺の2乗の和に等しい。

AC² = AB² + BC²
AC² = 5² + 12²
AC² = 25 + 144
AC² = 169

**ステップ3: 解の算出**
AC = √169 = 13cm

**答え: AC = 13cm**`;

const mockAnswers = [
  { id: '1', userName: '田中太郎', subject: '数学', content: 'まず図を描いて、既知の辺と角度を確認します。次に三角比（sin, cos, tan）を使って未知の辺を求めます。この問題の場合、直角三角形なので三平方の定理 c² = a² + b² を使うのが最も簡単です。', votes: 12, date: '10/6' },
  { id: '2', userName: '佐藤花子', subject: '数学', content: '三平方の定理を使います。AC² = 5² + 12² = 25 + 144 = 169、よってAC = 13cmです。', votes: 8, date: '10/6' },
  { id: '3', userName: '山田次郎', subject: '英語', content: '受動態から能動態への変換は、主語と目的語を入れ替えて、動詞を能動態に戻します。Many students read the book. となります。', votes: 15, date: '10/5' },
  { id: '4', userName: '鈴木美咲', subject: '物理', content: 'ニュートンの運動方程式 F = ma を使います。a = F/m = 10N / 2kg = 5m/s² です。', votes: 10, date: '10/4' },
  { id: '5', userName: '高橋健', subject: '化学', content: 'メタンの分子量は16なので1molです。化学反応式より1molのCO₂が生成されます。CO₂の分子量は44なので44gです。', votes: 7, date: '10/3' }
];

const mockSessions = [
  { id: '1', subject: '数学', time: '14:00 - 16:30', duration: '2h 30m', pages: 12, date: '10/4' },
  { id: '2', subject: '英語', time: '09:00 - 10:30', duration: '1h 30m', pages: 8, date: '10/4' },
  { id: '3', subject: '物理', time: '19:00 - 20:15', duration: '1h 15m', pages: 6, date: '10/3' },
  { id: '4', subject: '化学', time: '15:30 - 17:00', duration: '1h 30m', pages: 10, date: '10/3' },
  { id: '5', subject: '数学', time: '10:00 - 12:30', duration: '2h 30m', pages: 15, date: '10/2' },
];

const weeklyData = [
  { date: '10/28', duration: 120, pages: 15 },
  { date: '10/29', duration: 90, pages: 10 },
  { date: '10/30', duration: 150, pages: 18 },
  { date: '10/31', duration: 60, pages: 8 },
  { date: '11/1', duration: 180, pages: 22 },
  { date: '11/2', duration: 100, pages: 12 },
  { date: '11/3', duration: 140, pages: 16 },
];

const monthlyData = [
  { date: '第1週', duration: 450, pages: 55 },
  { date: '第2週', duration: 520, pages: 62 },
  { date: '第3週', duration: 380, pages: 48 },
  { date: '第4週', duration: 600, pages: 70 },
];

const subjectData = [
  { subject: '数学', duration: 450, percentage: 35 },
  { subject: '英語', duration: 300, percentage: 23 },
  { subject: '物理', duration: 250, percentage: 19 },
  { subject: '化学', duration: 200, percentage: 15 },
  { subject: 'その他', duration: 100, percentage: 8 },
];


// ====================================================================
// 3. ユーティリティ & アイコン
// ====================================================================

// アイコンコンポーネント: Lucideアイコンを模擬
// React NativeではSVGは直接使えないため、プレースホルダーとしてTextで表示
const Icon = ({ name, style }) => {
  const iconMap = {
    BookOpen: '📚',
    Clock: '⏰',
    BarChart3: '📊',
    Sparkles: '✨',
    Wand2: '🪄',
    Upload: '⬆️',
    ThumbsUp: '👍',
    ThumbsDown: '👎',
    Camera: '📷',
    Play: '▶️',
    Pause: '⏸️',
    Square: '⏹️',
    Calendar: '🗓️',
    Download: '⬇️',
    Copy: '📋',
    Check: '✅',
    BookMarked: '🔖',
    Target: '🎯',
  };
  return <Text style={[{ fontSize: 18 }, style]}>{iconMap[name] || '?'}</Text>;
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};


// ====================================================================
// 4. コンポーネント定義
// ====================================================================

// --- 4.1. Header Component ---
const AppHeader = ({ activeTab }) => {
  const headerText = {
    question: '問題解答アシスタント',
    generate: '類似問題生成',
    timer: '学習時間トラッカー',
    report: '学習レポート'
  }[activeTab];

  return (
    <View style={styles.header}>
      <View style={styles.flexRow}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: Colors.primary, // グラデーションの簡易化
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
          <Icon name="Sparkles" style={{ fontSize: 20, color: Colors.primaryForeground }} />
        </View>
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>AI学習サポート</Text>
          <Text style={{ fontSize: 12, color: Colors.mutedForeground, marginTop: 2 }}>{headerText}</Text>
        </View>
      </View>
    </View>
  );
};

// --- 4.2. Navigation Component ---
const TabButton = ({ icon, label, tabName, activeTab, onPress }) => {
  const isActive = activeTab === tabName;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        transform: isActive ? [{ scale: 1.05 }] : [{ scale: 1 }],
      }}
    >
      <Icon name={icon} style={{ fontSize: 20, color: isActive ? Colors.primary : Colors.mutedForeground }} />
      <Text style={{
        fontSize: 10,
        marginTop: 4,
        color: isActive ? Colors.primary : Colors.mutedForeground,
      }}>{label}</Text>
    </TouchableOpacity>
  );
};

const AppNavigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { tab: 'question', icon: 'BookOpen', label: '問題解答' },
    { tab: 'generate', icon: 'Wand2', label: '問題生成' },
    { tab: 'timer', icon: 'Clock', label: 'タイマー' },
    { tab: 'report', icon: 'BarChart3', label: 'レポート' }
  ];

  return (
    <View style={styles.nav}>
      <View style={{ maxWidth: 448, alignSelf: 'center', width: '100%' }}>
        <View style={styles.flexRow}>
          {navItems.map(item => (
            <TabButton
              key={item.tab}
              icon={item.icon}
              label={item.label}
              tabName={item.tab}
              activeTab={activeTab}
              onPress={() => setActiveTab(item.tab)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

// --- 4.3. QuestionGenerator Component ---
const QuestionGenerator = () => {
  // 状態管理
  const [currentTab, setCurrentTab] = useState('range');
  const [selectedQuestion, setSelectedQuestion] = useState(mockQuestion);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([
    { id: '1', text: '三角形DEFにおいて、DE=8cm, EF=15cm, ∠E=90°のとき、DFの長さを求めよ。', difficulty: '同レベル', subject: '数学', copied: false },
    { id: '2', text: 'Many students read the book. この文を受動態に書き換えよ。', difficulty: '同レベル', subject: '英語', copied: false },
    { id: '3', text: '質量3kgの物体に15Nの力を加えたとき、加速度を求めよ。', difficulty: '同レベル', subject: '物理', copied: false },
    { id: '4', text: '2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O の反応において、エタン30gが完全燃焼したとき生成する水の質量を求めよ。', difficulty: 'やや難しい', subject: '化学', copied: false },
    { id: '5', text: '細胞呼吸において、ミトコンドリアのどの部分でATP合成が行われるか答えよ。', difficulty: '同レベル', subject: '生物', copied: false },
  ]);
  const [numQuestions, setNumQuestions] = useState('3');
  const [difficulty, setDifficulty] = useState('similar');
  const [subject, setSubject] = useState('math');
  const [unit, setUnit] = useState('pythagoras');

  // 生成ボタンの処理
  const handleGenerate = () => {
    if (!selectedQuestion || isGenerating) return;
    setIsGenerating(true);

    // モックデータで更新をシミュレーション
    setTimeout(() => {
      setIsGenerating(false);
      // 再生成をシミュレートするため、ここでは状態を維持
    }, 1500);
  };

  // コピー処理
  const handleCopy = async (id) => {
    const question = generatedQuestions.find(q => q.id === id);
    if (!question) return;

    await Clipboard.setStringAsync(question.text);
    
    // UIを更新してコピー済みを表示
    const newQuestions = generatedQuestions.map(q =>
      q.id === id ? { ...q, copied: true } : q
    );
    setGeneratedQuestions(newQuestions);

    setTimeout(() => {
      const resetQuestions = newQuestions.map(q =>
        q.id === id ? { ...q, copied: false } : q
      );
      setGeneratedQuestions(resetQuestions);
    }, 2000);
  };

  // Tab Content Components (一部はSelectやInputの代わりにPickerを使用)

  const RangeContent = () => (
    <View style={{ marginVertical: 10, padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 5 }}>科目</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
        value={subject}
        onChangeText={setSubject}
        placeholder="例: 数学"
      />
      
      <Text style={{ fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 5 }}>単元・範囲</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
        value={unit}
        onChangeText={setUnit}
        placeholder="例: 三平方の定理"
      />

      <View style={{ padding: 12, backgroundColor: `${Colors.primary}10`, borderWidth: 1, borderColor: `${Colors.primary}30`, borderRadius: 12, marginTop: 15, flexDirection: 'row', alignItems: 'flex-start' }}>
        <Icon name="Sparkles" style={{ color: Colors.primary, fontSize: 16, marginRight: 8, marginTop: 2 }} />
        <Text style={{ fontSize: 12, flex: 1, color: '#000000B3' }}>選択した範囲から自動的に問題を生成します</Text>
      </View>
    </View>
  );

  const HistoryContent = () => (
    <View style={{ marginVertical: 10, padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
      <Text style={{ fontSize: 12, color: Colors.mutedForeground, marginBottom: 10 }}>解答した問題から類似問題を生成</Text>
      {mockPreviousQuestions.filter(q => q.answered).map(question => (
        <TouchableOpacity
          key={question.id}
          onPress={() => setSelectedQuestion(question.text)}
          style={{
            padding: 12,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: selectedQuestion === question.text ? Colors.primary : Colors.border,
            backgroundColor: selectedQuestion === question.text ? `${Colors.primary}10` : Colors.card,
            marginBottom: 8,
          }}
        >
          <View style={styles.flexRow}>
            <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{question.subject}</Text>
            <View style={[styles.flexRow, { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: '#D1FAE5', alignItems: 'center' }]}>
              <Icon name="Check" style={{ fontSize: 12, color: '#059669', marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: '#059669' }}>解答済み</Text>
            </View>
            <Text style={[styles.textMutedForeground, { fontSize: 12, marginLeft: 'auto' }]}>{question.date}</Text>
          </View>
          <Text style={[styles.textMutedForeground, { fontSize: 12, marginTop: 4, marginBottom: 2 }]}>{question.unit}</Text>
          <Text style={{ fontSize: 14 }}>{question.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const GeneratedQuestionItem = ({ question, index }) => (
    <View style={{
      padding: 16,
      backgroundColor: `${Colors.primary}10`,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: `${Colors.primary}30`,
      marginBottom: 10,
    }}>
      <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 12 }]}>
        <View style={styles.flexRow}>
          <View style={[styles.flexRow, { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: `${Colors.primary}CC`, marginRight: 8 }]}>
            <Icon name="Sparkles" style={{ fontSize: 12, color: Colors.primaryForeground, marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: Colors.primaryForeground }}>問題 {index + 1}</Text>
          </View>
          <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{question.subject}</Text>
          <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground }}>{question.difficulty}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleCopy(question.id)}
          style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: question.copied ? Colors.greenSuccess : 'transparent', borderWidth: 1, borderColor: question.copied ? Colors.greenSuccess : Colors.primary, marginLeft: 'auto' }]}
        >
          <Icon name={question.copied ? 'Check' : 'Copy'} style={{ fontSize: 14, color: question.copied ? Colors.primaryForeground : Colors.primary, marginRight: 4 }} />
          <Text style={{ fontSize: 14, color: question.copied ? Colors.primaryForeground : Colors.primary, fontWeight: '600' }}>
            {question.copied ? 'コピー済み' : 'コピー'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 14, lineHeight: 20 }}>{question.text}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={[styles.card, { padding: 16, borderWidth: 2, borderColor: `${Colors.primary}30`, marginBottom: 16 }]}>
        <View style={[styles.flexRow, { paddingBottom: 12, alignItems: 'flex-start' }]}>
          <Icon name="Wand2" style={{ fontSize: 20, color: Colors.primary, marginRight: 8, marginTop: 4 }} />
          <View style={styles.flexOne}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>類似問題を生成</Text>
            <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>AIが問題をもとに新しい問題を作成</Text>
          </View>
        </View>

        {/* タブナビゲーション */}
        <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => setCurrentTab('range')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'range' ? Colors.card : Colors.muted, elevation: currentTab === 'range' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <View style={styles.flexRow}>
              <Icon name="Target" style={{ fontSize: 14, marginRight: 6 }} />
              <Text style={{ fontWeight: '600' }}>範囲指定</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTab('history')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'history' ? Colors.card : Colors.muted, elevation: currentTab === 'history' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <View style={styles.flexRow}>
              <Icon name="BookMarked" style={{ fontSize: 14, marginRight: 6 }} />
              <Text style={{ fontWeight: '600' }}>解答履歴</Text>
            </View>
          </TouchableOpacity>
        </View>

        {currentTab === 'range' ? <RangeContent /> : <HistoryContent />}
        
        {/* 設定項目 */}
        <View style={[styles.flexRow, { marginVertical: 10, justifyContent: 'space-between' }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>生成数</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
              value={numQuestions}
              onChangeText={setNumQuestions}
              placeholder="3問"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>難易度</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
              value={difficulty}
              onChangeText={setDifficulty}
              placeholder="同レベル"
            />
          </View>
        </View>

        {/* 生成ボタン */}
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={!selectedQuestion || isGenerating}
          style={[
            styles.flexRow,
            {
              height: 48,
              borderRadius: 12,
              backgroundColor: Colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 16,
              opacity: !selectedQuestion || isGenerating ? 0.5 : 1,
            }
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator color={Colors.primaryForeground} style={{ marginRight: 8 }} />
          ) : (
            <Icon name="Sparkles" style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }} />
          )}
          <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>
            {isGenerating ? '生成中...' : '類似問題を生成'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 生成結果の表示 */}
      {generatedQuestions.length > 0 && (
        <View style={[styles.card, { padding: 16, borderWidth: 2, marginBottom: 16 }]}>
          <View style={{ paddingBottom: 12 }}>
            <View style={styles.flexRow}>
              <Icon name="Sparkles" style={{ fontSize: 20, color: Colors.primary, marginRight: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: '600' }}>生成された問題</Text>
            </View>
            <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>{generatedQuestions.length}問の類似問題</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            {generatedQuestions.map((q, index) => (
              <GeneratedQuestionItem key={q.id} question={q} index={index} />
            ))}
          </View>
          <View style={{ padding: 12, backgroundColor: `${Colors.primary}10`, borderWidth: 1, borderColor: `${Colors.primary}30`, borderRadius: 12, marginTop: 15, flexDirection: 'row', alignItems: 'flex-start' }}>
            <Icon name="Sparkles" style={{ color: Colors.primary, fontSize: 16, marginRight: 8, marginTop: 2 }} />
            <Text style={{ fontSize: 12, flex: 1, color: '#000000B3' }}>生成された問題はAIによって作成されています。必要に応じて内容を確認・編集してご利用ください。</Text>
          </View>
        </View>
      )}
    </View>
  );
};


// --- 4.4. QuestionAnswer Component ---
const QuestionAnswer = () => {
  const [currentTab, setCurrentTab] = useState('input');
  const [showResults, setShowResults] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(mockQuestion);
  const [communityTab, setCommunityTab] = useState('community'); // コミュニティタブの状態

  const AiAnswerCard = () => {
    // 答えの**ステップ**部分を太字にするための簡易的な処理
    const formattedAnswer = mockAIAnswer.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <Text key={index} style={{ fontWeight: 'bold', fontSize: 14, marginTop: 8 }}>{line.replace(/\*\*/g, '')}</Text>;
      }
      return <Text key={index} style={{ fontSize: 14, lineHeight: 22 }}>{line.replace(/<br>/g, '\n')}</Text>;
    });
  
    return (
      <View style={[styles.card, { padding: 16, borderWidth: 2, borderColor: `${Colors.primary}30`, marginBottom: 16 }]}>
        <View style={{ paddingBottom: 12 }}>
          <View style={styles.flexRow}>
            <Icon name="Sparkles" style={{ fontSize: 20, color: Colors.primary, marginRight: 8 }} />
            <Text style={{ fontSize: 18, fontWeight: '600' }}>AI解答</Text>
          </View>
        </View>
        <View style={{ backgroundColor: `${Colors.primary}10`, borderRadius: 12, padding: 16 }}>
          <View style={[styles.flexRow, { marginBottom: 12 }]}>
            <View style={[styles.flexRow, { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: `${Colors.primary}CC` }]}>
              <Icon name="Sparkles" style={{ fontSize: 12, color: Colors.primaryForeground, marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: Colors.primaryForeground }}>AI生成</Text>
            </View>
          </View>
          <View>
            {formattedAnswer}
          </View>
        </View>
      </View>
    );
  };

  const CommunityAnswerItem = ({ answer }) => (
    <View style={{ padding: 16, borderWidth: 2, borderColor: Colors.border, borderRadius: 12, marginBottom: 12 }}>
      <View style={[styles.flexRow, { justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }]}>
        <View style={styles.flexRow}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${Colors.primary}1A`, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
            <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: 'bold' }}>{answer.userName[0]}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>{answer.userName}</Text>
            <View style={[styles.flexRow, { marginTop: 2 }]}>
              <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{answer.subject}</Text>
              <Text style={[styles.textMutedForeground, { fontSize: 12 }]}>{answer.date}</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={{ fontSize: 14, lineHeight: 22, marginBottom: 12 }}>{answer.content}</Text>
      <View style={styles.flexRow}>
        <TouchableOpacity style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: `${Colors.muted}B3`, marginRight: 8 }]}>
          <Icon name="ThumbsUp" style={{ fontSize: 14, color: Colors.mutedForeground, marginRight: 6 }} />
          <Text style={{ fontSize: 14, color: Colors.mutedForeground }}>{answer.votes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: `${Colors.muted}B3` }]}>
          <Icon name="ThumbsDown" style={{ fontSize: 14, color: Colors.mutedForeground }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const CommunityCard = () => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>他の学習者の解答</Text>
        <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>参考になる解答に投票できます</Text>
      </View>

      {/* コミュニティタブナビゲーション */}
      <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
        <TouchableOpacity
          onPress={() => setCommunityTab('community')}
          style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: communityTab === 'community' ? Colors.card : Colors.muted, elevation: communityTab === 'community' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
        >
          <Text style={{ fontWeight: '600' }}>解答一覧</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCommunityTab('upload')}
          style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: communityTab === 'upload' ? Colors.card : Colors.muted, elevation: communityTab === 'upload' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
        >
          <Text style={{ fontWeight: '600' }}>投稿する</Text>
        </TouchableOpacity>
      </View>

      {communityTab === 'community' ? (
        <View>
          {mockAnswers.map(answer => <CommunityAnswerItem key={answer.id} answer={answer} />)}
        </View>
      ) : (
        <View style={{ padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
          <View style={{ padding: 12, backgroundColor: `${Colors.primary}10`, borderWidth: 1, borderColor: `${Colors.primary}30`, borderRadius: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 12, flex: 1, color: '#000000B3' }}>投稿された解答は他の学習者と共有されます</Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>あなたの解答</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: Colors.border, padding: 10, borderRadius: 8, height: 100, marginBottom: 16, backgroundColor: Colors.card }}
            multiline={true}
            placeholder="あなたの解答や別解を入力..."
          />
          <TouchableOpacity
            style={[styles.flexRow, { height: 48, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }]}
            onPress={() => Alert.alert('投稿シミュレーション', '解答がコミュニティに投稿されました！')}
          >
            <Icon name="Upload" style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }} />
            <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>解答を投稿</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const InputContent = () => (
    <View style={{ marginVertical: 10, padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>問題文</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: Colors.border, padding: 10, borderRadius: 8, height: 80, marginBottom: 16, backgroundColor: Colors.card }}
        multiline={true}
        value={currentQuestion}
        onChangeText={setCurrentQuestion}
        placeholder="問題文を入力してください..."
      />
      <TouchableOpacity
        onPress={() => setShowResults(true)}
        style={[styles.flexRow, { height: 48, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }]}
      >
        <Icon name="Sparkles" style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }} />
        <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>AI解答を生成</Text>
      </TouchableOpacity>
    </View>
  );

  const HistoryContent = () => (
    <View style={{ marginVertical: 10, padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
      <Text style={{ fontSize: 12, color: Colors.mutedForeground, marginBottom: 10 }}>過去に解答した問題から選択</Text>
      {mockPreviousQuestions.slice(0, 6).map(question => (
        <TouchableOpacity
          key={question.id}
          onPress={() => {
            setCurrentQuestion(question.text);
            setShowResults(true);
          }}
          style={{
            padding: 12,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: currentQuestion === question.text ? Colors.primary : Colors.border,
            backgroundColor: currentQuestion === question.text ? `${Colors.primary}10` : Colors.card,
            marginBottom: 8,
          }}
        >
          <View style={styles.flexRow}>
            <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{question.subject}</Text>
            <Text style={[styles.textMutedForeground, { fontSize: 12, marginLeft: 'auto' }]}>{question.date}</Text>
          </View>
          <Text style={[styles.textMutedForeground, { fontSize: 12, marginTop: 4, marginBottom: 2 }]}>{question.unit}</Text>
          <Text style={{ fontSize: 14 }}>{question.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
        <View style={[styles.flexRow, { justifyContent: 'space-between', paddingBottom: 12 }]}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>問題を入力</Text>
            <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>AI解答を生成できます</Text>
          </View>
          <TouchableOpacity style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.border }]}>
            <Icon name="Camera" style={{ fontSize: 16, color: Colors.primary, marginRight: 6 }} />
            <Text style={{ fontSize: 14, color: Colors.primary }}>撮影</Text>
          </TouchableOpacity>
        </View>

        {/* タブナビゲーション */}
        <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => setCurrentTab('input')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'input' ? Colors.card : Colors.muted, elevation: currentTab === 'input' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <Text style={{ fontWeight: '600' }}>新規入力</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTab('history')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'history' ? Colors.card : Colors.muted, elevation: currentTab === 'history' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <Text style={{ fontWeight: '600' }}>履歴から選択</Text>
          </TouchableOpacity>
        </View>

        {currentTab === 'input' ? <InputContent /> : <HistoryContent />}
      </View>

      {showResults && (
        <>
          <AiAnswerCard />
          <CommunityCard />
        </>
      )}
    </View>
  );
};


// --- 4.5. StudyTimer Component ---
const StudyTimer = () => {
  const [currentTab, setCurrentTab] = useState('stopwatch');
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef(null);

  const [currentSubject, setCurrentSubject] = useState('数学');
  const [currentPages, setCurrentPages] = useState('10');

  // タイマーロジック
  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);
    setTimerRunning(true);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setElapsedTime(0);
  };

  // 画面フォーカス時にタイマーを再開/停止（Expo Goでのシミュレーション）
  useFocusEffect(
    useCallback(() => {
      if (timerRunning && !timerIntervalRef.current) {
        startTimer();
      }
      return () => stopTimer();
    }, [timerRunning])
  );
  
  // アンマウント時にタイマーをクリア
  useEffect(() => {
    return () => stopTimer();
  }, []);

  const TimeCard = ({ title, duration, detail, isPrimary }) => {
    const [h, m] = duration.split('h ');
    const finalMin = m ? m.replace('m', '') : '0';

    return (
      <View style={[styles.card, { flex: 1, padding: 16, borderWidth: isPrimary ? 2 : 1, borderColor: isPrimary ? `${Colors.primary}30` : Colors.border }]}>
        <View style={[styles.flexRow, { marginBottom: 8 }]}>
          <Icon name={isPrimary ? 'Clock' : 'Calendar'} style={{ fontSize: 16, marginRight: 4, color: Colors.mutedForeground }} />
          <Text style={{ fontSize: 12, color: Colors.mutedForeground }}>{title}</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{h}</Text>
        <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 4 }}>{finalMin}m</Text>
        <Text style={{ fontSize: 12, color: Colors.mutedForeground, marginTop: 4 }}>{detail}</Text>
      </View>
    );
  };

  const StopwatchContent = () => (
    <View style={{ marginVertical: 10 }}>
      <View style={{ backgroundColor: `${Colors.primary}10`, borderRadius: 12, padding: 32, alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 48, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: 'bold', marginBottom: 24 }} nativeID="timer-display">{formatDuration(elapsedTime)}</Text>
        <View style={styles.flexRow}>
          <TouchableOpacity
            onPress={timerRunning ? stopTimer : startTimer}
            style={[styles.flexOne, styles.flexRow, { height: 48, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }]}
          >
            <Icon name={timerRunning ? 'Pause' : 'Play'} style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }} />
            <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>{timerRunning ? '一時停止' : '開始'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={resetTimer}
            style={[styles.flexOne, styles.flexRow, { height: 48, borderRadius: 12, backgroundColor: Colors.destructive, justifyContent: 'center', alignItems: 'center' }]}
          >
            <Icon name="Square" style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }} />
            <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>終了</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.flexRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>科目</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
            value={currentSubject}
            onChangeText={setCurrentSubject}
            placeholder="例: 数学"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>ページ数</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
            value={currentPages}
            onChangeText={setCurrentPages}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const ManualContent = () => {
    const [manualSubject, setManualSubject] = useState('');
    const [manualStartTime, setManualStartTime] = useState('');
    const [manualEndTime, setManualEndTime] = useState('');
    const [manualPages, setManualPages] = useState('');

    const handleSave = () => {
      if (manualSubject && manualStartTime && manualEndTime) {
        Alert.alert('記録保存', `学習記録を保存しました。\n科目: ${manualSubject}, 時間: ${manualStartTime} - ${manualEndTime}`);
        // 実際のアプリではここでデータを永続化
      } else {
        Alert.alert('エラー', '科目の入力と開始・終了時刻を入力してください。');
      }
    };

    return (
      <View style={{ marginVertical: 10, padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>科目</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card, marginBottom: 12 }}
          value={manualSubject}
          onChangeText={setManualSubject}
          placeholder="例: 数学"
        />

        <View style={styles.flexRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>開始時刻</Text>
            <TextInput // RNのTextInputでtime入力を模擬
              style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
              value={manualStartTime}
              onChangeText={setManualStartTime}
              placeholder="09:00"
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>終了時刻</Text>
            <TextInput // RNのTextInputでtime入力を模擬
              style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
              value={manualEndTime}
              onChangeText={setManualEndTime}
              placeholder="10:30"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        <Text style={{ fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 4 }}>ページ数</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card, marginBottom: 16 }}
          value={manualPages}
          onChangeText={setManualPages}
          placeholder="0"
          keyboardType="numeric"
        />

        <TouchableOpacity
          onPress={handleSave}
          style={[styles.flexRow, { height: 48, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }]}
        >
          <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>記録を保存</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const RecentSessionsCard = () => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>最近の学習記録</Text>
      </View>
      <View>
        {mockSessions.map(session => (
          <View key={session.id} style={[styles.flexRow, { justifyContent: 'space-between', padding: 12, backgroundColor: `${Colors.muted}80`, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 }]}>
            <View style={styles.flexOne}>
              <View style={styles.flexRow}>
                <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{session.subject}</Text>
                <Text style={[styles.textMutedForeground, { fontSize: 12 }]}>{session.date}</Text>
              </View>
              <Text style={[styles.textMutedForeground, { fontSize: 12, marginTop: 4 }]}>{session.time}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>{session.duration}</Text>
              <Text style={[styles.textMutedForeground, { fontSize: 12 }]}>{session.pages}p</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={styles.flexRow}>
        <TimeCard title="本日の学習" duration="4h 30m" detail="32ページ" isPrimary={true} />
        <View style={{ width: 10 }} />
        <TimeCard title="今週" duration="12h 30m" detail="5セッション" isPrimary={false} />
      </View>

      <View style={[styles.card, { padding: 16, marginVertical: 16 }]}>
        <View style={{ paddingBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>ストップウォッチ</Text>
          <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>学習時間を記録</Text>
        </View>

        {/* タブナビゲーション */}
        <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => setCurrentTab('stopwatch')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'stopwatch' ? Colors.card : Colors.muted, elevation: currentTab === 'stopwatch' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <Text style={{ fontWeight: '600' }}>タイマー</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTab('manual')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'manual' ? Colors.card : Colors.muted, elevation: currentTab === 'manual' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <Text style={{ fontWeight: '600' }}>手動入力</Text>
          </TouchableOpacity>
        </View>

        {currentTab === 'stopwatch' ? <StopwatchContent /> : <ManualContent />}
      </View>

      <RecentSessionsCard />
    </View>
  );
};


// --- 4.6. StudyReport Component ---
const StudyReport = () => {
  const [reportType, setReportType] = useState('week');
  const currentData = reportType === 'week' ? weeklyData : monthlyData;
  const totalDuration = currentData.reduce((sum, item) => sum + item.duration, 0);
  const totalPages = currentData.reduce((sum, item) => sum + item.pages, 0);
  const avgDaily = currentData.length === 0 ? 0 : Math.floor(totalDuration / currentData.length);

  const formatMinToHourMin = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const SummaryCard = ({ title, value, unit, isPrimary }) => (
    <View style={[styles.card, { flex: 1, padding: 16, borderWidth: isPrimary ? 2 : 1, borderColor: isPrimary ? `${Colors.primary}30` : Colors.border }]}>
      <Text style={{ fontSize: 12, color: Colors.mutedForeground, marginBottom: 8 }}>{title}</Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{value}</Text>
      <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 4 }}>{unit}</Text>
    </View>
  );

  const ChartCard = ({ title, description, isBar }) => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>
        <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>{description}</Text>
      </View>
      <View style={{ height: 200, backgroundColor: Colors.muted, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[styles.textMutedForeground, { fontSize: 14 }]}>{isBar ? 'ページ数 (棒グラフのスタブ)' : '学習時間 (折れ線グラフのスタブ)'}</Text>
      </View>
    </View>
  );

  const SubjectBreakdown = () => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>科目別学習時間</Text>
        <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>時間の内訳と割合</Text>
      </View>
      {subjectData.map((item, index) => (
        <View key={index} style={{ marginBottom: 12 }}>
          <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 4 }]}>
            <View style={styles.flexRow}>
              <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{item.subject}</Text>
              <Text style={[styles.textMutedForeground, { fontSize: 12 }]}>{formatMinToHourMin(item.duration)}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>{item.percentage}%</Text>
          </View>
          <View style={{ height: 10, backgroundColor: Colors.muted, borderRadius: 5, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${item.percentage}%`, backgroundColor: Colors.primary, borderRadius: 5 }} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 16 }]}>
        <TextInput // Pickerの簡易的な代用
          style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
          value={reportType === 'week' ? '週間レポート' : '月間レポート'}
          onChangeText={(text) => setReportType(text.includes('週間') ? 'week' : 'month')}
          placeholder="レポート期間"
        />
        <TouchableOpacity style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.border }]}>
          <Icon name="Download" style={{ fontSize: 16, color: Colors.primary, marginRight: 6 }} />
          <Text style={{ fontSize: 14, color: Colors.primary }}>CSV</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.flexRow}>
        <SummaryCard title="合計時間" value={Math.floor(totalDuration / 60) + 'h'} unit={(totalDuration % 60) + 'm'} isPrimary={true} />
        <View style={{ width: 10 }} />
        <SummaryCard title="平均/日" value={Math.floor(avgDaily / 60) + 'h'} unit={(avgDaily % 60) + 'm'} isPrimary={false} />
        <View style={{ width: 10 }} />
        <SummaryCard title="総ページ" value={totalPages} unit="ページ" isPrimary={false} />
      </View>

      <ChartCard title="学習時間の推移" description={reportType === 'week' ? '過去7日間' : '過去4週間'} isBar={false} />
      <ChartCard title="ページ数の推移" description="学習進捗の可視化" isBar={true} />
      <SubjectBreakdown />
    </View>
  );
};


// ====================================================================
// 5. メインAppコンポーネント (エントリポイント)
// ====================================================================

const App = () => {
  const [activeTab, setActiveTab] = useState('question'); // 初期タブは問題解答

  const renderContent = () => {
    switch (activeTab) {
      case 'question':
        return <QuestionAnswer />;
      case 'generate':
        return <QuestionGenerator />;
      case 'timer':
        return <StudyTimer />;
      case 'report':
        return <StudyReport />;
      default:
        return <Text>コンテンツが見つかりません</Text>;
    }
  };

  return (
    // SafeAreaViewはノッチなどセーフエリアを考慮するために重要です
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        <AppHeader activeTab={activeTab} />
        
        {/* ScrollViewはコンテンツのスクロールを可能にし、pb-20 hide-scrollbarを再現 */}
        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          {renderContent()}
          {/* 最下部のパディングを確保 */}
          <View style={{ height: 20 }} />
        </ScrollView>
        
        <AppNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
};

export default App;