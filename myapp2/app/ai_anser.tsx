import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors, Icon, styles } from './definition';

// 🔸 Gemini API設定
const GEMINI_API_KEY = 'AIzaSyAgUl9pHBs6sWKFhn9EGfhDnSbx7CFKVv8';
const GEMINI_MODEL = 'models/gemini-2.5-pro';
const STORAGE_KEY = '@ai_question_history';

// ======================================
// 🧩 型定義
// ======================================
interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

interface Comment {
  id: string;
  answerId: string;
  parentId?: string;
  text: string;
  likes: number;
  replies: Comment[];
  createdAt: string;
}

// ======================================
// ✂️ 科目・範囲抽出
// ======================================
const extractSubjectAndRange = (text: string) => {
  const subjectMatch = text.match(/科目：(.+)/);
  const rangeMatch = text.match(/範囲：(.+)/);
  return {
    subject: subjectMatch ? subjectMatch[1].trim() : '',
    range: rangeMatch ? rangeMatch[1].trim() : '',
  };
};

// ======================================
// 📝 QuestionInput
// ======================================
const QuestionInput = React.memo(
  ({ value, onChange }: { value: string; onChange: (t: string) => void }) => (
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
          textAlignVertical: 'top',
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

// ======================================
// 💬 コメントセクション
// ======================================
const CommentSection: React.FC<{ answerId: string }> = ({ answerId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (text: string) => {
    if (!text.trim()) return;
    const newItem: Comment = {
      id: Date.now().toString(),
      answerId,
      text,
      likes: 0,
      replies: [],
      createdAt: new Date().toLocaleString('ja-JP'),
    };
    setComments((prev) => [...prev, newItem]);
    setNewComment('');
  };

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontWeight: 'bold' }}>💬 コメント</Text>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <TextInput
          placeholder="コメントを書く..."
          value={newComment}
          onChangeText={setNewComment}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 6,
            padding: 6,
          }}
        />
        <TouchableOpacity
          onPress={() => handleAddComment(newComment)}
          style={{
            marginLeft: 8,
            backgroundColor: Colors.primary,
            borderRadius: 6,
            paddingVertical: 6,
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ color: 'white' }}>投稿</Text>
        </TouchableOpacity>
      </View>

      {comments.length === 0 ? (
        <Text style={{ color: Colors.mutedForeground, marginTop: 4 }}>
          まだコメントはありません。
        </Text>
      ) : (
        comments.map((c) => (
          <Text key={c.id} style={{ marginTop: 4 }}>
            💬 {c.text}
          </Text>
        ))
      )}
    </View>
  );
};

