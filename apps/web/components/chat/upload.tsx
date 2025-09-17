'use client';

import { upload } from '@vercel/blob/client';
import { Button } from '@workspace/ui/components/button';
import { Paperclip } from 'lucide-react';
import { useRef } from 'react';

export default function Upload({ fileUrls, setFileUrls }: { fileUrls: string[] | null, setFileUrls: (urls: string[] | null) => void }) {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      console.log('Upload successful:', blob);
      setFileUrls([...(fileUrls || []), blob.url]);
    } catch (error) {
      console.error('Upload failed:', error);
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