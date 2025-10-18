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
const GEMINI_API_KEY = 'AIzaSyAgUl9pHBs6sWKFhn9EGfhDnSbx7CFKVv8';
const GEMINI_MODEL = 'models/gemini-2.5-pro';

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
// 🗨 コメント関連
// ======================================
const CommentItem: React.FC<{
  comment: Comment;
  onReply: (text: string, parentId: string) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ comment, onReply, onLike, onDelete }) => {
  const [replyText, setReplyText] = useState('');
  return (
    <View style={{ marginVertical: 8, paddingLeft: comment.parentId ? 20 : 0 }}>
      <Text style={{ fontWeight: 'bold' }}>💬 {comment.text}</Text>
      <Text style={{ color: Colors.mutedForeground, fontSize: 12 }}>{comment.createdAt}</Text>

      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        <TouchableOpacity onPress={() => onLike(comment.id)} style={{ marginRight: 10 }}>
          <Text>❤️ {comment.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(comment.id)} style={{ marginRight: 10 }}>
          <Text style={{ color: 'red' }}>削除</Text>
        </TouchableOpacity>
      </View>

      {/* 返信フォーム */}
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <TextInput
          placeholder="返信を書く..."
          value={replyText}
          onChangeText={setReplyText}
          style={{
            borderWidth: 1,
            borderColor: Colors.border,
            flex: 1,
            padding: 4,
            borderRadius: 4,
          }}
        />
        <TouchableOpacity
          onPress={() => {
            onReply(replyText, comment.id);
            setReplyText('');
          }}
          style={{
            marginLeft: 8,
            backgroundColor: Colors.primary,
            borderRadius: 4,
            paddingVertical: 4,
            paddingHorizontal: 8,
          }}
        >
          <Text style={{ color: 'white' }}>返信</Text>
        </TouchableOpacity>
      </View>

      {/* ネストされた返信 */}
      {comment.replies.length > 0 && (
        <View style={{ marginTop: 8 }}>
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// ======================================
// 💬 コメントセクション（履歴専用）
// ======================================
const CommentSection: React.FC<{ answerId: string }> = ({ answerId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (text: string, parentId?: string) => {
    if (!text.trim()) return;
    const newItem: Comment = {
      id: Date.now().toString(),
      answerId,
      parentId,
      text,
      likes: 0,
      replies: [],
      createdAt: new Date().toLocaleString('ja-JP'),
    };
    setComments((prev) => {
      if (parentId) {
        return prev.map((c) =>
          c.id === parentId ? { ...c, replies: [...c.replies, newItem] } : c
        );
      } else return [...prev, newItem];
    });
  };

  const handleLike = (id: string) => {
    const update = (list: Comment[]): Comment[] =>
      list.map((c) =>
        c.id === id
          ? { ...c, likes: c.likes + 1 }
          : { ...c, replies: update(c.replies) }
      );
    setComments((prev) => update(prev));
  };

  const handleDelete = (id: string) => {
    const remove = (list: Comment[]): Comment[] =>
      list.filter((c) => c.id !== id).map((c) => ({ ...c, replies: remove(c.replies) }));
    setComments((prev) => remove(prev));
  };

  return (
    <View style={{ marginTop: 12, borderTopWidth: 1, borderColor: Colors.border, paddingTop: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6 }}>💬 コメント</Text>

      {/* 入力欄 */}
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          placeholder="この解説へのコメントを書く..."
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
          onPress={() => {
            handleAddComment(newComment);
            setNewComment('');
          }}
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

      {/* コメント一覧 */}
      {comments.length === 0 ? (
        <Text style={{ color: Colors.mutedForeground }}>まだコメントはありません。</Text>
      ) : (
        comments
          .filter((c) => !c.parentId)
          .map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onReply={(text, pid) => handleAddComment(text, pid)}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))
      )}
    </View>
  );
};

// ======================================
// 📜 履歴タブ（削除機能追加済）
// ======================================
const HistoryTab: React.FC<{
  history: HistoryItem[];
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  onDeleteHistory: (id: string) => void;
}> = ({ history, searchKeyword, setSearchKeyword, onDeleteHistory }) => {
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
    <ScrollView contentContainerStyle={{ padding: 10 }}>
      <TextInput
        placeholder="科目名または問題文で検索"
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
                  {item.createdAt}　{subject} {range}
                </Text>
                <TouchableOpacity onPress={() => onDeleteHistory(item.id)}>
                  <Text style={{ color: 'red', fontSize: 12 }}>🗑 削除</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontWeight: '600', fontSize: 14, marginVertical: 6 }}>
                問題：{item.question}
              </Text>

              <Text style={{ fontSize: 14, lineHeight: 22, marginBottom: 6 }}>
                {explanation}
              </Text>

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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 🔸 履歴削除関数
  const handleDeleteHistory = (id: string) => {
    Alert.alert('確認', 'この履歴を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          setHistory((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  const fetchGeminiAnswer = async () => {
    if (!currentQuestion.trim()) {
      Alert.alert('エラー', '問題文を入力してください');
      return;
    }

    setLoading(true);
    setAiAnswer('');
    setShowResults(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${currentQuestion}\n\n---\n科目：〜\n範囲：〜\n解答：〜\n解説：〜`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generated) {
        setAiAnswer(generated);
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          question: currentQuestion,
          answer: generated,
          createdAt: new Date().toLocaleString('ja-JP'),
        };
        setHistory((prev) => [newItem, ...prev]);
      } else {
        Alert.alert('生成失敗', 'AIから解答を取得できませんでした。');
        setShowResults(false);
      }
    } catch {
      Alert.alert('通信エラー', 'Gemini APIとの通信に失敗しました');
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

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
                AI解答と解説を自動生成します
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
                <Icon
                  name="Sparkles"
                  style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }}
                />
                <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>
                  AI解答を生成
                </Text>
              </TouchableOpacity>
            </View>

            {showResults && (
              <View style={[styles.card, { padding: 16, borderWidth: 2, borderColor: Colors.primary }]}>
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
          onDeleteHistory={handleDeleteHistory}
        />
      )}
    </View>
  );
};

export default QuestionAnswer;
