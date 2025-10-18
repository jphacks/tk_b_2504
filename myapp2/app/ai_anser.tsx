import React, { useState, useMemo } from 'react';
import {
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors, Icon, styles } from './definition';

// 🔸 Gemini API設定
const GEMINI_API_KEY = 'AIzaSyAdUTXLuQLHNQBJVuxebIoNpKkMGyvav9I'; // あなたのAPIキーに置き換えてください
const GEMINI_MODEL = 'models/gemini-2.5-pro'; // 推奨モデル

// 履歴用の型
interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

// ✂️ 科目・範囲を抽出する関数 (コンポーネント外に定義)
const extractSubjectAndRange = (text: string) => {
  const subjectMatch = text.match(/科目：(.+)/);
  const rangeMatch = text.match(/範囲：(.+)/);
  return {
    subject: subjectMatch ? subjectMatch[1].trim() : '',
    range: rangeMatch ? rangeMatch[1].trim() : '',
  };
};

// 📝 TextInputを独立コンポーネント化
const QuestionInput = React.memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (t: string) => void;
  }) => (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>問題文</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 10,
          borderRadius: 8,
          height: 80,
          marginBottom: 16,
          backgroundColor: Colors.card,
          textAlignVertical: 'top', // for Android
        }}
        multiline
        value={value}
        onChangeText={onChange}
        placeholder="ここに問題文を入力..."
        blurOnSubmit={false}
      />
    </View>
  )
);

