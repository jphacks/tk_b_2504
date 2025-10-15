// 学習メモ機能コンポーネント (画像インポート機能とUI修正済み)

import React, { useState } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
    Colors, Icon,
    Memo,
    mockMemos,
    styles
} from './definition';

// ※ 実際の開発では、以下のライブラリをインストールし、スタブを置き換える必要があります。
// import * as ImagePicker from 'expo-image-picker'; 

const getCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

const StudyMemo: React.FC = () => {
    const [memos, setMemos] = useState<Memo[]>(mockMemos);
    const [newMemoText, setNewMemoText] = useState<string>('');
    const [newMemoSubject, setNewMemoSubject] = useState<string>('');
    const [newMemoTags, setNewMemoTags] = useState<string>('');
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    const handleSaveMemo = () => {
        if (!newMemoText.trim() && !selectedImageUri) {
            Alert.alert('エラー', 'メモ内容または画像を入力してください。');
            return;
        }

        const newMemo: Memo = {
            id: Date.now().toString(),
            text: newMemoText.trim(),
            subject: newMemoSubject.trim() || 'その他',
            date: getCurrentDate(),
            tags: newMemoTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            // ★ (注意) 画像URIはMemo型に未定義のため、ここでは保存せずクリア
        };

        setMemos([newMemo, ...memos]);

        setNewMemoText('');
        setNewMemoSubject('');
        setNewMemoTags('');
        setSelectedImageUri(null);
        Alert.alert('保存完了', '新しいメモを保存しました！');
    };

    // ★ 画像ピッカーのロジック (スタブ)
    const pickImage = async (useCamera: boolean) => {
        // ... (実際のImagePickerのロジックは省略)

        // ★ シミュレーションのため、ダミーのURIを設定
        Alert.alert(useCamera ? 'カメラ起動' : 'ライブラリ起動', '画像選択をシミュレーションします。');
        setSelectedImageUri('https://via.placeholder.com/300x150?text=Image+Attached');
    };


    interface MemoItemProps {
        memo: Memo;
    }
    const MemoItem: React.FC<MemoItemProps> = ({ memo }) => (
        <View style={[styles.card, { padding: 16, marginBottom: 12 }]}>
            <View style={[styles.flexRow, { justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }]}>
                <View style={styles.flexRow}>
                    <Text style={styles.tagBase}>
                        {memo.subject}
                    </Text>
                    <Text style={styles.textMutedForeground}>
                        {memo.date}
                    </Text>
                </View>
            </View>
            <Text style={{ fontSize: 14, lineHeight: 22 }}>{memo.text}</Text>
            {memo.tags.length > 0 && (
                <View style={[styles.flexRow, { flexWrap: 'wrap', marginTop: 8 }]}>
                    {memo.tags.map((tag, index) => (
                        <Text key={index} style={{ fontSize: 10, backgroundColor: Colors.muted, color: Colors.mutedForeground, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 6, marginBottom: 4 }}>
                            #{tag}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <View style={{ flex: 1, paddingVertical: 10 }}>
            {/* メモ入力セクション */}
            <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
                <View style={{ paddingBottom: 12 }}>
                    <View style={styles.flexRow}>
                        <Icon name="NotebookText" style={{ fontSize: 20, color: Colors.primary, marginRight: 8 }} />
                        <Text style={styles.textLg}>新規メモ作成</Text>
                    </View>
                    <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>学習中の気づきや要点を記録</Text>
                </View>

                <View style={styles.contentSection}>
                    {/* ★ 画像インポートボタン */}
                    <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: 16 }]}>
                        <TouchableOpacity
                            onPress={() => pickImage(false)}
                            style={[styles.flexOne, styles.buttonSecondary, { backgroundColor: Colors.card, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 8 }]}
                        >
                            <Icon name="Download" style={[styles.textSm, styles.textPrimary, { marginRight: 6 }]} />
                            <Text style={[styles.textMd, styles.textPrimary]}>ライブラリ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => pickImage(true)}
                            style={[styles.flexOne, styles.buttonSecondary, { backgroundColor: Colors.card, height: 40, justifyContent: 'center', alignItems: 'center' }]}
                        >
                            <Icon name="Camera" style={[styles.textSm, styles.textPrimary, { marginRight: 6 }]} />
                            <Text style={[styles.textMd, styles.textPrimary]}>撮影</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ★ 選択された画像のプレビュー */}
                    {selectedImageUri && (
                        <View style={{ marginBottom: 12, alignItems: 'center', padding: 10, backgroundColor: Colors.card, borderRadius: 8, borderWidth: 1, borderColor: Colors.border }}>
                            <Image
                                source={{ uri: selectedImageUri }}
                                style={{ width: '100%', height: 150, borderRadius: 8 }}
                                resizeMode="cover"
                            />
                            <Text style={[styles.textMutedForeground, styles.textSm, { marginTop: 8 }]}>画像が添付されました</Text>
                        </View>
                    )}

                    <Text style={styles.label}>科目</Text>
                    <TextInput
                        style={[styles.inputBase, { marginBottom: 12 }]}
                        value={newMemoSubject}
                        onChangeText={setNewMemoSubject}
                        placeholder="例: 数学"
                    />

                    <Text style={styles.label}>メモ内容</Text>
                    <TextInput
                        style={[styles.inputBase, { height: 100, marginBottom: 12 }]}
                        multiline={true}
                        value={newMemoText}
                        onChangeText={setNewMemoText}
                        placeholder="重要な公式、問題の解法、暗記すべき事項などを入力..."
                    />

                    <Text style={styles.label}>タグ (カンマ区切り)</Text>
                    <TextInput
                        style={[styles.inputBase, { marginBottom: 16 }]}
                        value={newMemoTags}
                        onChangeText={setNewMemoTags}
                        placeholder="例: #公式, #注意点"
                    />

                    <TouchableOpacity
                        onPress={handleSaveMemo}
                        style={styles.buttonPrimary}
                    >
                        <Icon name="Upload" style={[styles.textSm, styles.textWhite, { marginRight: 8 }]} />
                        <Text style={styles.buttonText}>メモを保存</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* メモ履歴セクション */}
            <View style={[styles.card, { padding: 16, marginBottom: 16 }]}>
                <View style={{ paddingBottom: 12 }}>
                    <Text style={styles.textLg}>メモ履歴</Text>
                    <Text style={[styles.textMd, styles.textMutedForeground, { marginTop: 2 }]}>過去に作成した学習メモ</Text>
                </View>
                <View>
                    {memos.map((memo: Memo) => (
                        <MemoItem key={memo.id} memo={memo} />
                    ))}
                    {memos.length === 0 && (
                        <Text style={[styles.textMutedForeground, { textAlign: 'center', marginTop: 10 }]}>まだメモがありません。</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

export default StudyMemo;