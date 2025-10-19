// ファイル名: ai_create.tsx
// AIによる類似問題生成コンポーネント（解答パース修正版）

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Colors,
  GeneratedQuestion,
  Icon,
  mockPreviousQuestions,
  Question,
  styles
} from './definition';
import { createAiQuestionsHtml, generatePdfFromHtml } from './utils/PdfGenerator';

// --- 入力コンポーネント ---
interface ControlledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  marginTop?: number;
}
const ControlledInput = React.memo(
  ({ label, value, onChangeText, placeholder, marginTop = 0 }: ControlledInputProps) => (
    <>
      <Text style={[styles.label, marginTop > 0 ? { marginTop } : {}]}>{label}</Text>
      <TextInput
        style={styles.inputBase}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        blurOnSubmit={false}
      />
    </>
  )
);

// --- 範囲指定タブ ---
interface RangeContentProps {
  subject: string;
  unit: string;
  setSubject: (text: string) => void;
  setUnit: (text: string) => void;
}
const RangeContent = React.memo(({ subject, unit, setSubject, setUnit }: RangeContentProps) => (
  <View style={styles.contentSection}>
    <ControlledInput label="科目" value={subject} onChangeText={setSubject} placeholder="例: 数学" />
    <ControlledInput
      label="単元・範囲"
      value={unit}
      onChangeText={setUnit}
      placeholder="例: 三平方の定理"
      marginTop={10}
    />
  </View>
));

// --- 解答履歴タブ ---
interface HistoryContentProps {
  selectedQuestion: string;
  setSelectedQuestion: (text: string) => void;
}
const HistoryContent = React.memo(({ selectedQuestion, setSelectedQuestion }: HistoryContentProps) => (
  <View style={styles.contentSection}>
    <Text style={[styles.textSm, styles.textMutedForeground, { marginBottom: 10 }]}>
      解答した問題から類似問題を生成
    </Text>
    {mockPreviousQuestions
      .filter(q => q.answered)
      .map((question: Question) => (
        <TouchableOpacity
          key={question.id}
          onPress={() => setSelectedQuestion(question.text)}
          activeOpacity={0.9}
          style={[
            styles.questionItemContainer,
            {
              borderColor:
                selectedQuestion === question.text ? Colors.primary : Colors.border,
              backgroundColor:
                selectedQuestion === question.text ? Colors.primaryLight : Colors.card
            }
          ]}
        >
          <View style={styles.flexRow}>
            <Text style={styles.tagBase}>{question.subject}</Text>
            <View style={styles.answeredTag}>
              <Icon
                name="Check"
                style={{ fontSize: 12, color: Colors.greenDark, marginRight: 4 }}
              />
              <Text style={[styles.textSm, { color: Colors.greenDark }]}>解答済み</Text>
            </View>
          </View>
          <Text style={styles.textMd}>{question.text}</Text>
        </TouchableOpacity>
      ))}
  </View>
));

// --- 問題カード ---
interface GeneratedQuestionItemProps {
  question: GeneratedQuestion;
  index: number;
  showAnswerMap: Record<string, boolean>;
  handleToggleAnswer: (id: string) => void;
  handleCopy: (id: string) => void;
}
const GeneratedQuestionItem = React.memo(
  ({
    question,
    index,
    showAnswerMap,
    handleToggleAnswer,
    handleCopy
  }: GeneratedQuestionItemProps) => (
    <View style={[styles.card, { padding: 16, marginBottom: 10 }]}>
      <View style={[styles.flexRow, { justifyContent: 'space-between' }]}>
        <Text style={[styles.textMd, { fontWeight: 'bold' }]}>問題 {index + 1}</Text>
        <TouchableOpacity onPress={() => handleCopy(question.id)}>
          <Icon
            name={question.copied ? 'Check' : 'Copy'}
            style={{
              color: question.copied ? Colors.greenSuccess : Colors.primary
            }}
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.textMd, { marginTop: 8 }]}>{question.text}</Text>

      {/* 回答トグル */}
      <TouchableOpacity
        onPress={() => handleToggleAnswer(question.id)}
        style={[
          styles.buttonSecondary,
          {
            marginTop: 12,
            alignSelf: 'flex-start',
            borderColor: showAnswerMap[question.id]
              ? Colors.destructive
              : Colors.primaryBorder,
            backgroundColor: Colors.card
          }
        ]}
      >
        <Icon
          name={showAnswerMap[question.id] ? 'ThumbsDown' : 'ThumbsUp'}
          style={[
            styles.textSm,
            {
              color: showAnswerMap[question.id]
                ? Colors.destructive
                : Colors.primary,
              marginRight: 6
            }
          ]}
        />
        <Text
          style={[
            styles.textMd,
            {
              color: showAnswerMap[question.id]
                ? Colors.destructive
                : Colors.primary
            }
          ]}
        >
          {showAnswerMap[question.id] ? '解答を隠す' : '解答を見る'}
        </Text>
      </TouchableOpacity>

      {/* 解答表示 */}
      {showAnswerMap[question.id] && (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: Colors.greenLight,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.greenSuccess
          }}
        >
          <Text style={[styles.label, { marginBottom: 4, color: Colors.greenDark }]}>
            正解
          </Text>
          <Text style={styles.textMd}>{question.answer}</Text>
        </View>
      )}
    </View>
  )
);

