import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import {
  Colors,
  GeneratedQuestion,
  Icon,
  mockPreviousQuestions,
  mockQuestion,
  Question,
  styles
} from './definition';

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
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);

  // ✅ 修正点: stateの初期値を空文字列に変更
  const [numQuestions, setNumQuestions] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

  // ✅ 不要文言を削除する関数
  const sanitizeText = (text: string): string => {
    return text
      .replace(/はい、?承知いたしました。?/gi, "")
      .replace(/承知いたしました。?/gi, "")
      .replace(/了解しました。?/gi, "")
      .replace(/わかりました。?/gi, "")
      .replace(/もちろんです。?/gi, "")
      .replace(/元の問題と(同じく|同様に)、?/gi, "")
      .replace(/問題を(作成|生成)します。?/gi, "")
      .replace(/類似問題を(出力|生成)します。?/gi, "")
      .replace(/それでは、?類似問題を(出力|提示|生成)します。?/gi, "")
      .replace(/以下のように類似問題を(生成|作成|出力)しました。?/gi, "")
      .replace(/以下の問題を(生成|作成)しました。?/gi, "")
      .replace(/問題を作成しました。?/gi, "")
      .replace(/問題を出力します。?/gi, "")
      .replace(/問題を生成しました。?/gi, "")
      .replace(/それでは問題を生成します。?/gi, "")
      .replace(/生成された問題は以下です。?/gi, "")
      .replace(/問題リストを以下に示します。?/gi, "")
      .replace(/-+/g, "")
      .trim();
  };

  // ✅ 難易度数値を説明文に変換
  const getDifficultyDescription = (level: string): string => {
    switch (level) {
      case '1': return '教科書レベルの基礎的な問題（例題レベルで誰でも解ける）。';
      case '2': return '教科書＋少し応用を含む基礎応用レベル。理解を確認できる内容。';
      case '3': return '標準的な入試・模試レベル。思考力を問うバランス型。';
      case '4': return '上位校・難関校入試レベルの応用問題。解法を工夫する必要がある。';
      case '5': return '非常に難しい発展・数学オリンピック級の問題。高度な思考を要する。';
      default: return '標準レベル。';
    }
  };

  // 🧠 Gemini APIで類似問題を生成
  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const difficultyText = getDifficultyDescription(difficulty || '3'); // デフォルト値を設定

      const prompt = `
あなたは優秀な教員です。
以下の問題を参考にして、同じ科目・単元・難易度レベルで新しい類似問題を${numQuestions || '3'}問作ってください。

出力は「問題文のみ」を箇条書きで出力してください。
解答・解説・余分な文（生成しました、出力します等）は不要です。

【元の問題】：
${selectedQuestion}

【科目】：${subject}
【単元】：${unit}
【難易度レベル】：${difficulty || '3'}（${difficultyText}）
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const cleanedText = sanitizeText(rawText);

      const lines: string[] = cleanedText
        .split(/\n/)
        .map((line: string) => line.replace(/^[-・\d\.\)\]]\s*/, "").trim())
        .filter((line: string) => line.length > 0);

      const newQuestions: GeneratedQuestion[] = lines.map((qText: string, i: number) => ({
        id: (Date.now() + i).toString(),
        text: qText,
        difficulty: difficulty || '3',
        subject,
        copied: false,
      }));

      setGeneratedQuestions(newQuestions);
    } catch (err) {
      console.error(err);
      Alert.alert("エラー", "類似問題の生成中にエラーが発生しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  // コピー処理
  const handleCopy = async (id: string) => {
    const question = generatedQuestions.find(q => q.id === id);
    if (!question) return;

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

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      {/* 上部カード */}
      <View style={[styles.card, { padding: 16, borderWidth: 2, borderColor: Colors.primaryBorder, marginBottom: 16 }]}>
        <View style={[styles.flexRow, { paddingBottom: 12, alignItems: 'flex-start' }]}>
          <Icon name="Wand2" style={{ fontSize: 20, color: Colors.primary, marginRight: 8, marginTop: 4 }} />
          <View style={styles.flexOne}>
            <Text style={[styles.textLg, styles.textSemiBold]}>類似問題を生成</Text>
          </View>
        </View>

        {/* タブ切替 */}
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

        {/* ✅ 修正点: propsを渡してコンポーネントを呼び出す */}
        {currentTab === 'range' ? (
          <RangeContent subject={subject} setSubject={setSubject} unit={unit} setUnit={setUnit} />
        ) : (
          <HistoryContent selectedQuestion={selectedQuestion} setSelectedQuestion={setSelectedQuestion} />
        )}

        {/* 設定項目 */}
        <View style={[styles.flexRow, { marginVertical: 10, justifyContent: 'space-between' }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>生成数</Text>
            <TextInput
              style={styles.inputBase}
              value={numQuestions}
              onChangeText={setNumQuestions}
              placeholder="例: 3"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.flexOne}>
            <Text style={styles.label}>難易度 (1〜5)</Text>
            <TextInput
              style={styles.inputBase}
              value={difficulty}
              onChangeText={setDifficulty}
              placeholder="例: 3"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* 生成ボタン */}
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={isGenerating}
          style={[
            styles.buttonPrimary,
            { marginTop: 16, opacity: isGenerating ? 0.5 : 1 }
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

      {/* 生成結果 */}
      {generatedQuestions.length > 0 && (
        <View style={[styles.card, { padding: 16, borderWidth: 2, marginBottom: 16 }]}>
          <View style={{ paddingBottom: 12 }}>
            <View style={styles.flexRow}>
              <Icon name="Sparkles" style={{ fontSize: 20, color: Colors.primary, marginRight: 8 }} />
              <Text style={[styles.textLg, styles.textSemiBold]}>生成された問題</Text>
            </View>
            <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>
              {generatedQuestions.length}問の類似問題（Lv.{difficulty || '3'}）
            </Text>
          </View>
          <View style={{ marginTop: 10 }}>
            {generatedQuestions.map((q, index) => (
              // ✅ 修正点: propsを渡してコンポーネントを呼び出す
              <GeneratedQuestionItem key={q.id} question={q} index={index} handleCopy={handleCopy} />
            ))}
          </View>
          <View style={styles.infoBox}>
            <Icon name="Sparkles" style={{ color: Colors.primary, fontSize: 16, marginRight: 8, marginTop: 2 }} />
            <Text style={styles.infoBoxText}>生成された問題はAIによって作成されています。内容を確認してから利用してください。</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuestionGenerator;