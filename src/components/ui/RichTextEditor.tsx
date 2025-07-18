import React, { useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import { 
    Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Youtube as YoutubeIcon, Link as LinkIcon, Image as ImageIcon 
} from 'lucide-react';
import { Button } from './button';

const RichTextEditor = ({ content, onChange, onImageUpload, onEditorInstance }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Youtube.configure({
                nocookie: true,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
              class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
            },
        },
        onCreate: ({ editor }) => {
            if (onEditorInstance) {
                onEditorInstance(editor);
            }
        }
    });

    // Editor içeriğini güncellemek için useEffect kullan
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [editor, content]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file && onImageUpload) {
            const url = await onImageUpload(file);
            if (url && editor) {
                editor.chain().focus().setImage({ src: url }).enter().run();
            }
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-lg">
            <div className="p-2 flex flex-wrap items-center gap-2 border-b">
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><Bold size={16}/></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><Italic size={16}/></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}><Strikethrough size={16}/></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editor.can().chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'is-active' : ''}><Code size={16}/></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}><List size={16}/></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}><ListOrdered size={16}/></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}><Quote size={16}/></Button>
                
                <input type="file" id="image-upload" className="hidden" onChange={handleImageUpload} accept="image/*" />
                <Button type="button" variant="ghost" size="sm" onClick={() => document.getElementById('image-upload').click()}><ImageIcon size={16}/></Button>

                <Button type="button" variant="ghost" size="sm" onClick={() => {
                    const url = window.prompt('YouTube URL');
                    if (url) editor.commands.setYoutubeVideo({ src: url });
                }}><YoutubeIcon size={16}/></Button>
                
                <Button type="button" variant="ghost" size="sm" onClick={() => {
                     const url = window.prompt('URL');
                     if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                }}><LinkIcon size={16}/></Button>

            </div>
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor; 