import mammoth from 'mammoth';
import JSZip from 'jszip';

export async function parseFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    // Word 문서 (DOCX)
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      return await parseDOCX(file);
    }
    
    // PowerPoint (PPTX)
    if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileName.endsWith('.pptx')) {
      return await parsePPTX(file);
    }
    
    // ZIP 파일
    if (fileType === 'application/zip' || fileName.endsWith('.zip')) {
      return await parseZIP(file);
    }
    
    // 텍스트 파일
    if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return await parseText(file);
    }
    
    throw new Error(`지원하지 않는 파일 형식입니다: ${fileType || fileName}`);
  } catch (error) {
    console.error('파일 파싱 오류:', error);
    throw error;
  }
}

async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parsePPTX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  let textContent = '';
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  );
  
  for (const slideFile of slideFiles) {
    const content = await zip.files[slideFile].async('text');
    // XML에서 텍스트 추출 (간단한 정규식 사용)
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) {
      textContent += `\n\n${text}`;
    }
  }
  
  return textContent.trim() || 'PowerPoint 파일에서 텍스트를 추출할 수 없습니다.';
}

async function parseZIP(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  let summary = `ZIP 파일 내용:\n\n`;
  
  // 파일 목록 추출
  const fileList: string[] = [];
  zip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      fileList.push(relativePath);
    }
  });
  
  summary += `총 ${fileList.length}개의 파일:\n`;
  summary += fileList.map(f => `- ${f}`).join('\n');
  
  // 텍스트 파일 내용 읽기 시도
  summary += `\n\n[텍스트 파일 내용]\n`;
  for (const fileName of fileList) {
    if (fileName.match(/\.(txt|md|html|css|js|json|xml)$/i)) {
      try {
        const content = await zip.files[fileName].async('text');
        summary += `\n--- ${fileName} ---\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n`;
      } catch (e) {
        summary += `\n--- ${fileName} --- (읽기 실패)\n`;
      }
    }
  }
  
  return summary;
}

async function parseText(file: File): Promise<string> {
  return await file.text();
}

export function getFileSizeDisplay(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