// ======================================
// 📜 履歴タブ
// ======================================
const HistoryTab: React.FC<{
  history: HistoryItem[];
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  onDeleteHistory: (id: string) => void;
}> = ({ history, searchKeyword, setSearchKeyword, onDeleteHistory }) => {
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const { subject, range } = extractSubjectAndRange(item.answer);
      const keyword = searchKeyword.trim().toLowerCase();
      if (!keyword) return true;
      return (
        subject.toLowerCase().includes(keyword) ||
        range.toLowerCase().includes(keyword) ||
        item.question.toLowerCase().includes(keyword)
      );
    });
  }, [history, searchKeyword]);

  return (
    <ScrollView contentContainerStyle={{ padding: 10 }}>
      <TextInput
        placeholder="科目・範囲・問題文で検索"
        value={searchKeyword}
        onChangeText={setSearchKeyword}
        style={{
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 10,
          borderRadius: 8,
          backgroundColor: Colors.card,
          marginBottom: 12,
        }}
      />

      {filteredHistory.length === 0 ? (
        <Text style={{ textAlign: 'center', color: Colors.mutedForeground, marginTop: 20 }}>
          該当する履歴がありません
        </Text>
      ) : (
        filteredHistory.map((item) => {
          const { subject, range } = extractSubjectAndRange(item.answer);
          const explanationMatch = item.answer.match(/解説：([\s\S]*)/);
          const explanation = explanationMatch ? explanationMatch[1].trim() : item.answer;

          return (
            <View
              key={item.id}
              style={[styles.card, { marginBottom: 20, padding: 16, borderWidth: 1, borderColor: Colors.border }]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: Colors.mutedForeground }}>
                  {item.createdAt}　{subject && `${subject}`} {range && `${range}`}
                </Text>
                <TouchableOpacity onPress={() => onDeleteHistory(item.id)}>
                  <Text style={{ color: 'red', fontSize: 12 }}>🗑 削除</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontWeight: '600', fontSize: 14, marginVertical: 6 }}>
                問題：{item.question}
              </Text>

              <Text style={{ fontSize: 14, lineHeight: 22 }}>{explanation}</Text>

              <CommentSection answerId={item.id} />
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

// ======================================
// 🧠 メイン
// ======================================
const QuestionAnswer: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'input' | 'history'>('input');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // ✅ 履歴永続化用
  const historyRef = useRef<HistoryItem[]>([]);
  const [, forceUpdate] = useState(0);

  // ✅ 起動時に履歴を読み込む
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) historyRef.current = JSON.parse(json);
        forceUpdate((n) => n + 1);
      } catch (e) {
        console.error('履歴読み込み失敗', e);
      }
    })();
  }, []);

  // ✅ 履歴保存関数
  const saveHistory = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(historyRef.current));
    } catch (e) {
      console.error('履歴保存失敗', e);
    }
  };

  // ✅ 履歴追加
  const addHistoryItem = async (item: HistoryItem) => {
    historyRef.current = [item, ...historyRef.current];
    await saveHistory();
    forceUpdate((n) => n + 1);
  };

  // ✅ 履歴削除
  const deleteHistoryItem = async (id: string) => {
    historyRef.current = historyRef.current.filter((item) => item.id !== id);
    await saveHistory();
    forceUpdate((n) => n + 1);
  };

  // ✅ 出力整形
  const normalizeOutput = (text: string): string => {
    let cleaned = text.replace(/^はい.*?。/s, '').trim();
    if (!cleaned.includes('科目：')) cleaned = `科目：不明\n${cleaned}`;
    if (!cleaned.includes('範囲：')) cleaned = `範囲：不明\n${cleaned}`;
    if (!cleaned.includes('解答：')) cleaned += `\n\n解答：不明`;
    if (!cleaned.includes('解説：')) cleaned += `\n\n解説：不明`;
    return cleaned;
  };

  // ✅ Gemini呼び出し
  const fetchGeminiAnswer = async () => {
    if (!currentQuestion.trim()) {
      Alert.alert('エラー', '問題文を入力してください');
      return;
    }

    setLoading(true);
    setAiAnswer('');
    setShowResults(true);

    try {
      const prompt = `
あなたは専門的で正確な教師です。
以下の問題について、事実に基づいてのみ回答してください。
創作・推測・ハルシネーションは禁止です。
次のフォーマットで出力してください。必ず「科目」「範囲」「解答」「解説」を含めてください。
わからない場合は「不明」と出力します。

出力フォーマット：
科目：◯◯
範囲：◯◯
解答：◯◯
解説：◯◯

問題：
${currentQuestion}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generated) {
        const cleaned = normalizeOutput(generated);
        setAiAnswer(cleaned);
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          question: currentQuestion,
          answer: cleaned,
          createdAt: new Date().toLocaleString('ja-JP'),
        };
        await addHistoryItem(newItem);
      } else {
        Alert.alert('生成失敗', 'AIから解答を取得できませんでした。');
        setShowResults(false);
      }
    } catch (e) {
      Alert.alert('通信エラー', 'Gemini APIとの通信に失敗しました');
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 現在の履歴
  const history = historyRef.current;

  return (
    <View style={{ flex: 1 }}>
      {/* タブ */}
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
          enableOnAndroid
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 30}
        >
          <View style={{ flex: 1, padding: 10 }}>
            <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>問題を入力</Text>
              <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>
                AIが科目・範囲・解答・解説を生成します
              </Text>

              <QuestionInput value={currentQuestion} onChange={setCurrentQuestion} />

              <TouchableOpacity
                onPress={fetchGeminiAnswer}
                disabled={loading}
                style={[
                  styles.flexRow,
                  {
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: loading ? Colors.muted : Colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                {loading && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
                <Text style={{ fontSize: 16, color: 'white', fontWeight: '600' }}>
                  AI解答を生成
                </Text>
              </TouchableOpacity>
            </View>

            {showResults && (
              <View
                style={[
                  styles.card,
                  { padding: 16, borderWidth: 2, borderColor: Colors.primary },
                ]}
              >
                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>AI出力</Text>
                <Text style={{ fontSize: 14, lineHeight: 22 }}>{aiAnswer}</Text>
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>
      ) : (
        <HistoryTab
          history={history}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          onDeleteHistory={deleteHistoryItem}
        />
      )}
    </View>
  );
};

export default QuestionAnswer;
