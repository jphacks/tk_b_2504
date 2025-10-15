// 学習レポート画面コンポーネント

import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  Colors, Icon,
  ReportData, SubjectBreakdown, formatMinToHourMin,
  monthlyData,
  styles,
  subjectData,
  weeklyData
} from './definition';

const StudyReport: React.FC = () => {
  const [reportType, setReportType] = useState<'week' | 'month'>('week');
  const currentData: ReportData[] = reportType === 'week' ? weeklyData : monthlyData;
  const totalDuration: number = currentData.reduce((sum, item) => sum + item.duration, 0);
  const totalPages: number = currentData.reduce((sum, item) => sum + item.pages, 0);
  const avgDaily: number = currentData.length === 0 ? 0 : Math.floor(totalDuration / currentData.length);

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
      {subjectData.map((item: SubjectBreakdown, index: number) => (
        <View key={index} style={{ marginBottom: 12 }}>
          <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 4 }]}>
            <View style={styles.flexRow}>
              <Text style={styles.tagBase}>{item.subject}</Text>
              <Text style={[styles.textMutedForeground, styles.textSm]}>{formatMinToHourMin(item.duration)}</Text>
            </View>
            <Text style={[styles.textMd, styles.textSemiBold]}>{item.percentage}%</Text>
          </View>
          <View style={styles.subjectBreakdownBar}>
            <View style={{ height: '100%', width: `${item.percentage}%`, backgroundColor: Colors.primary, borderRadius: 5 }} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 16 }]}>
        <TextInput
          style={[styles.inputBase, { flex: 1, marginRight: 8, padding: 8, borderRadius: 8, backgroundColor: Colors.card }]}
          value={reportType === 'week' ? '週間レポート' : '月間レポート'}
          onChangeText={(text) => setReportType(text.includes('週間') ? 'week' : 'month')}
          placeholder="レポート期間"
        />
        <TouchableOpacity style={styles.buttonSecondary}>
          <Icon name="Download" style={[styles.textSm, styles.textPrimary, { marginRight: 6 }]} />
          <Text style={[styles.textMd, styles.textPrimary]}>CSV</Text>
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
      <SubjectBreakdownCard />
    </View>
  );
};

export default StudyReport;