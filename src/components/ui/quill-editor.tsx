import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = "What will be discussed or covered in this event?"
}) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link'
  ];

  return (
    <div className="quill-wrapper">
      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        theme="snow"
        style={{
          backgroundColor: '#fbeee4',
          borderRadius: '6px',
        }}
      />
      <style jsx>{`
        .quill-wrapper .ql-toolbar {
          border-color: #eacaae !important;
          background-color: #f5f5f0;
          border-radius: 6px 6px 0 0;
        }
        .quill-wrapper .ql-container {
          border-color: #eacaae !important;
          border-radius: 0 0 6px 6px;
          min-height: 120px;
        }
        .quill-wrapper .ql-editor {
          color: #421f17;
          font-size: 14px;
          line-height: 1.5;
        }
        .quill-wrapper .ql-editor.ql-blank::before {
          color: #421f17;
          opacity: 0.6;
        }
        .quill-wrapper .ql-toolbar .ql-picker-label {
          color: #421f17;
        }
        .quill-wrapper .ql-toolbar button {
          color: #421f17;
        }
        .quill-wrapper .ql-toolbar button:hover {
          background-color: #fbeee4;
        }
      `}</style>
    </div>
  );
};
