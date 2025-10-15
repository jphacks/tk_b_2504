// 問題入力とAI解答表示コンポーネント

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
        return <Text key={index} style={styles.aiAnswerStepText}>{line.replace(/\*\*/g, '')}</Text>;
      }
      return <Text key={index} style={styles.aiAnswerBodyText}>{line}</Text>;
    });

    return (
      <View style={[styles.card, { padding: 16, borderWidth: 2, borderColor: Colors.primaryBorder, marginBottom: 16 }]}>
        <View style={{ paddingBottom: 12 }}>
          <View style={styles.flexRow}>
            <Icon name="Sparkles" style={{ fontSize: 20, color: Colors.primary, marginRight: 8 }} />
            <Text style={[styles.textLg, styles.textSemiBold]}>AI解答</Text>
          </View>
        </View>
        <View style={styles.aiResultBox}>
          <View style={[styles.flexRow, { marginBottom: 12 }]}>
            <View style={[styles.flexRow, { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: Colors.primarySemiTransparent }]}>
              <Icon name="Sparkles" style={{ fontSize: 12, color: Colors.primaryForeground, marginRight: 4 }} />
              <Text style={[styles.textSm, styles.textWhite]}>AI生成</Text>
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
          <View style={[styles.communityAvatar, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.textSm, styles.textPrimary, styles.textBold]}>{answer.userName[0]}</Text>
          </View>
          <View>
            <Text style={[styles.textMd, styles.textSemiBold]}>{answer.userName}</Text>
            <View style={[styles.flexRow, { marginTop: 2 }]}>
              <Text style={styles.tagBase}>{answer.subject}</Text>
              <Text style={[styles.textMutedForeground, styles.textSm]}>{answer.date}</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={{ fontSize: 14, lineHeight: 22, marginBottom: 12 }}>{answer.content}</Text>
      <View style={styles.flexRow}>
        <TouchableOpacity style={styles.voteButton}>
          <Icon name="ThumbsUp" style={[styles.textSm, styles.textMutedForeground, { marginRight: 6 }]} />
          <Text style={[styles.textMd, styles.textMutedForeground]}>{answer.votes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.voteButton, { marginRight: 0 }]}>
          <Icon name="ThumbsDown" style={[styles.textSm, styles.textMutedForeground]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const CommunityCard: React.FC = () => (
    <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
      <View style={{ paddingBottom: 12 }}>
        <Text style={[styles.textLg, styles.textSemiBold]}>他の学習者の解答</Text>
        <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>参考になる解答に投票できます</Text>
      </View>

      {/* コミュニティタブナビゲーション */}
      <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
        <TouchableOpacity
          onPress={() => setCommunityTab('community')}
          style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: communityTab === 'community' ? Colors.card : Colors.muted, elevation: communityTab === 'community' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
        >
          <Text style={styles.textSemiBold}>解答一覧</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCommunityTab('upload')}
          style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: communityTab === 'upload' ? Colors.card : Colors.muted, elevation: communityTab === 'upload' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
        >
          <Text style={styles.textSemiBold}>投稿する</Text>
        </TouchableOpacity>
      </View>

      {communityTab === 'community' ? (
        <View>
          {mockAnswers.map((answer: Answer) => <CommunityAnswerItem key={answer.id} answer={answer} />)}
        </View>
      ) : (
        <View style={styles.contentSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>投稿された解答は他の学習者と共有されます</Text>
          </View>
          <Text style={[styles.textMd, styles.textSemiBold, { marginBottom: 4 }]}>あなたの解答</Text>
          <TextInput
            style={[styles.inputBase, { height: 100, marginBottom: 16 }]}
            multiline={true}
            placeholder="あなたの解答や別解を入力..."
          />
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => Alert.alert('投稿シミュレーション', '解答がコミュニティに投稿されました！')}
          >
            <Icon name="Upload" style={[styles.textSm, styles.textWhite, { marginRight: 8 }]} />
            <Text style={styles.buttonText}>解答を投稿</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const InputContent: React.FC = () => (
    <View style={styles.contentSection}>
      <Text style={[styles.textMd, styles.textSemiBold, { marginBottom: 4 }]}>問題文</Text>
      <TextInput
        style={[styles.inputBase, { height: 80, marginBottom: 16 }]}
        multiline={true}
        value={currentQuestion}
        onChangeText={setCurrentQuestion}
        placeholder="問題文を入力してください..."
      />
      <TouchableOpacity
        onPress={() => setShowResults(true)}
        style={styles.buttonPrimary}
      >
        <Icon name="Sparkles" style={[styles.textSm, styles.textWhite, { marginRight: 8 }]} />
        <Text style={styles.buttonText}>AI解答を生成</Text>
      </TouchableOpacity>
    </View>
  );

  const HistoryContent: React.FC = () => (
    <View style={styles.contentSection}>
      <Text style={[styles.textSm, styles.textMutedForeground, { marginBottom: 10 }]}>過去に解答した問題から選択</Text>
      {mockPreviousQuestions.slice(0, 6).map((question: Question) => (
        <TouchableOpacity
          key={question.id}
          onPress={() => {
            setCurrentQuestion(question.text);
            setShowResults(true);
          }}
          style={[
            styles.questionItemContainer,
            {
              borderColor: currentQuestion === question.text ? Colors.primary : Colors.border,
              backgroundColor: currentQuestion === question.text ? Colors.primaryLight : Colors.card,
            }
          ]}
        >
          <View style={styles.flexRow}>
            <Text style={styles.tagBase}>{question.subject}</Text>
            <Text style={[styles.textMutedForeground, styles.textSm, { marginLeft: 'auto' }]}>{question.date}</Text>
          </View>
          <Text style={[styles.textMutedForeground, styles.textSm, { marginTop: 4, marginBottom: 2 }]}>{question.unit}</Text>
          <Text style={styles.textMd}>{question.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingVertical: 10 }}>
      <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
        <View style={[styles.flexRow, { justifyContent: 'space-between', paddingBottom: 12 }]}>
          <View>
            <Text style={[styles.textLg, styles.textSemiBold]}>問題を入力</Text>
            <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>AI解答を生成できます</Text>
          </View>
          <TouchableOpacity style={styles.buttonSecondary}>
            <Icon name="Camera" style={[styles.textSm, styles.textPrimary, { marginRight: 6 }]} />
            <Text style={[styles.textMd, styles.textPrimary]}>撮影</Text>
          </TouchableOpacity>
        </View>

        {/* タブナビゲーション */}
        <View style={[styles.flexRow, { backgroundColor: Colors.muted, borderRadius: 8, padding: 4, marginBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => setCurrentTab('input')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'input' ? Colors.card : Colors.muted, elevation: currentTab === 'input' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <Text style={styles.textSemiBold}>新規入力</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentTab('history')}
            style={[styles.flexOne, { padding: 8, borderRadius: 8, backgroundColor: currentTab === 'history' ? Colors.card : Colors.muted, elevation: currentTab === 'history' ? 2 : 0, alignItems: 'center', justifyContent: 'center' }]}
          >
            <Text style={styles.textSemiBold}>履歴から選択</Text>
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