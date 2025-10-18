// index.tsx

//「AI学習サポート」アプリの「見た目」と「操作の中心」 を作るための土台

import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 共通ファイルからインポート
import { Colors, Icon, mockSessions, Session, styles, TabName } from './definition';

// 各画面コンポーネントをインポート
import QuestionAnswer from './ai_anser';
import QuestionGenerator from './ai_create';
import StudyMemo from './memo';
import StudyReport from './report';
import StudyTimer from './timer';
// ★ 修正: test.tsx から Test コンポーネントをインポート
import Test from './test';

// ----------------------------------------------------
// 1. 定数とナビゲーションデータ
// ----------------------------------------------------

// ヘッダーに表示するテキストマップ
// ★ 修正: 'test' のヘッダーテキストを追加
const headerText: Record<TabName, string> = {
    question: '問題解答アシスタント',
    generate: '類似問題生成',
    test: 'タイムアタックテスト', 
    timer: '学習時間トラッカー',
    report: '学習レポート',
    memo: '学習メモ帳',
};

// ナビゲーションバーのアイテムリスト
const navItems = [
    { tab: 'question' as const, icon: 'BookOpen' as const, label: '問題解答' },
    { tab: 'generate' as const, icon: 'Wand2' as const, label: '問題生成' },
    // ★ 修正: 'test' タブを 'generate' と 'timer' の間に挿入
    { tab: 'test' as const, icon: 'Target' as const, label: 'テスト' }, 
    { tab: 'timer' as const, icon: 'Clock' as const, label: 'タイマー' },
    { tab: 'report' as const, icon: 'BarChart3' as const, label: 'レポート' },
    { tab: 'memo' as const, icon: 'NotebookText' as const, label: 'メモ' },
];

// --- AppHeader Component ---
interface AppHeaderProps {
    activeTab: TabName;
}
const AppHeader: React.FC<AppHeaderProps> = ({ activeTab }) => {
    const currentHeaderText = headerText[activeTab];

    return (
        <View style={styles.header}>
            <View style={styles.flexRow}>
                <View style={styles.headerIconContainer}>
                    <Icon name="Sparkles" style={styles.textWhite} />
                </View>
                <View>
                    <Text style={styles.headerTitleText}>AI学習サポート</Text>
                    <Text style={styles.headerSubtitleText}>{currentHeaderText}</Text>
                </View>
            </View>
        </View>
    );
};


// --- AppNavigation Component ---
interface TabButtonProps {
    // ★ 修正: Icon nameの型をdefinition.tsxのiconMapのキーのUnion型に変更
    icon: 'BookOpen' | 'Wand2' | 'Clock' | 'BarChart3' | 'NotebookText' | 'Target' | 'RotateCcw'; 
    label: string;
    tabName: TabName;
    activeTab: TabName;
    onPress: () => void;
}
const TabButton: React.FC<TabButtonProps> = ({ icon, label, tabName, activeTab, onPress }) => {
    const isActive = activeTab === tabName;
    const color = isActive ? Colors.primary : Colors.mutedForeground;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.navButtonBase, { transform: isActive ? [{ scale: 1.05 }] : [{ scale: 1 }] }]}
        >
            <Icon name={icon} style={{ fontSize: 20, color: color }} />
            <Text style={[styles.navButtonLabel, { color: color }]}>{label}</Text>
        </TouchableOpacity>
    );
};

interface AppNavigationProps {
    activeTab: TabName;
    setActiveTab: (tab: TabName) => void;
}
const AppNavigation: React.FC<AppNavigationProps> = ({ activeTab, setActiveTab }) => {
    return (
        <View style={styles.nav}>
            <View style={{ maxWidth: 448, alignSelf: 'center', width: '100%' }}>
                <View style={styles.flexRow}>
                    {navItems.map(item => (
                        <TabButton
                            key={item.tab}
                            // ★ 修正: 適切な型に修正
                            icon={item.icon as 'BookOpen' | 'Wand2' | 'Clock' | 'BarChart3' | 'NotebookText' | 'Target' | 'RotateCcw'} 
                            label={item.label}
                            tabName={item.tab as TabName} // TabName型にキャスト
                            activeTab={activeTab}
                            onPress={() => setActiveTab(item.tab as TabName)}
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
    const [sessions, setSessions] = useState<Session[]>(mockSessions);

    const onAddSession = useCallback((newSession: Session) => {
        setSessions(prevSessions => [newSession, ...prevSessions]);
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'question':
                return <QuestionAnswer />;
            case 'generate':
                return <QuestionGenerator />;
            // ★ 修正: 'test' のレンダリングロジックを追加
            case 'test': 
                return <Test />;
            case 'timer':
                // sessions と onAddSession を渡す
                return <StudyTimer sessions={sessions} onAddSession={onAddSession} />;
            case 'report':
                // sessions を渡す
                return <StudyReport sessions={sessions} />;
            case 'memo':
                return <StudyMemo />;
            default:
                // ★ 修正: activeTabの型が保証されているため、defaultは通常発生しないが念のため
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