// 型定義とモックデータ、ユーティリティ関数、アイコンコンポーネント

import { Text } from 'react-native';

// ====================================================================
// 1. 型定義 (Type Definitions)
// ====================================================================

export type TabName = 'question' | 'generate' | 'timer' | 'report' | 'memo';

export interface Question {
    id: string;
    text: string;
    subject: string;
    date: string;
    answered: boolean;
    unit: string;
}

export interface GeneratedQuestion {
    id: string;
    text: string;
    subject: string;
    difficulty: string;
    copied: boolean;
}

export interface Answer {
    id: string;
    userName: string;
    subject: string;
    content: string;
    votes: number;
    date: string;
}

export interface Session {
    id: string;
    subject: string;
    time: string;
    duration: string;
    pages: number;
    date: string;
}

export interface ReportData {
    date: string;
    duration: number; // minutes
    pages: number;
}

export interface SubjectBreakdown {
    subject: string;
    duration: number; // minutes
    percentage: number;
}

export interface Memo {
    id: string;
    text: string;
    subject: string;
    date: string;
    tags: string[];
}


// ====================================================================
// 2. モックデータ (Mocks)
// ====================================================================

export const mockQuestion: string = '三角形ABCにおいて、AB=5cm, BC=12cm, ∠B=90°のとき、ACの長さを求めよ。';

export const mockPreviousQuestions: Question[] = [
    { id: '1', text: '三角形ABCにおいて、AB=5cm, BC=12cm, ∠B=90°のとき、ACの長さを求めよ。', subject: '数学', date: '10/6', answered: true, unit: '三平方の定理' },
    { id: '2', text: 'The book was read by many students. この文を能動態に書き換えよ。', subject: '英語', date: '10/5', answered: true, unit: '受動態と能動態' },
    { id: '3', text: '質量2kgの物体に10Nの力を加えたとき、加速度を求めよ。', subject: '物理', date: '10/4', answered: true, unit: '運動の法則' },
    { id: '4', text: 'CH₄ + 2O₂ → CO₂ + 2H₂O の反応において、メタン16gが完全燃焼したとき、生成する二酸化炭素の質量を求めよ。', subject: '化学', date: '10/3', answered: true, unit: '化学反応式' },
    { id: '5', text: '光合成において、葉緑体のどの部分で光エネルギーが化学エネルギーに変換されるか答えよ。', subject: '生物', date: '10/2', answered: false, unit: '光合成' },
    { id: '6', text: '2次方程式 x² - 5x + 6 = 0 を解け。', subject: '数学', date: '10/1', answered: true, unit: '2次方程式' },
];

