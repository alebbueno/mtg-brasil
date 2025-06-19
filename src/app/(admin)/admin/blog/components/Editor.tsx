/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// app/admin/blog/components/Editor.tsx
'use client'

import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import { uploadImage } from '@/app/(site)/actions/postActions';

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

export default function Editor({ onChange, value }: EditorProps) {
  
  const imageUploadHandler = async (blobInfo: any, progress: (percent: number) => void): Promise<string> => {
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
      apiKey='gh28lo786los493f359etal65m9sadq1j1k05ddse50xmy19' // <-- Coloque sua chave de API
      value={value}
      onEditorChange={(newValue, editor) => onChange(newValue)}
      init={{
        height: 500,
        menubar: false,
        // AJUSTE 1: Garantir que 'image' e 'media' estão na lista de plugins
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
          'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 
          'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        // AJUSTE 2: Garantir que o botão 'image' está na barra de ferramentas
        toolbar:
          'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | image media | help', // Botão 'image' e 'media' adicionados
        content_style: `
          body { 
            background-color: #171717; 
            color: #e5e5e5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          }
        `,
        // Lógica de upload que já tínhamos
        images_upload_handler: imageUploadHandler,
        automatic_uploads: true,
        file_picker_types: 'image media', // Permite selecionar imagens e mídias
      }}
    />
  );
}