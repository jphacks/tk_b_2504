// AIによる解答生成とコミュニティ解答の表示コンポーネント

import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  Answer, Colors, Icon, mockAIAnswer, mockAnswers, mockPreviousQuestions, mockQuestion,
  Question,
  styles
} from './definition';

const QuestionAnswer: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'input' | 'history'>('input');
  const [showResults, setShowResults] = useState<boolean>(true);
  const [currentQuestion, setCurrentQuestion] = useState<string>(mockQuestion);
  const [communityTab, setCommunityTab] = useState<'community' | 'upload'>('community');

  const AiAnswerCard: React.FC = () => {
    // 答えの**ステップ**部分を太字にするための簡易的な処理
    const formattedAnswer = mockAIAnswer.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <Text key={index} style={{ fontWeight: 'bold', fontSize: 14, marginTop: 8 }}>{line.replace(/\*\*/g, '')}</Text>;
      }
      return <Text key={index} style={{ fontSize: 14, lineHeight: 22 }}>{line}</Text>;
    });
  
    return (
      <View style={[styles.card, { padding: 16, borderWidth: 2, borderColor: `${Colors.primary}30`, marginBottom: 16 }]}>
        <View style={{ paddingBottom: 12 }}>
          <View style={styles.flexRow}>
            <Icon name="Sparkles" style={{ fontSize: 20, color: Colors.primary, marginRight: 8 }} />
            <Text style={{ fontSize: 18, fontWeight: '600' }}>AI解答</Text>
          </View>
        </View>
        <View style={{ backgroundColor: `${Colors.primary}10`, borderRadius: 12, padding: 16 }}>
          <View style={[styles.flexRow, { marginBottom: 12 }]}>
            <View style={[styles.flexRow, { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: `${Colors.primary}CC` }]}>
              <Icon name="Sparkles" style={{ fontSize: 12, color: Colors.primaryForeground, marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: Colors.primaryForeground }}>AI生成</Text>
            </View>
          </View>
          <View>
            {formattedAnswer}
          </View>
        </View>
      </View>
    );
  };

  interface CommunityAnswerItemProps {
    answer: Answer;
  }
  const CommunityAnswerItem: React.FC<CommunityAnswerItemProps> = ({ answer }) => (
    <View style={{ padding: 16, borderWidth: 2, borderColor: Colors.border, borderRadius: 12, marginBottom: 12 }}>
      <View style={[styles.flexRow, { justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }]}>
        <View style={styles.flexRow}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${Colors.primary}1A`, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
            <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: 'bold' }}>{answer.userName[0]}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>{answer.userName}</Text>
            <View style={[styles.flexRow, { marginTop: 2 }]}>
              <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{answer.subject}</Text>
              <Text style={[styles.textMutedForeground, { fontSize: 12 }]}>{answer.date}</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={{ fontSize: 14, lineHeight: 22, marginBottom: 12 }}>{answer.content}</Text>
      <View style={styles.flexRow}>
        <TouchableOpacity style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: `${Colors.muted}B3`, marginRight: 8 }]}>
          <Icon name="ThumbsUp" style={{ fontSize: 14, color: Colors.mutedForeground, marginRight: 6 }} />
          <Text style={{ fontSize: 14, color: Colors.mutedForeground }}>{answer.votes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: `${Colors.muted}B3` }]}>
          <Icon name="ThumbsDown" style={{ fontSize: 14, color: Colors.mutedForeground }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const CommunityCard: React.FC = () => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>他の学習者の解答</Text>
        <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>参考になる解答に投票できます</Text>
      </View>

      {/* コミュニティタブナビゲーション */}
      <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
        <TouchableOpacity
          onPress={() => setCommunityTab('community')}
          style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: communityTab === 'community' ? Colors.card : Colors.muted, elevation: communityTab === 'community' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
        >
          <Text style={{ fontWeight: '600' }}>解答一覧</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCommunityTab('upload')}
          style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: communityTab === 'upload' ? Colors.card : Colors.muted, elevation: communityTab === 'upload' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
        >
          <Text style={{ fontWeight: '600' }}>投稿する</Text>
        </TouchableOpacity>
      </View>

      {communityTab === 'community' ? (
        <View>
          {mockAnswers.map((answer: Answer) => <CommunityAnswerItem key={answer.id} answer={answer} />)}
        </View>
      ) : (
        <View style={{ padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
          <View style={{ padding: 12, backgroundColor: `${Colors.primary}10`, borderWidth: 1, borderColor: `${Colors.primary}30`, borderRadius: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 12, flex: 1, color: '#000000B3' }}>投稿された解答は他の学習者と共有されます</Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>あなたの解答</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: Colors.border, padding: 10, borderRadius: 8, height: 100, marginBottom: 16, backgroundColor: Colors.card }}
            multiline={true}
            placeholder="あなたの解答や別解を入力..."
          />
          <TouchableOpacity
            style={[styles.flexRow, { height: 48, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }]}
            onPress={() => Alert.alert('投稿シミュレーション', '解答がコミュニティに投稿されました！')}
          >
            <Icon name="Upload" style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }} />
            <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>解答を投稿</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const InputContent: React.FC = () => (
    <View style={{ marginVertical: 10, padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>問題文</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: Colors.border, padding: 10, borderRadius: 8, height: 80, marginBottom: 16, backgroundColor: Colors.card }}
        multiline={true}
        value={currentQuestion}
        onChangeText={setCurrentQuestion}
        placeholder="問題文を入力してください..."
      />
      <TouchableOpacity
        onPress={() => setShowResults(true)}
        style={[styles.flexRow, { height: 48, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }]}
      >
        <Icon name="Sparkles" style={{ fontSize: 16, color: Colors.primaryForeground, marginRight: 8 }} />
        <Text style={{ fontSize: 16, color: Colors.primaryForeground, fontWeight: '600' }}>AI解答を生成</Text>
      </TouchableOpacity>
    </View>
  );

  const HistoryContent: React.FC = () => (
    <View style={{ marginVertical: 10, padding: 16, backgroundColor: Colors.muted, borderRadius: 8 }}>
      <Text style={{ fontSize: 12, color: Colors.mutedForeground, marginBottom: 10 }}>過去に解答した問題から選択</Text>
      {mockPreviousQuestions.slice(0, 6).map((question: Question) => (
        <TouchableOpacity
          key={question.id}
          onPress={() => {
            setCurrentQuestion(question.text);
            setShowResults(true);
          }}
          style={{
            padding: 12, borderRadius: 12, borderWidth: 2,
            borderColor: currentQuestion === question.text ? Colors.primary : Colors.border,
            backgroundColor: currentQuestion === question.text ? `${Colors.primary}10` : Colors.card,
            marginBottom: 8,
          }}
        >
          <View style={styles.flexRow}>
            <Text style={{ fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, color: Colors.mutedForeground, marginRight: 8 }}>{question.subject}</Text>
            <Text style={[styles.textMutedForeground, { fontSize: 12, marginLeft: 'auto' }]}>{question.date}</Text>
          </View>
          <Text style={[styles.textMutedForeground, { fontSize: 12, marginTop: 4, marginBottom: 2 }]}>{question.unit}</Text>
          <Text style={{ fontSize: 14 }}>{question.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
        <View style={[styles.flexRow, { justifyContent: 'space-between', paddingBottom: 12 }]}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>問題を入力</Text>
            <Text style={{ fontSize: 14, color: Colors.mutedForeground, marginTop: 2 }}>AI解答を生成できます</Text>
          </View>
          <TouchableOpacity style={[styles.flexRow, { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.border }]}>
            <Icon name="Camera" style={{ fontSize: 16, color: Colors.primary, marginRight: 6 }} />
            <Text style={{ fontSize: 14, color: Colors.primary }}>撮影</Text>
          </TouchableOpacity>
        </View>

        {/* タブナビゲーション */}
        <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => setCurrentTab('input')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'input' ? Colors.card : Colors.muted, elevation: currentTab === 'input' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <Text style={{ fontWeight: '600' }}>新規入力</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTab('history')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'history' ? Colors.card : Colors.muted, elevation: currentTab === 'history' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <Text style={{ fontWeight: '600' }}>履歴から選択</Text>
          </TouchableOpacity>
        </View>

        {currentTab === 'input' ? <InputContent /> : <HistoryContent />}
      </View>

      {showResults && (
        <>
          <AiAnswerCard />
          <CommunityCard />
        </>
      )}
    </View>
  );
};

export default QuestionAnswer;