// ✨ AI解答表示カード (コンポーネント外に定義)
const AiAnswerCard: React.FC<{ loading: boolean; aiAnswer: string }> = ({ loading, aiAnswer }) => {
  if (loading) {
    return (
      <View style={[styles.card, { padding: 16, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 8 }}>AI解答を生成中...</Text>
      </View>
    );
  }

  if (!aiAnswer) return null;

  const formattedAnswer = aiAnswer.split('\n').map((line, index) => (
    <Text key={index} style={{ fontSize: 14, lineHeight: 22, marginBottom: 4 }}>
      {line}
    </Text>
  ));

  return (
    <View
      style={[
        styles.card,
        { padding: 16, borderWidth: 2, borderColor: `${Colors.primary}30`, marginBottom: 16 },
      ]}
    >
      <View style={{ paddingBottom: 12 }}>
        <View style={styles.flexRow}>
          <Icon name="Sparkles" style={{ fontSize: 20, color: Colors.primary, marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: '600' }}>AI解答</Text>
        </View>
      </View>
      <View style={{ backgroundColor: `${Colors.primary}10`, borderRadius: 12, padding: 16 }}>
        {formattedAnswer}
      </View>
    </View>
  );
};

//  HISTAB コンポーネント (コンポーネント外に定義)
const HistoryTab: React.FC<{
    history: HistoryItem[];
    searchKeyword: string;
    setSearchKeyword: (keyword: string) => void;
}> = ({ history, searchKeyword, setSearchKeyword }) => {
    
    // useMemo を使ってフィルタリング処理を最適化
    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const { subject } = extractSubjectAndRange(item.answer);
            const keyword = searchKeyword.trim().toLowerCase();
            if (!keyword) return true;
            return (
                subject.toLowerCase().includes(keyword) ||
                item.question.toLowerCase().includes(keyword)
            );
        });
    }, [history, searchKeyword]);

    return (
        <View style={{ flex: 1 }}>
            {/* 🔍 検索ボックス */}
            <View style={{ padding: 8, backgroundColor: Colors.card }}>
                <TextInput
                    placeholder="科目名または問題文で検索"
                    value={searchKeyword}
                    onChangeText={setSearchKeyword}
                    blurOnSubmit={false}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={{
                        borderWidth: 1,
                        borderColor: Colors.border,
                        padding: 10,
                        borderRadius: 8,
                        height: 40,
                        backgroundColor: Colors.card,
                    }}
                />
            </View>

            {/* 履歴リスト */}
            <ScrollView
                contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag"
            >
                {filteredHistory.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: Colors.mutedForeground, marginTop: 20 }}>
                        該当する履歴がありません
                    </Text>
                ) : (
                    filteredHistory.map((item) => {
                        const { subject, range } = extractSubjectAndRange(item.answer);
                        return (
                            <View
                                key={item.id}
                                style={[
                                    styles.card,
                                    { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
                                ]}
                            >
                                <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 4 }]}>
                                    <Text style={{ fontSize: 12, color: Colors.mutedForeground }}>
                                        {item.createdAt}
                                    </Text>
                                    {(subject || range) && (
                                        <Text style={{ fontSize: 12, color: Colors.mutedForeground, flexShrink: 1, textAlign: 'right' }}>
                                            {subject}
                                            {subject && range ? '｜' : ''}
                                            {range}
                                        </Text>
                                    )}
                                </View>

                                <Text style={{ fontWeight: '600', fontSize: 14, marginBottom: 8 }}>
                                    問題：{item.question}
                                </Text>
                                <Text style={{ fontSize: 14, lineHeight: 22 }}>{item.answer}</Text>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};


const QuestionAnswer: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'input' | 'history'>('input');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 🧠 Gemini API 呼び出し
  const fetchGeminiAnswer = async () => {
    if (!currentQuestion.trim()) {
      Alert.alert('エラー', '問題文を入力してください');
      return;
    }

    setLoading(true);
    setAiAnswer('');
    setShowResults(true); // ローディング表示を開始

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${currentQuestion}\n\n---\n上記の問題に対して、以下のルールに従って必ず日本語で解答してください。\n\n【重要な指示】\n・不正確な情報や曖昧な推測を含めないこと（ハルシネーション禁止）\n・わからない場合は「わかりません」と明確に答えること\n・事実に基づき、正確で簡潔な記述を行うこと\n\n【出力形式】\n科目：〜\n範囲：〜\n解答：〜\n解説：〜\n\nこの形式を厳密に守ってください。`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
            },
          }),
        }
      );

      const data = await response.json();
      const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generated) {
        setAiAnswer(generated);

        // 履歴に追加
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          question: currentQuestion,
          answer: generated,
          createdAt: new Date().toLocaleString('ja-JP'),
        };
        setHistory((prev) => [newItem, ...prev]);
      } else {
        console.log('Gemini API response:', data);
        Alert.alert('生成失敗', `AIから解答を取得できませんでした。\n${data?.error?.message || ''}`);
        setShowResults(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('通信エラー', 'Gemini APIとの通信に失敗しました');
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* タブナビゲーション */}
      <View style={[styles.flexRow, { backgroundColor: Colors.muted, padding: 4 }]}>
        <TouchableOpacity
          onPress={() => setCurrentTab('input')}
          style={[
            styles.flexOne,
            {
              padding: 8,
              borderRadius: 8,
              backgroundColor: currentTab === 'input' ? Colors.card : Colors.muted,
              alignItems: 'center',
            },
          ]}
        >
          <Text style={{ fontWeight: '600' }}>新規入力</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentTab('history')}
          style={[
            styles.flexOne,
            {
              padding: 8,
              borderRadius: 8,
              backgroundColor: currentTab === 'history' ? Colors.card : Colors.muted,
              alignItems: 'center',
            },
          ]}
        >
          <Text style={{ fontWeight: '600' }}>履歴</Text>
        </TouchableOpacity>
      </View>

      {currentTab === 'input' ? (
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 30}
        >
          <View style={{ flex: 1, padding: 10 }}>
            {/* 入力部分 */}
            <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
              <View style={[styles.flexRow, { justifyContent: 'space-between', paddingBottom: 12 }]}>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '600' }}>問題を入力</Text>
                  <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>
                    AI解答と解説を自動生成します
                  </Text>
                </View>
              </View>

              <QuestionInput value={currentQuestion} onChange={setCurrentQuestion} />

              <TouchableOpacity
                onPress={fetchGeminiAnswer}
                disabled={loading} // ローディング中は無効化
                style={[
                  styles.flexRow,
                  {
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: loading ? Colors.muted : Colors.primary, // ローディング中の色変更
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <Icon
                  name="Sparkles"
                  style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }}
                />
                <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>
                  AI解答を生成
                </Text>
              </TouchableOpacity>
            </View>

            {showResults && <AiAnswerCard loading={loading} aiAnswer={aiAnswer} />}
          </View>
        </KeyboardAwareScrollView>
      ) : (
        <HistoryTab history={history} searchKeyword={searchKeyword} setSearchKeyword={setSearchKeyword} />
      )}
    </View>
  );
};

export default QuestionAnswer;