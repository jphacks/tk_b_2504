// 学習タイマーコンポーネント

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
// @react-navigation/native がインストールされている前提
import { useFocusEffect } from '@react-navigation/native';
import {
  Colors,
  formatDuration, formatMinToHourMin,
  Icon,
  Session,
  styles
} from './definition';

// Helper function
const getCurrentDate = (): string => {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()}`;
};

// --- Component Signatures ---
interface StudyTimerProps {
    sessions: Session[];
    onAddSession: (session: Session) => void;
}
interface StopwatchContentProps {
    timerRunning: boolean;
    elapsedTime: number;
    currentSubject: string;
    currentPages: string;
    setCurrentSubject: (text: string) => void;
    setCurrentPages: (text: string) => void;
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
}
interface ManualContentProps {
    onSaveManualSession: (session: Session) => void;
    styles: any;
    Colors: any;
    Icon: React.FC<any>;
}

// ====================================================================
// 外部コンポーネント化 (キーボード閉じ問題を解決)
// ====================================================================

const StopwatchContent: React.FC<StopwatchContentProps> = React.memo(({
    timerRunning,
    elapsedTime,
    currentSubject,
    currentPages,
    setCurrentSubject,
    setCurrentPages,
    startTimer,
    stopTimer,
    resetTimer,
}) => (
    <View style={styles.contentSection}>
        <View style={[
            styles.stopwatchDisplayBox,
            { backgroundColor: Colors.primaryLight }
        ]}>
            <Text style={styles.stopwatchText}>{formatDuration(elapsedTime)}</Text>
            <View style={styles.flexRow}>
                <TouchableOpacity
                    onPress={timerRunning ? stopTimer : startTimer}
                    style={[styles.flexOne, styles.buttonPrimary, { marginRight: 12 }]}
                >
                    <Icon name={timerRunning ? 'Pause' : 'Play'} style={[styles.textSm, styles.textWhite, { marginRight: 8 }]} />
                    <Text style={styles.buttonText}>{timerRunning ? '一時停止' : '開始'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={resetTimer}
                    style={[styles.flexOne, styles.timerButtonDanger]}
                >
                    <Icon name="Square" style={[styles.textSm, styles.textWhite, { marginRight: 8 }]} />
                    <Text style={styles.buttonText}>終了</Text>
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.flexRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>科目</Text>
                <TextInput
                    style={[styles.inputBase, { padding: 8 }]}
                    value={currentSubject}
                    onChangeText={setCurrentSubject}
                    placeholder="例: 数学"
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.label}>ページ数</Text>
                <TextInput
                    style={[styles.inputBase, { padding: 8 }]}
                    value={currentPages}
                    onChangeText={setCurrentPages}
                    placeholder="0"
                    keyboardType="numeric"
                />
            </View>
        </View>
    </View>
));

const ManualContent: React.FC<ManualContentProps> = React.memo(({ onSaveManualSession, styles, Colors, Icon }) => {
    const [manualSubject, setManualSubject] = useState<string>('');
    const [manualStartTime, setManualStartTime] = useState<string>('');
    const [manualEndTime, setManualEndTime] = useState<string>('');
    const [manualPages, setManualPages] = useState<string>('');

    const handleSave = () => {
        const startParts = manualStartTime.split(':').map(Number);
        const endParts = manualEndTime.split(':').map(Number);

        if (manualSubject && startParts.length === 2 && endParts.length === 2) {
            const startDate = new Date();
            startDate.setHours(startParts[0], startParts[1], 0, 0);
            const endDate = new Date();
            endDate.setHours(endParts[0], endParts[1], 0, 0);

            const durationMs = endDate.getTime() - startDate.getTime();
            const durationMin = Math.floor(durationMs / (1000 * 60));
            const pagesNum = parseInt(manualPages || '0', 10);

            if (durationMin > 0) {
                const newSession: Session = {
                    id: Date.now().toString(),
                    subject: manualSubject || 'その他',
                    durationMin: durationMin,
                    secondsRemainder: 0, // 手動入力では常に0
                    pages: pagesNum,
                    date: getCurrentDate(),
                };

                onSaveManualSession(newSession);
                
                // フォームをクリア
                setManualSubject('');
                setManualStartTime('');
                setManualEndTime('');
                setManualPages('');
            } else {
                Alert.alert('エラー', '有効な開始・終了時刻を入力してください。');
            }
        } else {
            Alert.alert('エラー', '科目の入力と開始・終了時刻を「HH:MM」形式で入力してください。');
        }
    };

    return (
        <View style={styles.contentSection}>
            <Text style={styles.label}>科目</Text>
            <TextInput
                style={[styles.inputBase, { marginBottom: 12, padding: 8 }]}
                value={manualSubject}
                onChangeText={setManualSubject}
                placeholder="例: 数学"
            />

            <View style={styles.flexRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.label}>開始時刻</Text>
                    <TextInput
                        style={[styles.inputBase, { padding: 8 }]}
                        value={manualStartTime}
                        onChangeText={setManualStartTime}
                        placeholder="09:00"
                        keyboardType="numbers-and-punctuation"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>終了時刻</Text>
                    <TextInput
                        style={[styles.inputBase, { padding: 8 }]}
                        value={manualEndTime}
                        onChangeText={setManualEndTime}
                        placeholder="10:30"
                        keyboardType="numbers-and-punctuation"
                    />
                </View>
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>ページ数</Text>
            <TextInput
                style={[styles.inputBase, { marginBottom: 16, padding: 8 }]}
                value={manualPages}
                onChangeText={setManualPages}
                placeholder="0"
                keyboardType="numeric"
            />

            <TouchableOpacity
                onPress={handleSave}
                style={styles.buttonPrimary}
            >
                <Text style={styles.buttonText}>記録を保存</Text>
            </TouchableOpacity>
        </View>
    );
});


// ====================================================================
// メインコンポーネント (StudyTimer)
// ====================================================================

const StudyTimer: React.FC<StudyTimerProps> = ({ sessions, onAddSession }) => {
    const [currentTab, setCurrentTab] = useState<'stopwatch' | 'manual'>('stopwatch');
    const [timerRunning, setTimerRunning] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const timerIntervalRef = useRef<NodeJS.Timeout | number | null>(null);

    const [currentSubject, setCurrentSubject] = useState<string>('数学');
    const [currentPages, setCurrentPages] = useState<string>('10');

    // タイマーロジック
    const startTimer = useCallback(() => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current as NodeJS.Timeout);
        timerIntervalRef.current = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
        setTimerRunning(true);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current as NodeJS.Timeout);
            timerIntervalRef.current = null;
        }
        setTimerRunning(false);
    }, []);

    const saveSession = useCallback((durationSeconds: number, pages: string, subject: string) => {
        if (durationSeconds > 0) {
            const durationMin = Math.floor(durationSeconds / 60);
            const secondsRemainder = durationSeconds % 60; 
            const pagesNum = parseInt(pages || '0', 10);

            const newSession: Session = {
                id: Date.now().toString(),
                subject: subject || 'その他',
                durationMin: durationMin,
                secondsRemainder: secondsRemainder, 
                pages: pagesNum,
                date: getCurrentDate(),
            };

            onAddSession(newSession);
            
            const formattedTime = formatMinToHourMin(durationMin, secondsRemainder);
            Alert.alert('学習記録保存', `${subject}の学習時間 ${formattedTime} を記録しました！`);
        }
    }, [onAddSession]);

    // ★ 修正: タイマー終了時（リセット時）にAlertを追加
    const resetTimer = useCallback(() => {
        if (elapsedTime === 0) {
            Alert.alert('タイマーリセット', '計測時間が0秒のため、記録は保存されませんでした。');
            return;
        }
        
        const durationSeconds = elapsedTime;
        const formattedTime = formatDuration(durationSeconds);

        Alert.alert(
            '学習を終了して記録しますか？',
            `計測時間: ${formattedTime}\n科目: ${currentSubject}\nページ数: ${currentPages}p`,
            [
                {
                    text: 'キャンセル',
                    style: 'cancel',
                },
                {
                    text: '保存して終了',
                    onPress: () => {
                        saveSession(durationSeconds, currentPages, currentSubject);
                        stopTimer();
                        setElapsedTime(0);
                    },
                    style: 'default',
                },
            ]
        );
    }, [elapsedTime, currentPages, currentSubject, stopTimer, saveSession]);


    // 画面フォーカス時にタイマーを再開/停止
    useFocusEffect(
        useCallback(() => {
            if (timerRunning && !timerIntervalRef.current) {
                startTimer();
            }
            return () => stopTimer();
        }, [timerRunning, startTimer, stopTimer])
    );

    // アンマウント時にタイマーをクリア
    useEffect(() => {
        return () => stopTimer();
    }, [stopTimer]);
    
    // 手動入力用の保存関数
    const handleSaveManualSession = useCallback((session: Session) => {
        onAddSession(session);
        const formattedTime = formatMinToHourMin(session.durationMin, session.secondsRemainder); 
        Alert.alert('記録保存', `学習記録を保存しました。\n科目: ${session.subject}, 時間: ${formattedTime}`);
    }, [onAddSession]);

    // TimeCardの集計値をsessionsから計算
    const todaySessions = sessions.filter(s => s.date === getCurrentDate());
    const todayDuration = todaySessions.reduce((sum, s) => sum + s.durationMin, 0);
    const todayPages = todaySessions.reduce((sum, s) => sum + s.pages, 0);
    const recentSessions = sessions.slice(0, 7);
    const recentDuration = recentSessions.reduce((sum, s) => sum + s.durationMin, 0);
    const recentSessionsCount = recentSessions.length;

    // --- TimeCard Component ---
    interface TimeCardProps {
        title: string;
        duration: string;
        detail: string;
        isPrimary: boolean;
    }
    const TimeCard: React.FC<TimeCardProps> = ({ title, duration, detail, isPrimary }) => {
        // durationが 'Hh MMm' 形式または 'Xs' 形式であることを期待
        const isSeconds = duration.endsWith('s');
        let displayH = '0';
        let displayM = '0';
        let unit = 'm';

        if (isSeconds) {
            displayM = duration.replace('s', '');
            unit = 's';
        } else {
            const parts = duration.split('h ');
            if (parts.length > 1) { // Hh MMm 形式
                displayH = parts[0];
                displayM = parts[1].replace('m', '');
            } else { // MMm 形式
                displayM = duration.replace('m', '');
            }
        }

        return (
            <View style={[
                styles.card,
                {
                    flex: 1, padding: 16,
                    borderWidth: isPrimary ? 2 : 1,
                    borderColor: isPrimary ? Colors.primaryBorder : Colors.border
                }
            ]}>
                <View style={[styles.flexRow, { marginBottom: 8 }]}>
                    <Icon name={isPrimary ? 'Clock' : 'Calendar'} style={{ fontSize: 16, marginRight: 4, color: Colors.mutedForeground }} />
                    <Text style={[styles.textSm, styles.textMutedForeground]}>{title}</Text>
                </View>
                <Text style={[styles.text2xl, styles.textBold]}>{displayH}</Text>
                <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 4 }]}>{displayM}{unit}</Text>
                <Text style={[styles.textSm, styles.textMutedForeground, { marginTop: 4 }]}>{detail}</Text>
            </View>
        );
    };

    // --- RecentSessionsCard Component ---
    const RecentSessionsCard: React.FC = () => (
        <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
            <View style={{ paddingBottom: 12 }}>
                <Text style={[styles.textLg, styles.textSemiBold]}>最近の学習記録</Text>
            </View>
            <View>
                {sessions.slice(0, 5).map((session: Session) => (
                    <View key={session.id} style={[styles.flexRow, {
                        justifyContent: 'space-between', padding: 12,
                        backgroundColor: Colors.mutedTranslucent,
                        borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 8
                    }]}>
                        <View style={styles.flexOne}>
                            <View style={styles.flexRow}>
                                <Text style={styles.tagBase}>{session.subject}</Text>
                                <Text style={[styles.textMutedForeground, styles.textSm]}>{session.date}</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.textMd, styles.textSemiBold]}>{formatMinToHourMin(session.durationMin, session.secondsRemainder)}</Text>
                            <Text style={[styles.textMutedForeground, styles.textSm]}>{session.pages}p</Text>
                        </View>
                    </View>
                ))}
                {sessions.length === 0 && (
                    <Text style={[styles.textMutedForeground, { textAlign: 'center', marginTop: 10 }]}>まだ学習記録がありません。</Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, paddingVertical: 10 }}>
            <View style={styles.flexRow}>
                <TimeCard
                    title="本日の学習"
                    duration={formatMinToHourMin(todayDuration, 0)}
                    detail={`${todayPages}ページ`}
                    isPrimary={true}
                />
                <View style={{ width: 10 }} />
                <TimeCard
                    title="最近"
                    duration={formatMinToHourMin(recentDuration, 0)}
                    detail={`${recentSessionsCount}セッション`}
                    isPrimary={false}
                />
            </View>

            <View style={[styles.card, { padding: 16, marginVertical: 16 }]}>
                <View style={{ paddingBottom: 12 }}>
                    <Text style={[styles.textLg, styles.textSemiBold]}>ストップウォッチ</Text>
                    <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>学習時間を記録</Text>
                </View>

                {/* タブナビゲーション */}
                <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
                    <TouchableOpacity
                        onPress={() => setCurrentTab('stopwatch')}
                        style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'stopwatch' ? Colors.card : Colors.muted, elevation: currentTab === 'stopwatch' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
                    >
                        <Text style={styles.textSemiBold}>タイマー</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setCurrentTab('manual')}
                        style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'manual' ? Colors.card : Colors.muted, elevation: currentTab === 'manual' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
                    >
                        <Text style={styles.textSemiBold}>手動入力</Text>
                    </TouchableOpacity>
                </View>

                {currentTab === 'stopwatch' ? (
                    <StopwatchContent
                        timerRunning={timerRunning}
                        elapsedTime={elapsedTime}
                        currentSubject={currentSubject}
                        currentPages={currentPages}
                        setCurrentSubject={setCurrentSubject}
                        setCurrentPages={setCurrentPages}
                        startTimer={startTimer}
                        stopTimer={stopTimer}
                        resetTimer={resetTimer}
                    />
                ) : (
                    <ManualContent
                        onSaveManualSession={handleSaveManualSession}
                        styles={styles}
                        Colors={Colors}
                        Icon={Icon}
                    />
                )}
            </View>

            <RecentSessionsCard />
        </View>
    );
};

export default StudyTimer;