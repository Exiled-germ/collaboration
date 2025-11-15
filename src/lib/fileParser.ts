// File parsing utilities for PDF, images, and other formats

export async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function parsePDFFile(file: File): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Use jsdelivr CDN for worker - more reliable than cloudflare
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/build/pdf.worker.min.mjs';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
    }).promise;
    
    let fullText = `[PDF File: ${file.name}]\n`;
    fullText += `Pages: ${pdf.numPages}\n`;
    fullText += `File size: ${(file.size / 1024).toFixed(2)} KB\n\n`;
    fullText += `--- Content ---\n\n`;
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      if (pageText.trim()) {
        fullText += `Page ${i}:\n${pageText}\n\n`;
      }
    }
    
    return fullText || `[PDF File: ${file.name}]\n\nNo text content could be extracted from this PDF.`;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return `[PDF File: ${file.name}]\n\nError parsing PDF: ${error instanceof Error ? error.message : 'Unknown error'}\nFile size: ${(file.size / 1024).toFixed(2)} KB`;
  }
}

export async function parseImageFile(file: File): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    const Tesseract = await import('tesseract.js');
    
    let fullText = `[Image File: ${file.name}]\n`;
    fullText += `File size: ${(file.size / 1024).toFixed(2)} KB\n\n`;
    fullText += `--- OCR Processing ---\n\n`;
    
    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Perform OCR
    const result = await Tesseract.recognize(
      imageUrl,
      'eng+kor', // Support both English and Korean
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    // Clean up object URL
    URL.revokeObjectURL(imageUrl);
    
    const extractedText = result.data.text.trim();
    
    if (extractedText) {
      fullText += `Extracted Text:\n${extractedText}\n\n`;
      fullText += `Confidence: ${Math.round(result.data.confidence)}%`;
    } else {
      fullText += `No text could be extracted from this image.`;
    }
    
    return fullText;
  } catch (error) {
    console.error('Image OCR error:', error);
    return `[Image File: ${file.name}]\n\nError performing OCR: ${error instanceof Error ? error.message : 'Unknown error'}\nFile size: ${(file.size / 1024).toFixed(2)} KB`;
  }
}

export async function parseFile(file: File): Promise<string> {
  const fileType = file.type;
  
  if (fileType.startsWith('text/')) {
    return parseTextFile(file);
  }
  
  if (fileType === 'application/pdf') {
    return parsePDFFile(file);
  }
  
  if (fileType.startsWith('image/')) {
    return parseImageFile(file);
  }
  
  // Fallback for unknown types
  return `[File: ${file.name}]\n\nFile type: ${fileType}\nFile size: ${(file.size / 1024).toFixed(2)} KB\n\nThis file type is not yet supported for parsing.`;
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('text/')) return '📄';
  if (fileType === 'application/pdf') return '📕';
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.includes('word')) return '📘';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📙';
  return '📎';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
