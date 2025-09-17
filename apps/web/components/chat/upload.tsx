'use client';

import { upload } from '@vercel/blob/client';
import { Button } from '@workspace/ui/components/button';
import { Paperclip } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Upload({
  fileUrls,
  setFileUrls,
  setIsUploading,
  setUploadingPreview,
}: {
  fileUrls: string[] | null;
  setFileUrls: (urls: string[] | null) => void;
  setIsUploading: (val: boolean) => void;
  setUploadingPreview: (url: string | null) => void;
}) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    setObjectUrl(tempUrl);
    setUploadingPreview(tempUrl);
    setIsUploading(true);

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setFileUrls([...(fileUrls || []), blob.url]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadingPreview(null);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      // reset input to allow same file re-upload
      if (inputFileRef.current) inputFileRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputFileRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
      <Button
        onClick={() => inputFileRef.current?.click()}
        variant="ghost"
        size="icon"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </>
  );
}