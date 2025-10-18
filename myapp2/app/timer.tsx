// 学習タイマーコンポーネント

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
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

// ★ 修正後のシグネチャ: isPausedを追加
interface CountdownContentProps {
    targetTime: number; // 秒
    setTargetTime: (seconds: number) => void;
    countdownRunning: boolean;
    isPaused: boolean; // ★ 追加: 一時停止状態
    timeRemaining: number;
    currentSubject: string;
    currentPages: string;
    setCurrentSubject: (text: string) => void;
    setCurrentPages: (text: string) => void;
    startCountdown: () => void;
    stopCountdown: () => void;
    resetCountdown: () => void;
}


// ====================================================================
// 外部コンポーネント化
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
        <View style={[
            styles.stopwatchDisplayBox,
            { backgroundColor: Colors.primaryLight, marginTop: 16 }
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
                    <Text style={styles.buttonText}>終了/記録</Text>
                </TouchableOpacity>
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


const CountdownContent: React.FC<CountdownContentProps> = React.memo(({
    targetTime,
    setTargetTime,
    countdownRunning,
    isPaused, 
    timeRemaining,
    currentSubject,
    currentPages,
    setCurrentSubject,
    setCurrentPages,
    startCountdown,
    stopCountdown,
    resetCountdown,
}) => {
    const [minutesInput, setMinutesInput] = useState<string>(String(Math.floor(targetTime / 60)));

    useEffect(() => {
        setMinutesInput(String(Math.floor(targetTime / 60)));
    }, [targetTime]);

    const handleMinutesChange = (text: string) => {
        setMinutesInput(text);
        const minutes = parseInt(text || '0', 10);
        setTargetTime(minutes * 60); 
    };
    
    const timerColor = timeRemaining <= 10 && timeRemaining > 0 ? Colors.destructive : Colors.primary;

    return (
        <View style={styles.contentSection}>
            {/* タイマー設定 */}
            <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 12 }]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.label}>設定時間 (分)</Text>
                    <TextInput
                        style={[styles.inputBase, { padding: 8 }]}
                        value={minutesInput}
                        onChangeText={handleMinutesChange}
                        placeholder="例: 25"
                        keyboardType="numeric"
                        editable={!countdownRunning && !isPaused} // ★ 修正: 実行中または一時停止中は編集不可
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>科目</Text>
                    <TextInput
                        style={[styles.inputBase, { padding: 8 }]}
                        value={currentSubject}
                        onChangeText={setCurrentSubject}
                        placeholder="例: 数学"
                    />
                </View>
            </View>
            <View>
                <Text style={styles.label}>ページ数</Text>
                <TextInput
                    style={[styles.inputBase, { padding: 8, marginBottom: 16 }]}
                    value={currentPages}
                    onChangeText={setCurrentPages}
                    placeholder="0"
                    keyboardType="numeric"
                />
            </View>

            {/* カウントダウン表示 */}
            <View style={[
                styles.stopwatchDisplayBox, 
                { backgroundColor: Colors.primaryLight } 
            ]}>
                <Text style={[styles.stopwatchText, { color: timerColor }]}>{formatDuration(timeRemaining)}</Text>
                <View style={styles.flexRow}>
                    {/* ★ 修正: 一時停止/再開ボタンのロジック */}
                    <TouchableOpacity
                        onPress={countdownRunning ? stopCountdown : startCountdown}
                        disabled={targetTime === 0 && !isPaused} // Paused状態ならtargetTime=0でも再開可能
                        style={[styles.flexOne, styles.buttonPrimary, { marginRight: 12, opacity: (targetTime === 0 && !isPaused) ? 0.5 : 1 }]}
                    >
                        <Icon 
                            name={countdownRunning ? 'Pause' : 'Play'} 
                            style={[styles.textSm, styles.textWhite, { marginRight: 8 }]} 
                        />
                        <Text style={styles.buttonText}>
                            {countdownRunning ? '一時停止' : isPaused ? '再開' : '開始'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={resetCountdown}
                        disabled={!countdownRunning && !isPaused} // ★ 修正: 実行中または一時停止中の時のみリセット可能
                        style={[styles.flexOne, styles.timerButtonDanger, { opacity: (!countdownRunning && !isPaused) ? 0.5 : 1 }]}
                    >
                        <Icon name="Square" style={[styles.textSm, styles.textWhite, { marginRight: 8 }]} />
                        <Text style={styles.buttonText}>終了</Text> 
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
});


// ====================================================================
// メインコンポーネント (StudyTimer)
// ====================================================================

const StudyTimer: React.FC<StudyTimerProps> = ({ sessions, onAddSession }) => {
    const [currentTab, setCurrentTab] = useState<'stopwatch' | 'timer' | 'manual'>('stopwatch');
    
    // ストップウォッチ関連
    const [swRunning, setSwRunning] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);

    // カウントダウンタイマー関連
    const [countdownRunning, setCountdownRunning] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false); // ★ 修正: 一時停止状態を追加
    const [targetTime, setTargetTime] = useState<number>(1500); 
    const [timeRemaining, setTimeRemaining] = useState<number>(1500); 

    const timerIntervalRef = useRef<NodeJS.Timeout | number | null>(null);

    const [currentSubject, setCurrentSubject] = useState<string>('数学');
    const [currentPages, setCurrentPages] = useState<string>('10');


    // 共通のタイマー停止ロジック
    const stopAllTimers = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current as NodeJS.Timeout);
            timerIntervalRef.current = null;
        }
        setSwRunning(false);
        setCountdownRunning(false);
    }, []);
    
    // ------------------------------------
    // 💾 セッション保存ロジック (★ 修正: 秒単位の記録に対応)
    // ------------------------------------
    const saveSession = useCallback((durationSeconds: number, pages: string, subject: string) => {
        if (durationSeconds > 0) {
            // ★ 修正: 秒数を分と残り秒数に正確に分解
            const durationMin = Math.floor(durationSeconds / 60);
            const secondsRemainder = durationSeconds % 60; 
            
            const pagesNum = parseInt(pages || '0', 10);

            const newSession: Session = {
                id: Date.now().toString(),
                subject: subject || 'その他',
                durationMin: durationMin,
                secondsRemainder: secondsRemainder, // ★ 秒数を保持
                pages: pagesNum,
                date: getCurrentDate(),
            };

            onAddSession(newSession);
        }
    }, [onAddSession]);


    // ------------------------------------
    // 🧠 ストップウォッチ ロジック
    // ------------------------------------
    const startStopwatch = useCallback(() => {
        stopAllTimers(); 
        timerIntervalRef.current = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
        setSwRunning(true);
    }, [stopAllTimers]);

    const stopStopwatch = useCallback(() => {
        stopAllTimers();
    }, [stopAllTimers]);

    const resetStopwatch = useCallback(() => {
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
                        stopStopwatch();
                        setElapsedTime(0);
                        Vibration.vibrate(500); 
                    },
                    style: 'default',
                },
            ]
        );
    }, [elapsedTime, currentPages, currentSubject, stopStopwatch, saveSession]);
    
    // ------------------------------------
    // ⏳ カウントダウンタイマー ロジック
    // ------------------------------------
    const startCountdown = useCallback(() => {
        if (timeRemaining <= 0) {
             Alert.alert('エラー', 'タイマー時間を設定してください。');
             return;
        }
        stopAllTimers(); 
        
        setIsPaused(false); // ★ 修正: 再開時には一時停止状態を解除
        
        timerIntervalRef.current = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerIntervalRef.current as NodeJS.Timeout);
                    setCountdownRunning(false);
                    setIsPaused(false); 
                    
                    Vibration.vibrate([0, 300, 300, 300, 300, 300]); 
                    
                    const durationSeconds = targetTime;

                    Alert.alert(
                        '時間です！',
                        `設定した ${Math.floor(targetTime/60)}分 が経過しました。記録を保存しますか？`,
                        [
                            { text: 'キャンセル', style: 'cancel' },
                            {
                                text: '保存',
                                onPress: () => {
                                    saveSession(durationSeconds, currentPages, currentSubject);
                                    setTimeRemaining(targetTime); 
                                    Vibration.vibrate(500); 
                                },
                            },
                        ]
                    );
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        setCountdownRunning(true);
    }, [stopAllTimers, timeRemaining, targetTime, currentPages, currentSubject, saveSession]);

    const stopCountdown = useCallback(() => {
        if (!countdownRunning) return;
        stopAllTimers();
        setIsPaused(true); // ★ 修正: 一時停止状態を true にする
    }, [stopAllTimers, countdownRunning]);
    
    const resetCountdown = useCallback(() => {
        stopAllTimers();
        setIsPaused(false); // ★ 修正: Paused状態を false にする
        setTimeRemaining(targetTime);
    }, [stopAllTimers, targetTime]);
    
    useEffect(() => {
        if (!countdownRunning && !isPaused) { // ★ 修正: 実行中でも一時停止中でもない場合のみリセット
             setTimeRemaining(targetTime);
        }
    }, [targetTime, countdownRunning, isPaused]);
    
    // 手動入力用の保存関数
    const handleSaveManualSession = useCallback((session: Session) => {
        onAddSession(session);
        const formattedTime = formatMinToHourMin(session.durationMin, session.secondsRemainder); 
        Alert.alert('記録保存', `学習記録を保存しました。\n科目: ${session.subject}, 時間: ${formattedTime}`);
        Vibration.vibrate(500); 
    }, [onAddSession]);

    // 画面フォーカス時にタイマーを再開/停止
    useFocusEffect(
        useCallback(() => {
            return () => stopAllTimers(); 
        }, [stopAllTimers])
    );

    // TimeCardの集計値をsessionsから計算
    const todaySessions = sessions.filter(s => s.date === getCurrentDate());
    const todayDuration = todaySessions.reduce((sum, s) => sum + s.durationMin + Math.floor(s.secondsRemainder / 60), 0);
    const todayPages = todaySessions.reduce((sum, s) => sum + s.pages, 0);
    const recentSessions = sessions.slice(0, 7);
    const recentDuration = recentSessions.reduce((sum, s) => sum + s.durationMin, 0);
    const recentSessionsCount = recentSessions.length;

    // ... (TimeCard Component, RecentSessionsCard Component のロジックは省略 - timer.tsxのままでOK) ...
    // --- TimeCard Component ---
    interface TimeCardProps {
        title: string;
        duration: string;
        detail: string;
        isPrimary: boolean;
    }
    const TimeCard: React.FC<TimeCardProps> = ({ title, duration, detail, isPrimary }) => {
        const isSeconds = duration.endsWith('s');
        let displayH = '0';
        let displayM = '0';
        let unit = 'm';

        if (isSeconds) {
            displayM = duration.replace('s', '');
            unit = 's';
        } else {
            const parts = duration.split('h ');
            if (parts.length > 1) { 
                displayH = parts[0];
                displayM = parts[1].replace('m', '');
            } else { 
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
    // ... (省略) ...


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
                    <Text style={[styles.textLg, styles.textSemiBold]}>学習時間記録</Text>
                    <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>ストップウォッチ/カウントダウン</Text>
                </View>

                {/* タブナビゲーション */}
                <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
                    <TouchableOpacity
                        onPress={() => setCurrentTab('stopwatch')}
                        style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'stopwatch' ? Colors.card : Colors.muted, elevation: currentTab === 'stopwatch' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
                    >
                        <Text style={styles.textSemiBold}>ストップウォッチ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setCurrentTab('timer')}
                        style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'timer' ? Colors.card : Colors.muted, elevation: currentTab === 'timer' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
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
                        timerRunning={swRunning}
                        elapsedTime={elapsedTime}
                        currentSubject={currentSubject}
                        currentPages={currentPages}
                        setCurrentSubject={setCurrentSubject}
                        setCurrentPages={setCurrentPages}
                        startTimer={startStopwatch}
                        stopTimer={stopStopwatch}
                        resetTimer={resetStopwatch}
                    />
                ) : currentTab === 'timer' ? (
                    <CountdownContent
                        targetTime={targetTime}
                        setTargetTime={setTargetTime}
                        countdownRunning={countdownRunning}
                        isPaused={isPaused} 
                        timeRemaining={timeRemaining}
                        currentSubject={currentSubject}
                        currentPages={currentPages}
                        setCurrentSubject={setCurrentSubject}
                        setCurrentPages={setCurrentPages}
                        startCountdown={startCountdown}
                        stopCountdown={stopCountdown}
                        resetCountdown={resetCountdown}
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