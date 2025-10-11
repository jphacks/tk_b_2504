// AIによる類似問題生成コンポーネント 

import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  Colors,
  GeneratedQuestion,
  Icon, mockPreviousQuestions, mockQuestion,
  Question,
  styles
} from './definition';

const QuestionGenerator: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'range' | 'history'>('range');
  const [selectedQuestion, setSelectedQuestion] = useState<string>(mockQuestion);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([
    { id: '1', text: '三角形DEFにおいて、DE=8cm, EF=15cm, ∠E=90°のとき、DFの長さを求めよ。', difficulty: '同レベル', subject: '数学', copied: false },
    { id: '2', text: 'Many students read the book. この文を受動態に書き換えよ。', difficulty: '同レベル', subject: '英語', copied: false },
    { id: '3', text: '質量3kgの物体に15Nの力を加えたとき、加速度を求めよ。', difficulty: '同レベル', subject: '物理', copied: false },
    { id: '4', text: '2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O の反応において、エタン30gが完全燃焼したとき生成する水の質量を求めよ。', difficulty: 'やや難しい', subject: '化学', copied: false },
    { id: '5', text: '細胞呼吸において、ミトコンドリアのどの部分でATP合成が行われるか答えよ。', difficulty: '同レベル', subject: '生物', copied: false },
  ]);
  const [numQuestions, setNumQuestions] = useState<string>('3');
  const [difficulty, setDifficulty] = useState<string>('similar');
  const [subject, setSubject] = useState<string>('math');
  const [unit, setUnit] = useState<string>('pythagoras');

  const handleGenerate = () => {
    if (!selectedQuestion || isGenerating) return;
    setIsGenerating(true);
    // モックデータで更新をシミュレーション
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = async (id: string) => {
    const question = generatedQuestions.find(q => q.id === id);
    if (!question) return;

    // Clipboard.setStringAsync(question.text) の代わりに、コピー済みのUIを更新
    
    const newQuestions = generatedQuestions.map(q =>
      q.id === id ? { ...q, copied: true } : q
    );
    setGeneratedQuestions(newQuestions);

    setTimeout(() => {
      const resetQuestions = newQuestions.map(q =>
        q.id === id ? { ...q, copied: false } : q
      );
      setGeneratedQuestions(resetQuestions);
    }, 2000);
  };

  const RangeContent: React.FC = () => (
    <View style={{ marginVertical: 10, padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 5 }}>科目</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
        value={subject}
        onChangeText={setSubject}
        placeholder="例: 数学"
      />
      
      <Text style={{ fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 5 }}>単元・範囲</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
        value={unit}
        onChangeText={setUnit}
        placeholder="例: 三平方の定理"
      />

      <View style={{ padding: 12, backgroundColor: `${Colors.primary}10`, borderWidth: 1, borderColor: `${Colors.primary}30`, borderRadius: 12, marginTop: 15, flexDirection: 'row', alignItems: 'flex-start' }}>
        <Icon name="Sparkles" style={{ color: Colors.primary, fontSize: 16, marginRight: 8, marginTop: 2 }} />
        <Text style={{ fontSize: 12, flex: 1, color: '#000000B3' }}>選択した範囲から自動的に問題を生成します</Text>
      </View>
    </View>
  );

  const HistoryContent: React.FC = () => (
    <View style={{ marginVertical: 10, padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
      <Text style={{ fontSize: 12, color: Colors.mutedForeground, marginBottom: 10 }}>解答した問題から類似問題を生成</Text>
      {mockPreviousQuestions.filter(q => q.answered).map((question: Question) => (
        <TouchableOpacity
          key={question.id}
          onPress={() => setSelectedQuestion(question.text)}
          style={{
            padding: 12, borderRadius: 12, borderWidth: 2,
            borderColor: selectedQuestion === question.text ? Colors.primary : Colors.border,
            backgroundColor: selectedQuestion === question.text ? `${Colors.primary}10` : Colors.card,
            marginBottom: 8,
          }}
        >
          <View style={styles.flexRow}>
            <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{question.subject}</Text>
            <View style={[styles.flexRow, { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: '#D1FAE5', alignItems: 'center' }]}>
              <Icon name="Check" style={{ fontSize: 12, color: '#059669', marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: '#059669' }}>解答済み</Text>
            </View>
            <Text style={[styles.textMutedForeground, { fontSize: 12, marginLeft: 'auto' }]}>{question.date}</Text>
          </View>
          <Text style={[styles.textMutedForeground, { fontSize: 12, marginTop: 4, marginBottom: 2 }]}>{question.unit}</Text>
          <Text style={{ fontSize: 14 }}>{question.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  interface GeneratedQuestionItemProps {
    question: GeneratedQuestion;
    index: number;
  }
  const GeneratedQuestionItem: React.FC<GeneratedQuestionItemProps> = ({ question, index }) => (
    <View style={{
      padding: 16, backgroundColor: `${Colors.primary}10`, borderRadius: 12, borderWidth: 2,
      borderColor: `${Colors.primary}30`, marginBottom: 10,
    }}>
      <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 12 }]}>
        <View style={styles.flexRow}>
          <View style={[styles.flexRow, { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: `${Colors.primary}CC`, marginRight: 8 }]}>
            <Icon name="Sparkles" style={{ fontSize: 12, color: Colors.primaryForeground, marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: Colors.primaryForeground }}>問題 {index + 1}</Text>
          </View>
          <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{question.subject}</Text>
          <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground }}>{question.difficulty}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleCopy(question.id)}
          style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: question.copied ? Colors.greenSuccess : 'transparent', borderWidth: 1, borderColor: question.copied ? Colors.greenSuccess : Colors.primary, marginLeft: 'auto' }]}
        >
          <Icon name={question.copied ? 'Check' : 'Copy'} style={{ fontSize: 14, color: question.copied ? Colors.primaryForeground : Colors.primary, marginRight: 4 }} />
          <Text style={{ fontSize: 14, color: question.copied ? Colors.primaryForeground : Colors.primary, fontWeight: '600' }}>
            {question.copied ? 'コピー済み' : 'コピー'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 14, lineHeight: 20 }}>{question.text}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={[styles.card, { padding: 16, borderWidth: 2, borderColor: `${Colors.primary}30`, marginBottom: 16 }]}>
        <View style={[styles.flexRow, { paddingBottom: 12, alignItems: 'flex-start' }]}>
          <Icon name="Wand2" style={{ fontSize: 20, color: Colors.primary, marginRight: 8, marginTop: 4 }} />
          <View style={styles.flexOne}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>類似問題を生成</Text>
            <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>AIが問題をもとに新しい問題を作成</Text>
          </View>
        </View>

        {/* タブナビゲーション */}
        <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => setCurrentTab('range')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'range' ? Colors.card : Colors.muted, elevation: currentTab === 'range' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <View style={styles.flexRow}>
              <Icon name="Target" style={{ fontSize: 14, marginRight: 6 }} />
              <Text style={{ fontWeight: '600' }}>範囲指定</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTab('history')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'history' ? Colors.card : Colors.muted, elevation: currentTab === 'history' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <View style={styles.flexRow}>
              <Icon name="BookMarked" style={{ fontSize: 14, marginRight: 6 }} />
              <Text style={{ fontWeight: '600' }}>解答履歴</Text>
            </View>
          </TouchableOpacity>
        </View>

        {currentTab === 'range' ? <RangeContent /> : <HistoryContent />}
        
        {/* 設定項目 */}
        <View style={[styles.flexRow, { marginVertical: 10, justifyContent: 'space-between' }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>生成数</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
              value={numQuestions}
              onChangeText={setNumQuestions}
              placeholder="3問"
              keyboardType='numeric'
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4 }}>難易度</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: Colors.border, padding: 8, borderRadius: 8, backgroundColor: Colors.card }}
              value={difficulty}
              onChangeText={setDifficulty}
              placeholder="同レベル"
            />
          </View>
        </View>

        {/* 生成ボタン */}
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={!selectedQuestion || isGenerating}
          style={[
            styles.flexRow,
            {
              height: 48, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
              marginTop: 16, opacity: !selectedQuestion || isGenerating ? 0.5 : 1,
            }
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator color={Colors.primaryForeground} style={{ marginRight: 8 }} />
          ) : (
            <Icon name="Sparkles" style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }} />
          )}
          <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>
            {isGenerating ? '生成中...' : '類似問題を生成'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 生成結果の表示 */}
      {generatedQuestions.length > 0 && (
        <View style={[styles.card, { padding: 16, borderWidth: 2, marginBottom: 16 }]}>
          <View style={{ paddingBottom: 12 }}>
            <View style={styles.flexRow}>
              <Icon name="Sparkles" style={{ fontSize: 20, color: Colors.primary, marginRight: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: '600' }}>生成された問題</Text>
            </View>
            <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>{generatedQuestions.length}問の類似問題</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            {generatedQuestions.map((q, index) => (
              <GeneratedQuestionItem key={q.id} question={q} index={index} />
            ))}
          </View>
          <View style={{ padding: 12, backgroundColor: `${Colors.primary}10`, borderWidth: 1, borderColor: `${Colors.primary}30`, borderRadius: 12, marginTop: 15, flexDirection: 'row', alignItems: 'flex-start' }}>
            <Icon name="Sparkles" style={{ color: Colors.primary, fontSize: 16, marginRight: 8, marginTop: 2 }} />
            <Text style={{ fontSize: 12, flex: 1, color: '#000000B3' }}>生成された問題はAIによって作成されています。必要に応じて内容を確認・編集してご利用ください。</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuestionGenerator;
