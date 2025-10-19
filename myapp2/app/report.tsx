// 学習レポート画面コンポーネント

import React, { useMemo, useState } from 'react';
import { Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";

import {
  Colors, Icon,
  ReportData,
  Session,
  SubjectBreakdown, formatMinToHourMin,
  styles
} from './definition';

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth > 448 ? 448 - 32 : screenWidth - 32;

interface StudyReportProps {
  sessions: Session[];
}

const dateToComparableNumber = (dateStr: string): number => {
  const [month, day] = dateStr.split('/').map(Number);
  return month * 100 + day;
};

const StudyReport: React.FC<StudyReportProps> = ({ sessions }) => {
  const [reportType, setReportType] = useState<'week' | 'month'>('week');

  const { totalDuration, totalPages, avgDaily, processedSubjectData, weeklyReportData, maxDuration, maxPages } = useMemo(() => {
    const totalDuration = sessions.reduce((sum, item) => sum + item.durationMin, 0);
    const totalPages = sessions.reduce((sum, item) => sum + item.pages, 0);

    const uniqueDates = new Set(sessions.map(s => s.date));
    const daysCount = uniqueDates.size;
    const avgDaily = daysCount === 0 ? 0 : Math.floor(totalDuration / daysCount);

    const subjectMap = new Map<string, { duration: number }>();
    sessions.forEach(session => {
      const data = subjectMap.get(session.subject) || { duration: 0 };
      data.duration += session.durationMin;
      subjectMap.set(session.subject, data);
    });

    const processedSubjectData: SubjectBreakdown[] = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      duration: data.duration,
      percentage: totalDuration === 0 ? 0 : Math.round((data.duration / totalDuration) * 100),
    })).sort((a, b) => b.duration - a.duration);

    const dataMap = sessions.reduce((map, session) => {
      const current = map.get(session.date) || { duration: 0, pages: 0 };
      current.duration += session.durationMin;
      current.pages += session.pages;
      map.set(session.date, current);
      return map;
    }, new Map<string, { duration: number, pages: number }>());

    const sortedUniqueDates = Array.from(dataMap.keys()).sort((a, b) => dateToComparableNumber(b) - dateToComparableNumber(a));

    const weeklyReportData: ReportData[] = sortedUniqueDates
      .slice(0, 7)
      .sort((a, b) => dateToComparableNumber(a) - dateToComparableNumber(b))
      .map(date => ({
        date: date,
        duration: dataMap.get(date)?.duration || 0,
        pages: dataMap.get(date)?.pages || 0,
      }));

    const maxDuration = Math.max(...weeklyReportData.map(d => d.duration), 60);
    const maxPages = Math.max(...weeklyReportData.map(d => d.pages), 10);

    return { totalDuration, totalPages, avgDaily, processedSubjectData, weeklyReportData, maxDuration, maxPages };
  }, [sessions]);

  interface ChartComponentProps {
    dataKey: 'duration' | 'pages';
    maxValue: number;
    unit: string;
  }
  const ChartComponent: React.FC<ChartComponentProps> = ({ dataKey, maxValue, unit }) => {
    const dataPoints = weeklyReportData.map(d =>
      dataKey === 'duration' ? Math.round(d.duration / 60 * 10) / 10 : d.pages
    );
    const labels = weeklyReportData.map(d => d.date);

    const Placeholder = (message: string) => (
      <View style={{
        height: 200,
        backgroundColor: Colors.muted,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={[styles.textMutedForeground, styles.textMd, { textAlign: 'center' }]}>{message}</Text>
      </View>
    );

    if (typeof LineChart === 'undefined') {
      return <>{Placeholder("グラフ描画エラー: ライブラリがロードされていません。アプリを完全に再起動してください。")}</>;
    }

    const chartData = {
      labels: labels.length > 0 ? labels : ['--'],
      datasets: [
        {
          data: dataPoints.length > 0 ? dataPoints : [0],
          color: (opacity = 1) => `rgba(68, 112, 166, ${opacity})`,
        }
      ]
    };

    const chartConfig = {
      backgroundColor: Colors.card,
      backgroundGradientFrom: Colors.card,
      backgroundGradientTo: Colors.card,
      decimalPlaces: dataKey === 'duration' ? 1 : 0,
      color: (opacity = 1) => `rgba(68, 112, 166, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
      style: { borderRadius: 16 },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: Colors.primary,
      }
    };

    const needsMoreDataWarning = labels.length === 1 ? (
      <Text style={[styles.textSm, { color: Colors.destructive, textAlign: 'center', position: 'absolute', top: 50, width: '100%', zIndex: 10 }]}>
        ★ 2日分の記録で折れ線が表示されます
      </Text>
    ) : null;

    return (
      <View style={{ overflow: 'hidden', borderRadius: 12 }}>
        {needsMoreDataWarning}
        <View>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={200}
            yAxisSuffix={unit === '分' ? 'h' : ''}
            chartConfig={chartConfig}
            bezier={labels.length > 1}
            style={{ paddingRight: 0 }}
            verticalLabelRotation={-15}
            yAxisLabel={unit === '分' ? '' : ''}
            yLabelsOffset={5}
            fromZero={true}
            yAxisInterval={1}
            segments={labels.length > 1 ? 4 : 1}
          />
        </View>
        <Text style={[styles.textSm, styles.textMutedForeground, { position: 'absolute', top: 10, right: 10 }]}>
          {unit === '分' ? '時間' : unit}
        </Text>
      </View>
    );
  };

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
    dataKey: 'duration' | 'pages';
    maxValue: number;
    unit: string;
  }
  const ChartCard: React.FC<ChartCardProps> = ({ title, description, dataKey, maxValue, unit }) => (
    <View style={[styles.card, { padding: 16, marginBottom: 16, paddingHorizontal: 0 }]}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text style={[styles.textLg, styles.textSemiBold]}>{title}</Text>
        <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>{description}</Text>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <ChartComponent
          dataKey={dataKey}
          maxValue={maxValue}
          unit={unit}
        />
      </View>
    </View>
  );

  const SubjectBreakdownCard: React.FC = () => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={[styles.textLg, styles.textSemiBold]}>科目別学習時間</Text>
        <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>時間の内訳と割合</Text>
      </View>
      {processedSubjectData.map((item: SubjectBreakdown, index: number) => (
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
      {processedSubjectData.length === 0 && (
        <Text style={[styles.textMutedForeground, { textAlign: 'center', paddingVertical: 20 }]}>学習記録がありません。</Text>
      )}
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

      <ChartCard
        title="学習時間の推移"
        description="最近7日間の学習時間の変化"
        dataKey="duration"
        maxValue={maxDuration}
        unit="分"
      />
      <ChartCard
        title="ページ数の推移"
        description="最近7日間の学習ページ数の変化"
        dataKey="pages"
        maxValue={maxPages}
        unit="ページ"
      />
      <SubjectBreakdownCard />
    </View>
  );
};

export default StudyReport;