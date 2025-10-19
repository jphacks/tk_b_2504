// 
// ファイル名: utils/PdfGenerator.tsx
// 概要: PDF生成と共有のための共通ヘルパー関数
//

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

// ----------------------------------------------------
// 1. 型定義 (このファイル内で使うデータ用)
// ----------------------------------------------------

// Memoデータ型 (memo.tsx からインポートする代わりにここで簡易定義)
interface MemoData {
  subject: string;
  date: string;
  text: string;
  tags: string[];
}

// Reportデータ型 (report.tsx から)
interface SubjectBreakdownData {
  subject: string;
  duration: number; // minutes
  percentage: number;
}

interface ReportDataPayload {
  totalDuration: number;
  totalPages: number;
  avgDaily: number;
  subjectData: SubjectBreakdownData[];
  reportType: 'week' | 'month';
}

// AI生成問題のデータ型
interface GeneratedQuestionData {
  text: string;
  subject: string;
  difficulty: string;
}

// ----------------------------------------------------
// 2. 内部ヘルパー関数
// ----------------------------------------------------

/**
 * PDF用の基本的なHTMLヘッダー（共通CSSスタイル）
 * @param title ページの <title> タグ
 */
const getHtmlHead = (title: string): string => `
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        padding: 20px; 
        font-size: 14px;
        line-height: 1.6;
        color: #333;
      }
      h1 { font-size: 24px; color: #000; margin-bottom: 20px; }
      h2 { font-size: 20px; color: #333; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
      .card { 
        border: 1px solid #ddd; 
        border-radius: 8px; 
        padding: 16px; 
        margin-bottom: 20px; 
        background-color: #f9f9f9;
      }
      p { margin: 0 0 10px 0; }
      strong { color: #000; }

      /* メモ/問題 共通スタイル */
      .memo-item {
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      .memo-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }
      .memo-header { font-size: 12px; color: #555; margin-bottom: 5px; }
      .memo-text { font-size: 14px; white-space: pre-wrap; /* 改行を反映 */ }

      /* レポート用スタイル */
      .report-summary p { font-size: 16px; }
      .subject-item { margin-bottom: 12px; }
      .subject-bar-bg { 
        background: #eee; 
        border-radius: 5px; 
        height: 12px; 
        overflow: hidden; 
        margin-top: 4px;
      }
      .subject-bar-fg { 
        background: #007AFF; /* プライマリカラー (仮) */
        height: 100%; 
        border-radius: 5px;
      }
    </style>
  </head>
`;

/**
 * 分を 'Xh Ym' 形式にフォーマットする
 */
const formatMinutesToHours = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

// ----------------------------------------------------
// 3. 外部公開（Export）する関数
// ----------------------------------------------------

/**
 * HTML文字列からPDFを生成し、共有ダイアログを開く (コア機能)
 * @param htmlContent PDFにするHTMLコンテンツ
 * @param dialogTitle 共有時のダイアログタイトル
 */
export const generatePdfFromHtml = async (htmlContent: string, dialogTitle: string = 'PDFを共有') => {
  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false, // base64よりファイルURIの方が効率的
    });

    // 共有ダイアログを開く
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: dialogTitle,
      UTI: '.pdf', // iOS用のヒント
    });

  } catch (error) {
    console.error('PDFの生成または共有に失敗しました:', error);
    Alert.alert('エラー', 'PDFの処理中にエラーが発生しました。');
  }
};

/**
 * 学習メモの配列からHTMLを生成する
 * (memo.tsx から呼び出す用)
 */
export const createMemosHtml = (memos: MemoData[]): string => {
  // HTMLの本文（body）を生成
  const body = `
    <h1>学習メモ一覧</h1>
    <div class="card">
      ${memos.length > 0 ? memos.map(memo => `
        <div class="memo-item">
          <p class="memo-header">
            <strong>科目:</strong> ${memo.subject || 'その他'} | 
            <strong>日付:</strong> ${memo.date}
          </p>
          <p class="memo-text">${memo.text.replace(/\n/g, '<br>')}</p>
          ${memo.tags.length > 0 ? `<p class="memo-header">タグ: ${memo.tags.join(', ')}</p>` : ''}
        </div>
      `).join('') : '<p>保存されているメモはありません。</p>'}
    </div>
  `;

  // 完全なHTMLドキュメントを返す
  return `
    <html>
      ${getHtmlHead('学習メモ一覧')}
      <body>
        ${body}
      </body>
    </html>
  `;
};

/**
 * 学習レポートのデータからHTMLを生成する
 * (report.tsx から呼び出す用)
 */
export const createReportHtml = (data: ReportDataPayload): string => {
  // HTMLの本文（body）を生成
  const body = `
    <h1>学習レポート (${data.reportType === 'week' ? '週間' : '月間'})</h1>
    
    <div class="card report-summary">
      <h2>概要</h2>
      <p><strong>合計時間:</strong> ${formatMinutesToHours(data.totalDuration)}</p>
      <p><strong>平均/日:</strong> ${formatMinutesToHours(data.avgDaily)}</p>
      <p><strong>総ページ:</strong> ${data.totalPages} ページ</p>
    </div>

    <div class="card">
      <h2>科目別学習時間</h2>
      ${data.subjectData.map((item: SubjectBreakdownData) => `
        <div class="subject-item">
          <p>
            <strong>${item.subject}</strong> 
            (${formatMinutesToHours(item.duration)}) - ${item.percentage}%
          </p>
          <div class="subject-bar-bg">
            <div class="subject-bar-fg" style="width: ${item.percentage}%;"></div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="card">
      <h2>学習グラフ</h2>
      <p>グラフやチャートのPDFエクスポートは現在サポートされていません。</p>
    </div>
  `;

  // 完全なHTMLドキュメントを返す
  return `
    <html>
      ${getHtmlHead('学習レポート')}
      <body>
        ${body}
      </body>
    </html>
  `;
};


// ----------------------------------------------------
// 4. AI生成問題用の関数 (ai_create.tsx から)
// ----------------------------------------------------

/**
 * AI生成問題の配列からHTMLを生成する
 * (ai_create.tsx から呼び出す用)
 * @param questions AI生成問題のデータ配列
 * @param sourceQuestion 元になった問題のテキスト (オプション)
 */
export const createAiQuestionsHtml = (
  questions: GeneratedQuestionData[],
  sourceQuestion?: string
): string => {
  
  // HTMLの本文（body）を生成
  const body = `
    <h1>AI生成問題</h1>

    ${sourceQuestion ? `
      <div class="card">
        <h2>元の問題</h2>
        <p>${sourceQuestion.replace(/\n/g, '<br>')}</p>
      </div>
    ` : ''}

    <div class="card">
      <h2>生成された問題一覧</h2>
      ${questions.length > 0 ? questions.map((q, index) => `
        <div class="memo-item"> {/* 'memo-item'のCSSを流用 */}
          <p class="memo-header">
            <strong>問題 ${index + 1}</strong> | 
            <strong>科目:</strong> ${q.subject} | 
            <strong>難易度:</strong> ${q.difficulty}
          </p>
          <p class="memo-text">${q.text.replace(/\n/g, '<br>')}</p>
        </div>
      `).join('') : '<p>生成された問題はありません。</p>'}
    </div>
  `;

  // 完全なHTMLドキュメントを返す
  return `
    <html>
      ${getHtmlHead('AI生成問題')}
      <body>
        ${body}
      </body>
    </html>
  `;
};
// ./utils/PdfGenerator.tsx の末尾に追加
export default {};