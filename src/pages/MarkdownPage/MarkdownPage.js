import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownPage.css'

function MarkdownPage({ fileName }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/${fileName}`)
      .then((res) => res.text())
      .then(setContent)
      .catch((err) => console.error('Error loading markdown:', err));
  }, [fileName]);

  return (
    <div className="markdown-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export default MarkdownPage;