// --- Gemini API 設定 ---
const GEMINI_API_KEY = 'AIzaSyAgUl9pHBs6sWKFhn9EGfhDnSbx7CFKVv8';
const GEMINI_MODEL = 'models/gemini-2.5-pro';

// --- 出力パース（修正版） ---
interface ParsedQuestion {
  text: string;
  answer: string;
  subject: string;
  difficulty: string;
}

const parseGeneratedQuestions = (text: string): ParsedQuestion[] => {
  const questions: ParsedQuestion[] = [];
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  let currentQ: Partial<ParsedQuestion> = {};
  let isInsideQuestion = false;

  lines.forEach(line => {
    if (/^---Q\d*/i.test(line)) {
      if (currentQ.text && currentQ.answer) {
        questions.push({
          text: currentQ.text.trim(),
          answer: currentQ.answer.trim(),
          subject: currentQ.subject || '不明',
          difficulty: currentQ.difficulty || '標準'
        });
      }
      currentQ = {};
      isInsideQuestion = true;
      return;
    }

    if (isInsideQuestion) {
      const normalized = line.replace('：', ':').trim();

      if (/^科目\s*:/.test(normalized)) {
        currentQ.subject = normalized.split(':')[1]?.trim();
      } else if (/^難易度\s*:/.test(normalized)) {
        currentQ.difficulty = normalized.split(':')[1]?.trim();
      } else if (/^問題\s*:/.test(normalized)) {
        currentQ.text = normalized.split(':')[1]?.trim();
      } else if (/^解答\s*:/.test(normalized)) {
        currentQ.answer = normalized.split(':')[1]?.trim();
      } else if (currentQ.text && !currentQ.answer) {
        currentQ.text += ' ' + normalized;
      } else if (currentQ.answer) {
        currentQ.answer += ' ' + normalized;
      }
    }
  });

  if (currentQ.text && currentQ.answer) {
    questions.push({
      text: currentQ.text.trim(),
      answer: currentQ.answer.trim(),
      subject: currentQ.subject || '不明',
      difficulty: currentQ.difficulty || '標準'
    });
  }

  return questions;
};

// --- Gemini Prompt 生成 ---
const createGeminiPrompt = (
  tab: 'range' | 'history',
  selectedQ: string,
  subject: string,
  unit: string
): string => {
  let sourceText = '';
  if (tab === 'history' && selectedQ) {
    sourceText = `以下の問題と類似した問題を3問作成してください。\n元の問題: ${selectedQ}`;
  } else {
    sourceText = `科目「${subject}」、単元・範囲「${unit}」に関する問題を3問作成してください。`;
  }

  return `
あなたはAIの家庭教師です。生徒の学習のために、専門的で正確な問題を3問作成してください。
解答や解説は含めず、以下のフォーマットで出力してください。

${sourceText}

出力フォーマット (各問題の間に区切り線 ---Q[n] を必ず入れてください):
---Q1
科目: ◯◯
難易度: 基礎/標準/応用
問題: ◯◯
解答: ◯◯
---Q2
科目: ◯◯
難易度: 基礎/標準/応用
問題: ◯◯
解答: ◯◯
---Q3
科目: ◯◯
難易度: 基礎/標準/応用
問題: ◯◯
解答: ◯◯
`;
};

