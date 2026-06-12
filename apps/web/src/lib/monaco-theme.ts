import type { Monaco } from '@monaco-editor/react';

let monacoInstance: Monaco | null = null;

/** Re-apply the editor theme after a light/dark toggle. No-op before first editor mount. */
export function syncEditorTheme(): void {
  monacoInstance?.editor.setTheme(currentEditorTheme());
}

/** Cyanotype + Vellum Monaco themes matching the drafting-set palette. */
export function defineBlueprintThemes(monaco: Monaco): void {
  monacoInstance = monaco;
  monaco.editor.defineTheme('cyanotype', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '8aa3cf' },
      { token: 'string.value.json', foreground: 'd9e6ff' },
      { token: 'number', foreground: 'ffc14d' },
      { token: 'keyword.json', foreground: 'b39bff' },
      { token: 'delimiter', foreground: '44608f' },
    ],
    colors: {
      'editor.background': '#0a1830',
      'editor.foreground': '#d9e6ff',
      'editor.lineHighlightBackground': '#0f224400',
      'editorLineNumber.foreground': '#44608f',
      'editorLineNumber.activeForeground': '#8aa3cf',
      'editorCursor.foreground': '#ffc14d',
      'editor.selectionBackground': '#ffc14d33',
      'editorWidget.background': '#0b1b35',
      'editorWidget.border': '#1c3158',
      'scrollbarSlider.background': '#1c315880',
      'scrollbarSlider.hoverBackground': '#2a4474',
      'editorBracketHighlight.foreground1': '#8aa3cf',
      'editorBracketHighlight.foreground2': '#6db5ff',
      'editorBracketHighlight.foreground3': '#b39bff',
    },
  });

  monaco.editor.defineTheme('vellum', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '586c8c' },
      { token: 'string.value.json', foreground: '1d2a40' },
      { token: 'number', foreground: 'b06c00' },
      { token: 'keyword.json', foreground: '6f44c4' },
      { token: 'delimiter', foreground: '9fabc0' },
    ],
    colors: {
      'editor.background': '#faf8f1',
      'editor.foreground': '#1d2a40',
      'editor.lineHighlightBackground': '#efebdf00',
      'editorLineNumber.foreground': '#9fabc0',
      'editorLineNumber.activeForeground': '#586c8c',
      'editorCursor.foreground': '#2351c4',
      'editor.selectionBackground': '#2351c422',
      'editorWidget.background': '#f6f3ea',
      'editorWidget.border': '#d4cfc0',
      'scrollbarSlider.background': '#26345020',
      'scrollbarSlider.hoverBackground': '#26345040',
    },
  });
}

export function currentEditorTheme(): string {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'vellum'
    : 'cyanotype';
}

/** Shared compact options for the JSON editors. */
export const EDITOR_OPTIONS = {
  fontSize: 10.5,
  fontFamily: '"Martian Mono", "IBM Plex Mono", monospace',
  minimap: { enabled: false },
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 10, bottom: 10 },
  renderLineHighlight: 'none' as const,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: { useShadows: false, verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
  guides: { indentation: false },
  folding: false,
  lineNumbersMinChars: 3,
  lineDecorationsWidth: 6,
};
