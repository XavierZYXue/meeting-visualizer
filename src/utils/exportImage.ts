import html2canvas from 'html2canvas';

export async function exportToImage(elementId: string, filename?: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure the cloned element is fully visible
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.maxHeight = 'none';
          clonedElement.style.overflow = 'visible';
        }
      }
    });

    // Convert to PNG data URL
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    // Auto-generate filename if not provided
    const finalFilename = filename || 
      `meeting-summary-${new Date().toISOString().split('T')[0]}.png`;
    
    // Trigger download
    const link = document.createElement('a');
    link.download = finalFilename;
    link.href = dataUrl;
    link.click();

    return dataUrl;
  } catch (error) {
    console.error('Failed to export image:', error);
    throw new Error('Failed to generate image. Please try again.');
  }
}

export async function copyToClipboard(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    });

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy image. Please try downloading instead.');
  }
}

export function downloadJSON(data: unknown, filename?: string): void {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const finalFilename = filename || 
    `meeting-data-${new Date().toISOString().split('T')[0]}.json`;
  
  const link = document.createElement('a');
  link.download = finalFilename;
  link.href = url;
  link.click();
  
  URL.revokeObjectURL(url);
}