// --- メインコンポーネント ---
const QuestionGenerator: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'range' | 'history'>('range');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [subject, setSubject] = useState('');
  const [unit, setUnit] = useState('');
  const [showAnswerMap, setShowAnswerMap] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    if (!selectedQuestion && currentTab === 'history') {
      Alert.alert('エラー', '履歴から生成する場合は問題を選択してください。');
      return;
    }
    if (currentTab === 'range' && (!subject || !unit)) {
      Alert.alert('エラー', '科目と範囲を入力してください。');
      return;
    }
    if (isGenerating) return;

    setIsGenerating(true);
    Keyboard.dismiss();
    setGeneratedQuestions([]);
    setShowAnswerMap({});

    const prompt = createGeminiPrompt(currentTab, selectedQuestion, subject, unit);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        const parsed = parseGeneratedQuestions(generatedText);
        if (parsed.length > 0) {
          const finalQs: GeneratedQuestion[] = parsed.map((q, i) => ({
            id: `gen-${Date.now()}-${i}`,
            text: q.text,
            subject: q.subject,
            difficulty: q.difficulty,
            copied: false,
            answer: q.answer
          }));
          setGeneratedQuestions(finalQs);
        } else {
          Alert.alert('生成失敗', 'AIから有効な問題を取得できませんでした。');
        }
      } else {
        Alert.alert('生成失敗', 'AIから問題を取得できませんでした。');
      }
    } catch (e) {
      console.error('Gemini API Error:', e);
      Alert.alert('通信エラー', 'Gemini APIとの通信に失敗しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleAnswer = (id: string) => {
    setShowAnswerMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string) => {
    setGeneratedQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, copied: true } : q))
    );
    setTimeout(() => {
      setGeneratedQuestions(prev =>
        prev.map(q => (q.id === id ? { ...q, copied: false } : q))
      );
    }, 2000);
  };

  const handleGeneratePdf = async () => {
    if (generatedQuestions.length === 0) {
      Alert.alert('PDF出力エラー', 'PDFに出力する問題がありません。');
      return;
    }
    const source =
      currentTab === 'history'
        ? selectedQuestion
        : `科目: ${subject}\n範囲: ${unit}`;
    const html = createAiQuestionsHtml(generatedQuestions, source);
    await generatePdfFromHtml(html, 'AI生成問題.pdf');
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 10,
        paddingHorizontal: 16
      }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
    >
      <View style={{ flex: 1 }}>
        <View
          style={[
            styles.card,
            {
              padding: 16,
              borderWidth: 2,
              borderColor: Colors.primaryBorder,
              marginBottom: 16
            }
          ]}
        >
          <Text style={[styles.textLg, styles.textSemiBold, { marginBottom: 10 }]}>
            類似問題を生成
          </Text>

          {/* タブ切り替え */}
          <View
            style={[
              styles.flexRow,
              {
                backgroundColor: Colors.muted,
                borderRadius: 8,
                padding: 4,
                marginBottom: 16
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => setCurrentTab('range')}
              style={[
                styles.flexOne,
                {
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor:
                    currentTab === 'range' ? Colors.card : Colors.muted
                }
              ]}
            >
              <Text style={styles.textSemiBold}>範囲指定</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentTab('history')}
              style={[
                styles.flexOne,
                {
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor:
                    currentTab === 'history' ? Colors.card : Colors.muted
                }
              ]}
            >
              <Text style={styles.textSemiBold}>解答履歴</Text>
            </TouchableOpacity>
          </View>

          {currentTab === 'range' ? (
            <RangeContent
              key="range"
              subject={subject}
              unit={unit}
              setSubject={setSubject}
              setUnit={setUnit}
            />
          ) : (
            <HistoryContent
              key="history"
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
            />
          )}

          <TouchableOpacity
            onPress={handleGenerate}
            disabled={isGenerating}
            style={[
              styles.buttonPrimary,
              { marginTop: 16, opacity: isGenerating ? 0.6 : 1 }
            ]}
          >
            {isGenerating ? (
              <ActivityIndicator color={Colors.primaryForeground} />
            ) : (
              <Text style={styles.buttonText}>類似問題を生成</Text>
            )}
          </TouchableOpacity>
        </View>

        {generatedQuestions.length > 0 && (
          <View style={[styles.card, { padding: 16, borderWidth: 2, marginBottom: 16 }]}>
            <Text style={[styles.textLg, styles.textSemiBold, { marginBottom: 12 }]}>
              生成された問題
            </Text>
            {generatedQuestions.map((q, i) => (
              <GeneratedQuestionItem
                key={q.id}
                question={q}
                index={i}
                showAnswerMap={showAnswerMap}
                handleToggleAnswer={handleToggleAnswer}
                handleCopy={handleCopy}
              />
            ))}
            <TouchableOpacity onPress={handleGeneratePdf} style={styles.buttonSecondary}>
              <Text style={styles.textPrimary}>PDF出力</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default QuestionGenerator;
