import React from 'react';

// Using a custom dynamic import for Next.js to avoid SSR issues if necessary,
// but @monaco-editor/react handles SSR gracefully by default.
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

export function CodeEditor({ code, language, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <div className="w-full h-full border border-gray-800 rounded-md overflow-hidden bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={onChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          padding: { top: 16 },
        }}
        loading={<div className="text-gray-400 p-4">Loading editor...</div>}
      />
    </div>
  );
}
