// 学習タイマーコンポーネント

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
// @react-navigation/native がインストールされている前提
import { useFocusEffect } from '@react-navigation/native';
import {
  Colors,
  formatDuration,
  Icon, mockSessions,
  Session,
  styles
} from './definition';

const StudyTimer: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'stopwatch' | 'manual'>('stopwatch');
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  // タイマーIDの型をNodeJS.Timeoutまたはnumberとして定義
  const timerIntervalRef = useRef<NodeJS.Timeout | number | null>(null);

  const [currentSubject, setCurrentSubject] = useState<string>('数学');
  const [currentPages, setCurrentPages] = useState<string>('10');

  // タイマーロジック
  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current as NodeJS.Timeout);
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);
    setTimerRunning(true);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current as NodeJS.Timeout);
      timerIntervalRef.current = null;
    }
    setTimerRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setElapsedTime(0);
  };

  // 画面フォーカス時にタイマーを再開/停止
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

  interface TimeCardProps {
    title: string;
    duration: string;
    detail: string;
    isPrimary: boolean;
  }
  const TimeCard: React.FC<TimeCardProps> = ({ title, duration, detail, isPrimary }) => {
    // durationが 'Hh MMm' 形式であることを期待
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

  const StopwatchContent: React.FC = () => (
    <View style={{ marginVertical: 10 }}>
      <View style={{ backgroundColor: `${Colors.primary}10`, borderRadius: 12, padding: 32, alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 48, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: 'bold', marginBottom: 24 }}>{formatDuration(elapsedTime)}</Text>
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

  const ManualContent: React.FC = () => {
    const [manualSubject, setManualSubject] = useState<string>('');
    const [manualStartTime, setManualStartTime] = useState<string>('');
    const [manualEndTime, setManualEndTime] = useState<string>('');
    const [manualPages, setManualPages] = useState<string>('');

    const handleSave = () => {
      if (manualSubject && manualStartTime && manualEndTime) {
        Alert.alert('記録保存', `学習記録を保存しました。\n科目: ${manualSubject}, 時間: ${manualStartTime} - ${manualEndTime}`);
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
            <TextInput
              style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
              value={manualStartTime}
              onChangeText={setManualStartTime}
              placeholder="09:00"
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>終了時刻</Text>
            <TextInput
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

  const RecentSessionsCard: React.FC = () => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>最近の学習記録</Text>
      </View>
      <View>
        {mockSessions.map((session: Session) => (
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

export default StudyTimer;
