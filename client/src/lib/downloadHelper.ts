import api from './api';

export interface DownloadableDoc {
  id?: number | string;
  title?: string;
  file_name?: string;
  file_path?: string;
  mime_type?: string;
  category_name?: string;
}

export async function downloadDocumentFile(doc: DownloadableDoc): Promise<boolean> {
  if (!doc) return false;

  // Resolve authentic filename
  let fileName = (doc.file_name || doc.title || 'document').trim();
  if (!fileName.includes('.')) {
    let ext = 'bin';
    const mime = (doc.mime_type || '').toLowerCase();
    if (mime.includes('presentation') || mime.includes('powerpoint')) ext = 'pptx';
    else if (mime.includes('word') || mime.includes('officedocument.word')) ext = 'docx';
    else if (mime.includes('sheet') || mime.includes('excel')) ext = 'xlsx';
    else if (mime.includes('pdf')) ext = 'pdf';
    else if (mime.includes('png')) ext = 'png';
    else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
    else if (mime.includes('text')) ext = 'txt';
    fileName = `${fileName}.${ext}`;
  }

  const token = typeof window !== 'undefined' ? (localStorage.getItem('dms_token') || '') : '';
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const baseUrl = envApiUrl.endsWith('/api') ? envApiUrl.slice(0, -4) : envApiUrl;

  // 1. Try Authenticated API Blob Stream Download
  if (doc.id) {
    try {
      const res = await api.get(`/documents/${doc.id}/download`, {
        params: {
          title: doc.title,
          file_name: fileName,
          file_path: doc.file_path
        },
        responseType: 'blob'
      });

      if (res.data && res.data.size > 0) {
        const mimeType = String(res.headers['content-type'] || 'application/octet-stream');
        const blob = new Blob([res.data], { type: mimeType });
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Delay revokeObjectURL so browser download manager finishes fetching
        setTimeout(() => {
          try {
            if (document.body.contains(link)) document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          } catch (e) {}
        }, 60000);

        return true;
      }
    } catch (apiErr) {
      console.warn('[Download] API blob stream fallback to direct link:', apiErr);
    }
  }

  // 2. Direct Backend Attachment URL Trigger
  if (doc.id) {
    try {
      const directUrl = `${baseUrl}/api/documents/${doc.id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = directUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        try {
          if (document.body.contains(link)) document.body.removeChild(link);
        } catch (e) {}
      }, 10000);

      return true;
    } catch (dErr) {
      console.warn('[Download] Direct URL trigger fallback:', dErr);
    }
  }

  // 3. Cloud / Static File Path Trigger
  if (doc.file_path) {
    try {
      const fileUrl = doc.file_path.startsWith('http')
        ? doc.file_path
        : `${baseUrl}${doc.file_path.startsWith('/') ? '' : '/'}${doc.file_path}`;

      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = fileUrl;
      link.setAttribute('download', fileName);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        try {
          if (document.body.contains(link)) document.body.removeChild(link);
        } catch (e) {}
      }, 10000);

      return true;
    } catch (pErr) {
      console.warn('[Download] File path link fallback:', pErr);
    }
  }

  return false;
}

export default downloadDocumentFile;
