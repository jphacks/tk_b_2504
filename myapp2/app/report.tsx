// 学習レポート画面コンポーネント

import React, { useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  Colors, Icon,
  Session, SubjectBreakdown, formatMinToHourMin,
  monthlyData,
  styles,
  // NOTE: sessions propsから集計するため、以下のモックデータは不要だが、ChartCardのスタブ機能のため型を維持
  weeklyData
} from './definition';

// Helper function: 日付を 'MM/DD' 形式で取得 (timer.tsxと同じロジック)
const getCurrentDate = (): string => {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()}`;
};

// ★ propsにsessionsを追加
interface StudyReportProps {
    sessions: Session[];
}

// ★ propsを受け取り、集計ロジックを実装
const StudyReport: React.FC<StudyReportProps> = ({ sessions }) => {
  const [reportType, setReportType] = useState<'week' | 'month'>('week');
  // NOTE: 現在のロジックでは sessions の全期間を使用しているため、weeklyData/monthlyData は使用していません。
  const currentData: any[] = reportType === 'week' ? weeklyData : monthlyData; 

  // ====================================================================
  // データ集計ロジック (useMemoで最適化)
  // ====================================================================

  const { totalDuration, totalPages, avgDaily, subjectBreakdownData } = useMemo(() => {
    if (sessions.length === 0) {
        return { totalDuration: 0, totalPages: 0, avgDaily: 0, subjectBreakdownData: [] };
    }
    
    // 全学習時間とページ数を集計
    const allDuration = sessions.reduce((sum, s) => sum + s.durationMin, 0);
    const allPages = sessions.reduce((sum, s) => sum + s.pages, 0);

    // 科目別集計と日別集計 (平均計算用)
    const subjectMap: Record<string, number> = {};
    const dailyDurations: Record<string, number> = {};

    sessions.forEach(session => {
        // 科目別
        subjectMap[session.subject] = (subjectMap[session.subject] || 0) + session.durationMin;
        // 日別 (平均計算用)
        // 秒は分に含めて計算しないと、日別の日付数が正確にならない可能性があるため、合計分を計算。
        const totalMin = session.durationMin + Math.floor(session.secondsRemainder / 60);
        dailyDurations[session.date] = (dailyDurations[session.date] || 0) + totalMin;
    });

    const uniqueDays = Object.keys(dailyDurations).length;
    const calculatedAvgDaily = uniqueDays === 0 ? 0 : Math.floor(allDuration / uniqueDays);

    // SubjectBreakdown型に変換
    const calculatedSubjectBreakdown: SubjectBreakdown[] = Object.entries(subjectMap)
        .map(([subject, duration]) => ({
            subject,
            duration,
            percentage: allDuration === 0 ? 0 : Math.round((duration / allDuration) * 100),
        }))
        .sort((a, b) => b.duration - a.duration); // 時間の長い順にソート

    return {
        totalDuration: allDuration,
        totalPages: allPages,
        avgDaily: calculatedAvgDaily,
        subjectBreakdownData: calculatedSubjectBreakdown,
    };
  }, [sessions]);


  // SummaryCardの定義はそのまま使用
  
  interface SummaryCardProps {
    title: string;
    value: string | number;
    unit: string;
    isPrimary: boolean;
  }
  const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, unit, isPrimary }) => (
    <View style={[
      styles.card,
      styles.summaryCardBase,
      {
        borderWidth: isPrimary ? 2 : 1,
        borderColor: isPrimary ? Colors.primaryBorder : Colors.border
      }
    ]}>
      <Text style={[styles.textSm, styles.textMutedForeground, { marginBottom: 8 }]}>{title}</Text>
      <Text style={[styles.text2xl, styles.textBold]}>{value}</Text>
      <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 4 }]}>{unit}</Text>
    </View>
  );

  interface ChartCardProps {
    title: string;
    description: string;
    isBar: boolean;
  }
  const ChartCard: React.FC<ChartCardProps> = ({ title, description, isBar }) => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={[styles.textLg, styles.textSemiBold]}>{title}</Text>
        <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>{description}</Text>
      </View>
      <View style={styles.chartPlaceholder}>
        <Text style={[styles.textMutedForeground, styles.textMd]}>{isBar ? 'ページ数 (棒グラフのスタブ)' : '学習時間 (折れ線グラフのスタブ)'}</Text>
      </View>
    </View>
  );

  const SubjectBreakdownCard: React.FC = () => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={[styles.textLg, styles.textSemiBold]}>科目別学習時間</Text>
        <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>時間の内訳と割合</Text>
      </View>
      {subjectBreakdownData.map((item: SubjectBreakdown, index: number) => ( // ★ subjectBreakdownDataを使用
        <View key={index} style={{ marginBottom: 12 }}>
          <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 4 }]}>
            <View style={styles.flexRow}>
              <Text style={styles.tagBase}>{item.subject}</Text>
              <Text style={[styles.textMutedForeground, styles.textSm]}>{formatMinToHourMin(item.duration)}</Text>
            </View>
            <Text style={[styles.textMd, styles.textSemiBold]}>{item.percentage}%</Text>
          </View>
          <View style={styles.subjectBreakdownBar}>
            {/* ★ 割合に基づいてバーの幅を決定 */}
            <View style={{ height: '100%', width: `${item.percentage}%`, backgroundColor: Colors.primary, borderRadius: 5 }} />
          </View>
        </View>
      ))}
      {subjectBreakdownData.length === 0 && (
          <Text style={[styles.textMutedForeground, { textAlign: 'center', marginTop: 10 }]}>まだ学習記録がありません。</Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 16 }]}>
        <TextInput
          style={[styles.inputBase, { flex: 1, marginRight: 8, padding: 8, borderRadius: 8, backgroundColor: Colors.card }]}
          value={reportType === 'week' ? '週間レポート (全期間データ)' : '月間レポート (全期間データ)'} // ★ sessionsで集計していることを明示
          onChangeText={(text) => setReportType(text.includes('週間') ? 'week' : 'month')}
          placeholder="レポート期間"
        />
        <TouchableOpacity style={styles.buttonSecondary}>
          <Icon name="Download" style={[styles.textSm, styles.textPrimary, { marginRight: 6 }]} />
          <Text style={[styles.textMd, styles.textPrimary]}>CSV</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.flexRow}>
        {/* ★ 計算値を使用 */}
        <SummaryCard title="合計時間 (全期間)" value={Math.floor(totalDuration / 60) + 'h'} unit={(totalDuration % 60) + 'm'} isPrimary={true} />
        <View style={{ width: 10 }} />
        <SummaryCard title="平均/日" value={Math.floor(avgDaily / 60) + 'h'} unit={(avgDaily % 60) + 'm'} isPrimary={false} />
        <View style={{ width: 10 }} />
        <SummaryCard title="総ページ" value={totalPages} unit="ページ" isPrimary={false} />
      </View>

      <ChartCard title="学習時間の推移" description={reportType === 'week' ? '過去7日間 (スタブ)' : '過去4週間 (スタブ)'} isBar={false} />
      <ChartCard title="ページ数の推移" description="学習進捗の可視化 (スタブ)" isBar={true} />
      <SubjectBreakdownCard />
    </View>
  );
};

export default StudyReport;