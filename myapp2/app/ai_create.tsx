// AIによる類似問題生成コンポーネント 

import React, { useState } from 'react';
// ★ Alertを追加
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  Colors,
  GeneratedQuestion,
  Icon, mockPreviousQuestions, mockQuestion,
  Question,
  styles
} from './definition';


// ★ PDF生成用の関数をインポート
import { createAiQuestionsHtml, generatePdfFromHtml } from './utils/PdfGenerator';
        
// ✅ Gemini API設定（高精度モデルを使用）
const GEMINI_API_KEY = "AIzaSyAgUl9pHBs6sWKFhn9EGfhDnSbx7CFKVv8"; // APIキーは安全に管理してください
const GEMINI_MODEL = "models/gemini-2.5-pro"; // 推奨モデルに変更

// ✅ 修正点: コンポーネントを外に定義
// 必要なpropsの型を定義
interface RangeContentProps {
  subject: string;
  setSubject: (text: string) => void;
  unit: string;
  setUnit: (text: string) => void;
}

// 範囲指定タブ
const RangeContent: React.FC<RangeContentProps> = ({ subject, setSubject, unit, setUnit }) => (
  <View style={styles.contentSection}>
    <Text style={styles.label}>科目</Text>
    <TextInput
      style={styles.inputBase}
      value={subject}
      onChangeText={setSubject}
      placeholder="例: 数学"
    />

    <Text style={[styles.label, { marginTop: 10 }]}>単元・範囲</Text>
    <TextInput
      style={styles.inputBase}
      value={unit}
      onChangeText={setUnit}
      placeholder="例: 三平方の定理"
    />

    <View style={[styles.infoBox, { marginTop: 15 }]}>
      <Icon name="Sparkles" style={{ color: Colors.primary, fontSize: 16, marginRight: 8, marginTop: 2 }} />
      <Text style={styles.infoBoxText}>選択した範囲から自動的に問題を生成します</Text>
    </View>
  </View>
);

// ✅ 修正点: コンポーネントを外に定義
interface HistoryContentProps {
    selectedQuestion: string;
    setSelectedQuestion: (text: string) => void;
}

