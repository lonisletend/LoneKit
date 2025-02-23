import Prism from 'prismjs';

// 加载所需的语言支持
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-markup'; // HTML 支持
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // Vue 支持

// 支持的语言列表
const supportedLanguages = [
  'java',
  'javascript',
  'python',
  'c',
  'cpp',
  'rust',
  'json',
  'xml',
  'html',
  'css',
  'vue'
];

// 自动检测代码语言
export function detectLanguage(code) {
  // 优先检测 XML 特征
  if (/^\s*<\?xml\b/.test(code) || /^\s*<(\w+)(\s|>)/.test(code)) {
    return 'xml';
  }

  let detectedLanguage = null;
  let highestScore = 0;

  supportedLanguages.forEach(language => {
    const grammar = Prism.languages[language];
    if (grammar) {
      const score = Prism.highlight(code, grammar, language).length;
      if (score > highestScore) {
        highestScore = score;
        detectedLanguage = language;
      }
    }
  });

  return detectedLanguage || 'unknown';
}