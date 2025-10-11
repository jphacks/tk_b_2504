//「AI学習サポート」アプリの「見た目」と「操作の中心」 を作るための土台

import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 共通ファイルからインポート
import { Colors, Icon, styles, TabName } from './definition';

// 各ページコンポーネントをインポート
import QuestionAnswer from './ai_anser';
import QuestionGenerator from './ai_create';
import StudyReport from './report';
import StudyTimer from './timer';

// --- AppHeader Component ---
interface AppHeaderProps {
  activeTab: TabName;
}
const AppHeader: React.FC<AppHeaderProps> = ({ activeTab }) => {
  const headerText: string = {
    question: '問題解答アシスタント',
    generate: '類似問題生成',
    timer: '学習時間トラッカー',
    report: '学習レポート'
  }[activeTab];

  return (
    <View style={styles.header}>
      <View style={styles.flexRow}>
        <View style={{
          width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primary,
          justifyContent: 'center', alignItems: 'center', marginRight: 12,
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


// --- AppNavigation Component ---
interface TabButtonProps {
  // 修正: Iconのnameに設定可能な型を直接使用する (definition.tsxで定義されていると仮定)
  icon: any; 
  label: string;
  tabName: TabName;
  activeTab: TabName;
  onPress: () => void;
}
const TabButton: React.FC<TabButtonProps> = ({ icon, label, tabName, activeTab, onPress }) => {
  const isActive = activeTab === tabName;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1, alignItems: 'center', paddingVertical: 12,
        transform: isActive ? [{ scale: 1.05 }] : [{ scale: 1 }],
      }}
    >
      {/* Icon name={icon} には正しい文字列が渡されることを期待して any を削除 */}
      <Icon name={icon} style={{ fontSize: 20, color: isActive ? Colors.primary : Colors.mutedForeground }} />
      <Text style={{
        fontSize: 10, marginTop: 4,
        color: isActive ? Colors.primary : Colors.mutedForeground,
      }}>{label}</Text>
    </TouchableOpacity>
  );
};

interface AppNavigationProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
}
const AppNavigation: React.FC<AppNavigationProps> = ({ activeTab, setActiveTab }) => {
  // Iconの型は string ではなく、definitionで定義された IconProps の name の型にすべきだが、
  // エラー回避のため一旦 any を使用し、実行時の値が正しいことを担保する
  const navItems: { tab: TabName, icon: any, label: string }[] = [
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
              icon={item.icon} // 以前の as any を削除し、TabButtonProps で any を使用
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

// ====================================================================
// メインAppコンポーネント (エントリポイント)
// ====================================================================

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('question');

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
        // Text strings must be rendered within a <Text> component.を避けるため、必ず <Text> で囲む
        return <Text>コンテンツが見つかりません</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        <AppHeader activeTab={activeTab} />
        
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