export const mockAIAnswer: string = `【AI解答】

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

export const mockAnswers: Answer[] = [
    { id: '1', userName: '田中太郎', subject: '数学', content: 'まず図を描いて、既知の辺と角度を確認します。次に三角比（sin, cos, tan）を使って未知の辺を求めます。この問題の場合、直角三角形なので三平方の定理 c² = a² + b² を使うのが最も簡単です。', votes: 12, date: '10/6' },
    { id: '2', userName: '佐藤花子', subject: '数学', content: '三平方の定理を使います。AC² = 5² + 12² = 25 + 144 = 169、よってAC = 13cmです。', votes: 8, date: '10/6' },
    { id: '3', userName: '山田次郎', subject: '英語', content: '受動態から能動態への変換は、主語と目的語を入れ替えて、動詞を能動態に戻します。Many students read the book. となります。', votes: 15, date: '10/5' },
    { id: '4', userName: '鈴木美咲', subject: '物理', content: 'ニュートンの運動方程式 F = ma を使います。a = F/m = 10N / 2kg = 5m/s² です。', votes: 10, date: '10/4' },
    { id: '5', userName: '高橋健', subject: '化学', content: 'メタンの分子量は16なので1molです。化学反応式より1molのCO₂が生成されます。CO₂の分子量は44なので44gです。', votes: 7, date: '10/3' }
];

export const mockSessions: Session[] = [
    { id: '1', subject: '数学', time: '14:00 - 16:30', duration: '2h 30m', pages: 12, date: '10/4' },
    { id: '2', subject: '英語', time: '09:00 - 10:30', duration: '1h 30m', pages: 8, date: '10/4' },
    { id: '3', subject: '物理', time: '19:00 - 20:15', duration: '1h 15m', pages: 6, date: '10/3' },
    { id: '4', subject: '化学', time: '15:30 - 17:00', duration: '1h 30m', pages: 10, date: '10/3' },
    { id: '5', subject: '数学', time: '10:00 - 12:30', duration: '2h 30m', pages: 15, date: '10/2' },
];

export const weeklyData: ReportData[] = [
    { date: '10/28', duration: 120, pages: 15 },
    { date: '10/29', duration: 90, pages: 10 },
    { date: '10/30', duration: 150, pages: 18 },
    { date: '10/31', duration: 60, pages: 8 },
    { date: '11/1', duration: 180, pages: 22 },
    { date: '11/2', duration: 100, pages: 12 },
    { date: '11/3', duration: 140, pages: 16 },
];

export const monthlyData: ReportData[] = [
    { date: '第1週', duration: 450, pages: 55 },
    { date: '第2週', duration: 520, pages: 62 },
    { date: '第3週', duration: 380, pages: 48 },
    { date: '第4週', duration: 600, pages: 70 },
];

export const subjectData: SubjectBreakdown[] = [
    { subject: '数学', duration: 450, percentage: 35 },
    { subject: '英語', duration: 300, percentage: 23 },
    { subject: '物理', duration: 250, percentage: 19 },
    { subject: '化学', duration: 200, percentage: 15 },
    { subject: 'その他', duration: 100, percentage: 8 },
];

export const mockMemos: Memo[] = [
    { id: 'm1', text: '三平方の定理の証明はピタゴラスの時代から論争があった。公式だけでなく、この背景も理解しておくこと。', subject: '数学', date: '2024/10/14', tags: ['定理', '背景知識'] },
    { id: 'm2', text: '受動態の時、by以下の動作主が省略されるのは「不明確」「一般の人々」「重要でない」のいずれかの場合。', subject: '英語', date: '2024/10/12', tags: ['文法', '省略'] },
    { id: 'm3', text: 'F=ma の適用時、加速度と力の向きを一致させるのが重要。力を分解して考える。', subject: '物理', date: '2024/10/10', tags: ['運動方程式', '注意点'] },
    { id: 'm4', text: 'モル計算では、原子量/分子量の単位がg/molであることを忘れないこと。単位を追うことがミスを防ぐ。', subject: '化学', date: '2024/10/09', tags: ['モル', '計算'] },
];


// ====================================================================
// 3. ユーティリティ & アイコン
// ====================================================================

// ★ 修正: style/globalからインポートし、stylesという名前で再エクスポート
import { Colors, globalStyles } from '../styles/global';

export const styles = globalStyles;
export { Colors }; // Colorsも再エクスポート

interface IconProps {
    name: keyof typeof iconMap;
    style?: any;
}
const iconMap = {
    BookOpen: '📚', Clock: '⏰', BarChart3: '📊', Sparkles: '✨', Wand2: '🪄',
    Upload: '⬆️', ThumbsUp: '👍', ThumbsDown: '👎', Camera: '📷', Play: '▶️',
    Pause: '⏸️', Square: '⏹️', Calendar: '🗓️', Download: '⬇️', Copy: '📋',
    Check: '✅', BookMarked: '🔖', Target: '🎯',
    NotebookText: '🗒️',
};
export const Icon: React.FC<IconProps> = ({ name, style }) => {
    const icon = iconMap[name] || '?';
    return <Text style={[{ fontSize: 18, color: Colors.foreground }, style]}>{icon}</Text>;
};

export const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const formatMinToHourMin = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

export default {};