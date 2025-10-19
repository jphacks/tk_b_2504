// definition.tsx

import { Text } from 'react-native';

// ====================================================================
// 1. 型定義 (Type Definitions)
// ====================================================================

export type TabName = 'question' | 'generate' | 'test' | 'timer' | 'report' | 'memo';

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

// Session 型
export interface Session {
    id: string;
    subject: string;
    durationMin: number;    // 分単位の学習時間
    secondsRemainder: number; // 60秒未満の残り秒数 (★ 秒単位の記録に対応)
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
    subject: string;
    content: string; // ★ 修正: text から content に変更
    tags: string[];
    date: string;
    imageUri: string | null; // ★ 追加: 画像URI
}

// ====================================================================
// 2. モックデータ (Mock Data)
// ====================================================================

export const mockQuestion: string = 'y = x² + 2x + 1 のグラフの頂点の座標を求めよ。';

export const mockAIAnswer: string = `**解説**
二次関数 y = x² + 2x + 1 の頂点の座標を求めるには、平方完成を行います。
1.  y = x² + 2x + 1
2.  **平方完成の準備**：xの項（2x）の係数（2）の半分（1）の2乗（1）を足して引きます。
3.  y = (x² + 2x + 1) - 1 + 1
4.  y = (x + 1)² + 0
5.  **頂点の読み取り**：y = a(x - p)² + q の形から、頂点は (p, q) です。
6.  したがって、頂点の座標は **(-1, 0)** です。

**類似問題**
二次関数 y = x² - 4x + 5 の頂点の座標を求めよ。`;

export const mockPreviousQuestions: Question[] = [
    { id: 'q1', text: '二次関数 y = x² + 2x + 1 の頂点の座標を求めよ。', subject: '数学', date: '10/18', answered: true, unit: '二次関数' },
    { id: 'q2', text: '光合成の化学反応式を記述せよ。', subject: '理科', date: '10/17', answered: false, unit: '生物' },
    { id: 'q3', text: 'I am reading a book. を受動態にしなさい。', subject: '英語', date: '10/16', answered: true, unit: '受動態' },
];

export const mockAnswers: Answer[] = [
    { id: 'a1', userName: '田中', subject: '数学', content: '頂点の座標は(-1, 0)ですね！平方完成が基本です。', votes: 15, date: '10/18' },
    { id: 'a2', userName: '山本', subject: '数学', content: '判別式Dを使う方法もありますが、この形なら平方完成が一番早いです。', votes: 8, date: '10/18' },
];

export const mockSessions: Session[] = [
    // 10/18 (本日) - 105分 30秒, 20ページ (secondsRemainderを追加)
    { id: 's1', subject: '数学', durationMin: 60, secondsRemainder: 0, pages: 12, date: '10/18' },
    { id: 's2', subject: '英語', durationMin: 45, secondsRemainder: 30, pages: 8, date: '10/18' },
    
    // 10/17 - 140分, 23ページ
    { id: 's3', subject: '理科', durationMin: 30, secondsRemainder: 0, pages: 5, date: '10/17' },
    { id: 's4', subject: '数学', durationMin: 90, secondsRemainder: 0, pages: 15, date: '10/17' },
    { id: 's5', subject: '国語', durationMin: 20, secondsRemainder: 50, pages: 3, date: '10/17' },
    
    // 10/16 - 125分, 24ページ
    { id: 's6', subject: '社会', durationMin: 55, secondsRemainder: 0, pages: 10, date: '10/16' },
    { id: 's7', subject: '英語', durationMin: 70, secondsRemainder: 0, pages: 14, date: '10/16' },

    // 10/15 - 160分, 32ページ
    { id: 's8', subject: '数学', durationMin: 120, secondsRemainder: 0, pages: 25, date: '10/15' },
    { id: 's9', subject: '理科', durationMin: 40, secondsRemainder: 0, pages: 7, date: '10/15' },

    // 10/14 - 30分, 6ページ
    { id: 's10', subject: '社会', durationMin: 30, secondsRemainder: 0, pages: 6, date: '10/14' }, 

    // 10/13 - 60分, 10ページ
    { id: 's11', subject: '数学', durationMin: 60, secondsRemainder: 0, pages: 10, date: '10/13' },
    
    // 10/12 - 45分, 9ページ (7日前 - グラフの始点)
    { id: 's12', subject: '英語', durationMin: 45, secondsRemainder: 0, pages: 9, date: '10/12' },
];

export const mockMemos: Memo[] = [
    { id: 'm1', content: '三平方の定理: a² + b² = c²。斜辺はc!', subject: '数学', tags: ['#公式', '#重要'], date: '2024/10/15', imageUri: null },
    { id: 'm2', content: '不定詞はto + 動詞の原形', subject: '英語', tags: ['#文法', '#基本'], date: '2024/10/14', imageUri: null },
    { id: 'm3', content: '酸化還元反応：酸化数に注意', subject: '化学', tags: ['#モル', '計算'], date: '2024/10/09', imageUri: null },
];

// ====================================================================
// 3. ユーティリティ & アイコン
// ====================================================================

import { Colors as GlobalColors, globalStyles } from '../styles/global';

export const styles = globalStyles;
export const Colors = GlobalColors; 

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
    RotateCcw: '🔄',
    Settings: '⚙️', 
};

export const Icon: React.FC<IconProps> = ({ name, style }) => {
    const icon = iconMap[name] || '?';
    return (
        <Text style={[{ fontSize: 18, color: Colors.foreground }, style]}>{icon}</Text>
    );
};

export const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(
            2,
            '0'
        )}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ★ 修正後の formatMinToHourMin 関数
export const formatMinToHourMin = (min: number, secondsRemain: number): string => {
    const totalMinutes = min;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const s = secondsRemain;

    let parts = [];
    if (h > 0) {
        parts.push(`${h}h`);
    }
    if (m > 0) {
        parts.push(`${m}m`);
    }
    
    if (s > 0) {
        if (h === 0 && m === 0) {
            return `${s}s`; 
        }
        parts.push(`${s}s`);
    }
    
    if (parts.length === 0) {
        return '0s';
    }

    return parts.join(' ');
};

export default {};