import React, { useEffect, useState } from 'react';
import { marked2View } from '../index';
import { paneBColumns, mdContenFile } from './configInfo';
import { Input } from 'antd';

const Index = () => {
  const [mdContent, setMdContent] = useState(mdContenFile);
  const [value, setValue] = useState('');
  const [domData, setDomData] = useState<any>();

  const clearDoubleQuote = (content: string) => {
    return JSON.stringify(content, null, '\t')?.replace(/("(\\[^]|[^\\"])*"(?!\s*:))|"((\\[^]|[^\\"])*)"(?=\s*:)/g, '$1$3');
  };

  useEffect(() => {
    const show = marked2View(mdContenFile);
    const { add, ...json } = show;
    setValue(clearDoubleQuote(json));
    setDomData(add);
  }, []);

  return (
    <>
      <div style={{ display: 'flex', minHeight: '70%' }}>
        <Input.TextArea
          style={{ flex: 2, width: '100%', height: '65vh' }}
          rows={10}
          value={mdContent}
          onChange={(e: any) => {
            setMdContent(e.target.value);
            const { add, ...json } = marked2View(e.target.value);
            setValue(clearDoubleQuote(json));
            setDomData(add);
          }}
        />
        <Input.TextArea style={{ flex: 1, width: '100%', height: '65vh' }} rows={10} value={value} />
        <Input.TextArea style={{ flex: 1, width: '100%', height: '65vh' }} rows={10} value={domData} />
      </div>
    </>
  );
};

export default Index;