// 解答履歴タブ
const HistoryContent: React.FC<HistoryContentProps> = ({ selectedQuestion, setSelectedQuestion }) => (
  <View style={styles.contentSection}>
    <Text style={[styles.textSm, styles.textMutedForeground, { marginBottom: 10 }]}>解答した問題から類似問題を生成</Text>
    {mockPreviousQuestions.filter(q => q.answered).map((question: Question) => (
      <TouchableOpacity
        key={question.id}
        onPress={() => setSelectedQuestion(question.text)}
        style={[
          styles.questionItemContainer,
          {
            borderColor: selectedQuestion === question.text ? Colors.primary : Colors.border,
            backgroundColor: selectedQuestion === question.text ? Colors.primaryLight : Colors.card,
          }
        ]}
      >
        <View style={styles.flexRow}>
          <Text style={styles.tagBase}>{question.subject}</Text>
          <View style={styles.answeredTag}>
            <Icon name="Check" style={{ fontSize: 12, color: Colors.greenDark, marginRight: 4 }} />
            <Text style={[styles.textSm, { color: Colors.greenDark }]}>解答済み</Text>
          </View>
          <Text style={[styles.textMutedForeground, styles.textSm, { marginLeft: 'auto' }]}>{question.date}</Text>
        </View>
        <Text style={[styles.textMutedForeground, styles.textSm, { marginTop: 4, marginBottom: 2 }]}>{question.unit}</Text>
        <Text style={styles.textMd}>{question.text}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ✅ 修正点: コンポーネントを外に定義
interface GeneratedQuestionItemProps {
    question: GeneratedQuestion;
    index: number;
    handleCopy: (id: string) => void;
}

// 生成された問題カード
const GeneratedQuestionItem: React.FC<GeneratedQuestionItemProps> = ({ question, index, handleCopy }) => (
  <View style={[styles.card, {
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    marginBottom: 10,
  }]}>
    <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 12 }]}>
      <View style={styles.flexRow}>
        <View style={[styles.flexRow, { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: Colors.primarySemiTransparent, marginRight: 8 }]}>
          <Icon name="Sparkles" style={{ fontSize: 12, color: Colors.primaryForeground, marginRight: 4 }} />
          <Text style={[styles.textSm, styles.textWhite]}>問題 {index + 1}</Text>
        </View>
        <Text style={styles.tagBase}>{question.subject}</Text>
        <Text style={styles.tagBase}>Lv.{question.difficulty}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleCopy(question.id)}
        style={[styles.flexRow, {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: question.copied ? Colors.greenSuccess : 'transparent',
          borderWidth: 1,
          borderColor: question.copied ? Colors.greenSuccess : Colors.primary,
          marginLeft: 'auto'
        }]}
      >
        <Icon name={question.copied ? 'Check' : 'Copy'} style={{ fontSize: 14, color: question.copied ? Colors.primaryForeground : Colors.primary, marginRight: 4 }} />
        <Text style={[styles.textMd, styles.textSemiBold, { color: question.copied ? Colors.primaryForeground : Colors.primary }]}>
          {question.copied ? 'コピー済み' : 'コピー'}
        </Text>
      </TouchableOpacity>
    </View>
    <Text style={[styles.textMd, { lineHeight: 20 }]}>{question.text}</Text>
  </View>
);

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

  // ★ PDF生成用のハンドラを追加
  const handleGeneratePdf = async () => {
    if (generatedQuestions.length === 0) {
      Alert.alert(
        'PDF出力エラー',
        'PDFに出力する問題がありません。先に「類似問題を生成」ボタンを押してください。'
      );
      return;
    }

    // 1. HTML文字列を生成
    //    (現在の生成結果と、元になった問題のテキストを渡す)
    const html = createAiQuestionsHtml(generatedQuestions, selectedQuestion);
    
    // 2. PDFを生成して共有
    await generatePdfFromHtml(html, 'AI生成問題.pdf');
  };

  const RangeContent: React.FC = () => (
    <View style={styles.contentSection}>
      <Text style={styles.label}>科目</Text>
      <TextInput
        style={styles.inputBase}
        value={subject}
        onChangeText={setSubject}
        placeholder="例: 数学"
      />

      <Text style={[styles.label, { marginTop: 10 }]}>単元・範囲</Text>
      <TextInput
        style={styles.inputBase}
        value={unit}
        onChangeText={setUnit}
        placeholder="例: 三平方の定理"
      />

      <View style={[styles.infoBox, { marginTop: 15 }]}>
        <Icon name="Sparkles" style={{ color: Colors.primary, fontSize: 16, marginRight: 8, marginTop: 2 }} />
        <Text style={styles.infoBoxText}>選択した範囲から自動的に問題を生成します</Text>
      </View>
    </View>
  );

  const HistoryContent: React.FC = () => (
    <View style={styles.contentSection}>
      <Text style={[styles.textSm, styles.textMutedForeground, { marginBottom: 10 }]}>解答した問題から類似問題を生成</Text>
      {mockPreviousQuestions.filter(q => q.answered).map((question: Question) => (
        <TouchableOpacity
          key={question.id}
          onPress={() => setSelectedQuestion(question.text)}
          style={[
            styles.questionItemContainer,
            {
              borderColor: selectedQuestion === question.text ? Colors.primary : Colors.border,
              backgroundColor: selectedQuestion === question.text ? Colors.primaryLight : Colors.card,
            }
          ]}
        >
          <View style={styles.flexRow}>
            <Text style={styles.tagBase}>{question.subject}</Text>
            <View style={styles.answeredTag}>
              <Icon name="Check" style={{ fontSize: 12, color: Colors.greenDark, marginRight: 4 }} />
              <Text style={[styles.textSm, { color: Colors.greenDark }]}>解答済み</Text>
            </View>
            <Text style={[styles.textMutedForeground, styles.textSm, { marginLeft: 'auto' }]}>{question.date}</Text>
          </View>
          <Text style={[styles.textMutedForeground, styles.textSm, { marginTop: 4, marginBottom: 2 }]}>{question.unit}</Text>
          <Text style={styles.textMd}>{question.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  interface GeneratedQuestionItemProps {
    question: GeneratedQuestion;
    index: number;
  }
  const GeneratedQuestionItem: React.FC<GeneratedQuestionItemProps> = ({ question, index }) => (
    <View style={[styles.card, {
      padding: 16,
      backgroundColor: Colors.primaryLight,
      borderWidth: 2,
      borderColor: Colors.primaryBorder,
      marginBottom: 10,
    }]}>
      <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 12 }]}>
        <View style={styles.flexRow}>
          <View style={[styles.flexRow, { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: Colors.primarySemiTransparent, marginRight: 8 }]}>
            <Icon name="Sparkles" style={{ fontSize: 12, color: Colors.primaryForeground, marginRight: 4 }} />
            <Text style={[styles.textSm, styles.textWhite]}>問題 {index + 1}</Text>
          </View>
          <Text style={styles.tagBase}>{question.subject}</Text>
          <Text style={styles.tagBase}>{question.difficulty}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleCopy(question.id)}
          style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: question.copied ? Colors.greenSuccess : 'transparent', borderWidth: 1, borderColor: question.copied ? Colors.greenSuccess : Colors.primary, marginLeft: 'auto' }]}
        >
          <Icon name={question.copied ? 'Check' : 'Copy'} style={{ fontSize: 14, color: question.copied ? Colors.primaryForeground : Colors.primary, marginRight: 4 }} />
          <Text style={[styles.textMd, styles.textSemiBold, { color: question.copied ? Colors.primaryForeground : Colors.primary }]}>
            {question.copied ? 'コピー済み' : 'コピー'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.textMd, { lineHeight: 20 }]}>{question.text}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={[styles.card, { padding: 16, borderWidth: 2, borderColor: Colors.primaryBorder, marginBottom: 16 }]}>
        <View style={[styles.flexRow, { paddingBottom: 12, alignItems: 'flex-start' }]}>
          <Icon name="Wand2" style={{ fontSize: 20, color: Colors.primary, marginRight: 8, marginTop: 4 }} />
          <View style={styles.flexOne}>
            <Text style={[styles.textLg, styles.textSemiBold]}>類似問題を生成</Text>
            <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>AIが問題をもとに新しい問題を作成</Text>
          </View>
        </View>

        {/* タブナビゲーション */}
        <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => setCurrentTab('range')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'range' ? Colors.card : Colors.muted, elevation: currentTab === 'range' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <View style={styles.flexRow}>
              <Icon name="Target" style={[styles.textMd, { marginRight: 6 }]} />
              <Text style={styles.textSemiBold}>範囲指定</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTab('history')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'history' ? Colors.card : Colors.muted, elevation: currentTab === 'history' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <View style={styles.flexRow}>
              <Icon name="BookMarked" style={[styles.textMd, { marginRight: 6 }]} />
              <Text style={styles.textSemiBold}>解答履歴</Text>
            </View>
          </TouchableOpacity>
        </View>

        {currentTab === 'range' ? <RangeContent /> : <HistoryContent />}

        {/* 設定項目 */}
        <View style={[styles.flexRow, { marginVertical: 10, justifyContent: 'space-between' }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>生成数</Text>
            <TextInput
              style={styles.inputBase}
              value={numQuestions}
              onChangeText={setNumQuestions}
              placeholder="3問"
              keyboardType='numeric'
            />
          </View>
          <View style={styles.flexOne}>
            <Text style={styles.label}>難易度</Text>
            <TextInput
              style={styles.inputBase}
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
            styles.buttonPrimary,
            {
              marginTop: 16, opacity: !selectedQuestion || isGenerating ? 0.5 : 1,
            }
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator color={Colors.primaryForeground} style={{ marginRight: 8 }} />
          ) : (
            <Icon name="Sparkles" style={[styles.textMd, styles.textWhite, { marginRight: 8 }]} />
          )}
          <Text style={styles.buttonText}>
            {isGenerating ? '生成中...' : '類似問題を生成'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 生成結果の表示 */}
      {generatedQuestions.length > 0 && (
        <View style={[styles.card, { padding: 16, borderWidth: 2, marginBottom: 16 }]}>
          
          {/* ★ ヘッダー部分を変更 */}
          <View style={[styles.flexRow, { justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 }]}>
            <View>
              <View style={styles.flexRow}>
                <Icon name="Sparkles" style={{ fontSize: 20, color: Colors.primary, marginRight: 8 }} />
                <Text style={[styles.textLg, styles.textSemiBold]}>生成された問題</Text>
              </View>
              <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2, marginLeft: 28 }]}>
                {generatedQuestions.length}問の類似問題
              </Text>
            </View>
            
            {/* ★ PDF出力ボタンを追加 */}
            <TouchableOpacity
              onPress={handleGeneratePdf}
              style={styles.buttonSecondary} // 既存のスタイルを流用
            >
              <Icon name="Download" style={[styles.textSm, styles.textPrimary]} />
            </TouchableOpacity>
          </View>
          {/* ★ 変更ここまで */}

          <View style={{ marginTop: 10 }}>
            {generatedQuestions.map((q, index) => (
              <GeneratedQuestionItem key={q.id} question={q} index={index} />
            ))}
          </View>
          <View style={styles.infoBox}>
            <Icon name="Sparkles" style={{ color: Colors.primary, fontSize: 16, marginRight: 8, marginTop: 2 }} />
            <Text style={styles.infoBoxText}>生成された問題はAIによって作成されています。必要に応じて内容を確認・編集してご利用ください。</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuestionGenerator;