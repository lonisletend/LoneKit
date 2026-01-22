import prettier from 'prettier/standalone';
import parserJava from 'prettier-plugin-java';
import parserXml from '@prettier/plugin-xml';
import parserBabel from 'prettier/parser-babel';

// 语言配置映射
const languageConfigs = {
  xml: {
    parser: 'xml',
    plugins: [parserXml],
    printWidth: 200,
    tabWidth: 2,
    xmlWhitespaceSensitivity: 'ignore',
    xmlSelfClosingSpace: true,
  },
  // json: {
  //   parser: 'json',
  //   plugins: [parserBabel],
  //   printWidth: 80,
  //   tabWidth: 4,
  //   useTabs: false,
  //   semi: true,
  //   singleQuote: false,
  //   trailingComma: 'none',
  // },
  java: {
    parser: 'java',
    plugins: [parserJava],
    printWidth: 200,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
  },
};

export async function formatCode(code, language) {
  try {
    const config = languageConfigs[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const formattedCode = await prettier.format(code, config);
    return formattedCode;
  } catch (error) {
    console.error('Format error:', error);
    throw error;
  }
}

// 导出支持的语言列表
export const supportedLanguages = [
  { value: 'xml', label: 'XML' },
  // { value: 'json', label: 'JSON' },
  { value: 'java', label: 'Java' },
];

export const codeExample = {
  xml: `<?xml version="1.0"?> <catalog> <book id="bk101"> <author>Gambardella, Matthew</author> <title>XML Developer's Guide</title> <genre>Computer</genre> <price>44.95</price> <publish_date>2000-10-01</publish_date> <description>An in-depth look at creating applications with XML.</description> </book> </catalog>`,
  // json: `{ "name": "John Doe", "age": 30, "email": "test@example.com"}`,
  java: `public class HelloWorld { public static void main(String[] args) { System.out.println("Hello, World!"); } }`,

}