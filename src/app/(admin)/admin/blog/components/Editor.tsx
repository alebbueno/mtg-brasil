/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use client'

import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import { uploadImage } from '@/app/actions/postActions';

// As props agora refletem um componente controlado
interface EditorProps {
  onEditorChange: (value: string) => void;
  initialValue: string;
}

export default function Editor({ onEditorChange, initialValue }: EditorProps) {
  
  const imageUploadHandler = async (blobInfo: any): Promise<string> => {
    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());
    try {
      const result = await uploadImage(formData);
      return result.location;
    } catch (error: any) {
      throw new Error(`Falha no upload da imagem: ${error.message}`);
    }
  };

  return (
    <TinyMCEEditor
      apiKey='SUA_CHAVE_DE_API_AQUI' // Lembre-se de colocar sua chave de API
      initialValue={initialValue}
      onEditorChange={(newValue, editor) => onEditorChange(newValue)}
      init={{
        height: 500,
        menubar: false,
        plugins: [ 'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount' ],
        toolbar: 'undo redo | blocks | ' + 'bold italic forecolor | alignleft aligncenter ' + 'alignright alignjustify | bullist numlist outdent indent | ' + 'removeformat | image media | help',
        content_style: `
          body { 
            background-color: #171717; 
            color: #e5e5e5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          }
        `,
        images_upload_handler: imageUploadHandler,
        automatic_uploads: true,
        file_picker_types: 'image media',
      }}
    />
  );
}