"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { ComponentType } from "react";
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Trash2,
  Unlink,
  Underline as UnderlineIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

// ── Resizable image extension ───────────────────────────────────────────────

function ResizableImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
}: ReactNodeViewProps) {
  const attrs = node.attrs as {
    src: string;
    alt?: string;
    title?: string;
    width?: number | null;
    height?: number | null;
    mediaId?: string | null;
  };

  const imgRef = useRef<HTMLImageElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startW = useRef(0);
  const startH = useRef(0);
  const aspectRatio = useRef(1);

  const startResize = useCallback(
    (dir: "e" | "s" | "se") => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!imgRef.current) return;
      startX.current = e.clientX;
      startY.current = e.clientY;
      startW.current = imgRef.current.offsetWidth;
      startH.current = imgRef.current.offsetHeight;
      aspectRatio.current =
        startH.current > 0 ? startW.current / startH.current : 1;

      function onMove(ev: MouseEvent) {
        const dx = ev.clientX - startX.current;
        const dy = ev.clientY - startY.current;
        if (dir === "e") {
          updateAttributes({
            width: Math.max(80, startW.current + dx),
            height: null,
          });
        } else if (dir === "s") {
          updateAttributes({
            height: Math.max(40, startH.current + dy),
            width: null,
          });
        } else {
          const newW = Math.max(80, startW.current + dx);
          const newH = Math.round(newW / aspectRatio.current);
          updateAttributes({ width: newW, height: newH });
        }
      }

      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [updateAttributes],
  );

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Notify the component so it can queue cloud deletion / revoke blob URL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor.storage as any).resizableImage?.onDeleteImage?.(
      attrs.mediaId ?? "",
      attrs.src,
    );
    deleteNode();
  }

  return (
    <NodeViewWrapper
      as="div"
      draggable="true"
      data-drag-handle
      className="relative my-2 inline-block max-w-full cursor-grab active:cursor-grabbing"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={attrs.src}
        alt={attrs.alt ?? ""}
        title={attrs.title ?? undefined}
        draggable={false}
        style={{
          display: "block",
          maxWidth: "100%",
          borderRadius: "0.25rem",
          width: attrs.width ? `${attrs.width}px` : undefined,
          height: attrs.height ? `${attrs.height}px` : undefined,
        }}
        className={selected ? "ring-2 ring-blue-500 ring-offset-1" : ""}
      />
      {selected && (
        <>
          {/* Delete button — top-right corner */}
          <button
            type="button"
            title="Remove image"
            onMouseDown={handleDelete}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
          >
            <Trash2 className="size-3" />
          </button>

          {/* Right – resize width only */}
          <div
            onMouseDown={startResize("e")}
            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-8 cursor-ew-resize rounded bg-white border border-blue-500 opacity-90 hover:opacity-100"
          />
          {/* Bottom – resize height only */}
          <div
            onMouseDown={startResize("s")}
            className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 h-3 w-8 cursor-ns-resize rounded bg-white border border-blue-500 opacity-90 hover:opacity-100"
          />
          {/* Corner – resize both proportionally */}
          <div
            onMouseDown={startResize("se")}
            className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-sm bg-blue-500"
          />
          {/* Size badge */}
          {(attrs.width ?? attrs.height) && (
            <div className="absolute top-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] leading-none text-white pointer-events-none">
              {attrs.width ?? "auto"}&times;{attrs.height ?? "auto"}
            </div>
          )}
        </>
      )}
    </NodeViewWrapper>
  );
}

const ResizableImage = TiptapImage.extend({
  name: "resizableImage",

  addStorage() {
    return {
      /** Called when the user clicks the delete button on an image node.
       *  `mediaId` is the cloud asset ID (empty string for not-yet-uploaded blobs).
       *  `src` is the current src (blob: URL or cloud URL). */
      onDeleteImage: null as ((mediaId: string, src: string) => void) | null,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: {
        default: null,
        parseHTML: (el: HTMLElement) =>
          el.getAttribute("data-media-id") ?? null,
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.mediaId ? { "data-media-id": attrs.mediaId } : {},
      },
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          // Read from inline style first (new format), then fall back to attribute
          const styleMatch = el.style.width?.match(/^(\d+(?:\.\d+)?)px$/);
          if (styleMatch) return parseFloat(styleMatch[1]);
          const v = el.getAttribute("width");
          return v ? parseInt(v, 10) : null;
        },
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.width ? { style: `width: ${attrs.width}px;` } : {},
      },
      height: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          // Read from inline style first (new format), then fall back to attribute
          const styleMatch = el.style.height?.match(/^(\d+(?:\.\d+)?)px$/);
          if (styleMatch) return parseFloat(styleMatch[1]);
          const v = el.getAttribute("height");
          return v ? parseInt(v, 10) : null;
        },
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.height ? { style: `height: ${attrs.height}px;` } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(
      ResizableImageNodeView as ComponentType<ReactNodeViewProps>,
    );
  },
});

// ── Public handle ───────────────────────────────────────────────────────────

/** Exposed via ref. Call `flush()` inside the form's save handler. */
export type RichTextEditorHandle = {
  /**
   * Uploads any images the user picked (currently held as blob URLs), replaces
   * them in the editor document with cloud URLs, and queues deletions of any
   * cloud images the user removed.
   *
   * Returns the final HTML string ready to be sent to the API.
   * Throws (and shows a toast) if an upload fails — the caller should abort the
   * save in that case.
   */
  flush: () => Promise<string>;
  /** True when the user has picked one or more images not yet uploaded. */
  hasPendingImages: () => boolean;
};

// ── Component ───────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  /** When true, shows an "Insert Image" button. Images are held as blob URLs
   *  until the parent calls `editorRef.current.flush()` on save. */
  withImageUpload?: boolean;
}

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(
  {
    value,
    onChange,
    placeholder,
    disabled,
    className,
    "aria-label": ariaLabel,
    withImageUpload,
  },
  ref,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // blob URL → File (images picked but not yet uploaded)
  const pendingUploadsRef = useRef<Map<string, File>>(new Map());
  // cloud media IDs queued for deletion on flush
  const toDeleteIdsRef = useRef<Set<string>>(new Set());

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Start typing…" }),
      ...(withImageUpload
        ? [ResizableImage.configure({ inline: false, allowBase64: false })]
        : []),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "outline-none min-h-[240px] p-3 max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2.5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-0.5 [&_strong]:font-bold [&_em]:italic [&_a]:text-blue-600 [&_a]:no-underline [&_a]:cursor-text [&_a]:pointer-events-none [&_img]:max-w-full [&_img]:rounded [&_img]:my-2",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
    },
  });

  // Wire the delete callback into extension storage whenever editor is ready
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor.storage as any).resizableImage = {
      onDeleteImage: (mediaId: string, src: string) => {
        if (src.startsWith("blob:")) {
          // Pending upload — remove and revoke
          pendingUploadsRef.current.delete(src);
          URL.revokeObjectURL(src);
        } else if (mediaId) {
          // Cloud image — queue for deletion on flush
          toDeleteIdsRef.current.add(mediaId);
        }
      },
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((editor.storage as any).resizableImage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (editor.storage as any).resizableImage.onDeleteImage = null;
      }
    };
  }, [editor]);

  // Expose imperative handle
  useImperativeHandle(
    ref,
    () => ({
      hasPendingImages() {
        return pendingUploadsRef.current.size > 0;
      },

      async flush() {
        // ── 1. Upload pending blobs ─────────────────────────────────────────
        const pendingEntries = Array.from(pendingUploadsRef.current.entries());
        if (pendingEntries.length > 0) {
          type UploadResult = {
            blobUrl: string;
            cloudUrl: string;
            mediaId: string;
          };
          let results: UploadResult[];
          try {
            results = await Promise.all(
              pendingEntries.map(async ([blobUrl, file]) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "news");
                const res = await fetch("/api/media/upload", {
                  method: "POST",
                  body: formData,
                });
                if (!res.ok) {
                  const body = (await res.json()) as {
                    error?: { message?: string };
                  };
                  throw new Error(body.error?.message ?? "Upload failed");
                }
                const { data } = (await res.json()) as {
                  data: { id: string; url: string };
                };
                return { blobUrl, cloudUrl: data.url, mediaId: data.id };
              }),
            );
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : "Image upload failed. Please try again.",
            );
            throw err;
          }

          // ── 2. Replace blob URLs in editor doc ───────────────────────────
          if (editor && !editor.isDestroyed) {
            const { doc, tr } = editor.state;
            doc.nodesBetween(0, doc.content.size, (node, pos) => {
              if (node.type.name === "resizableImage") {
                const match = results.find((r) => r.blobUrl === node.attrs.src);
                if (match) {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    src: match.cloudUrl,
                    mediaId: match.mediaId,
                  });
                }
              }
            });
            if (tr.docChanged) {
              editor.view.dispatch(tr);
            }
          }

          // Revoke blob URLs and clear pending map
          results.forEach((r) => URL.revokeObjectURL(r.blobUrl));
          pendingUploadsRef.current.clear();
        }

        // ── 3. Delete removed cloud images (fire-and-forget) ───────────────
        const toDeleteIds = Array.from(toDeleteIdsRef.current);
        if (toDeleteIds.length > 0) {
          toDeleteIdsRef.current.clear();
          toDeleteIds.forEach((id) => {
            fetch(`/api/media/${id}`, { method: "DELETE" }).catch(() => {
              /* non-critical — ignore */
            });
          });
        }

        return editor?.getHTML() ?? "";
      },
    }),
    [editor],
  );

  // Derive toolbar active states — re-evaluated on every selection/transaction change
  const toolbarState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
      isHeading1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
      isHeading2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      isHeading3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      isBulletList: ctx.editor?.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
      isLink: ctx.editor?.isActive("link") ?? false,
      linkHref:
        (ctx.editor?.getAttributes("link").href as string | undefined) ?? null,
    }),
  });

  // Sync external value (e.g. when loading saved data after navigation)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value ?? "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function addLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prev ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    // Reset so the same file can be re-selected
    e.target.value = "";

    // Hold the image as a local blob URL — upload deferred until flush()
    const blobUrl = URL.createObjectURL(file);
    pendingUploadsRef.current.set(blobUrl, file);

    // Insert after the current selection end so existing images are never replaced
    const insertPos = editor.state.selection.$to.pos;
    editor
      .chain()
      .focus()
      .insertContentAt(insertPos, {
        type: "resizableImage",
        attrs: { src: blobUrl, alt: file.name },
      })
      .run();
  }

  return (
    <div
      className={cn(
        "border-input bg-input/30 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] rounded-xl border transition-colors overflow-hidden",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={toolbarState?.isBold ?? false}
          title="Bold"
          disabled={disabled}
        >
          <Bold className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={toolbarState?.isItalic ?? false}
          title="Italic"
          disabled={disabled}
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={toolbarState?.isUnderline ?? false}
          title="Underline"
          disabled={disabled}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={toolbarState?.isHeading1 ?? false}
          title="Heading 1"
          disabled={disabled}
        >
          <Heading1 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={toolbarState?.isHeading2 ?? false}
          title="Heading 2"
          disabled={disabled}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={toolbarState?.isHeading3 ?? false}
          title="Heading 3"
          disabled={disabled}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={toolbarState?.isBulletList ?? false}
          title="Bullet list"
          disabled={disabled}
        >
          <List className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={toolbarState?.isOrderedList ?? false}
          title="Ordered list"
          disabled={disabled}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          onClick={addLink}
          active={toolbarState?.isLink ?? false}
          title="Add link"
          disabled={disabled}
        >
          <Link2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().unsetLink().run()}
          active={false}
          title="Remove link"
          disabled={disabled || !(toolbarState?.isLink ?? false)}
        >
          <Unlink className="size-4" />
        </ToolbarButton>

        {withImageUpload && (
          <>
            <Separator />
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              active={false}
              title="Insert image"
              disabled={disabled}
            >
              <ImageIcon className="size-4" />
            </ToolbarButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />
          </>
        )}
      </div>

      {/* Link preview bar — shown when cursor is inside a link */}
      {toolbarState?.isLink && toolbarState.linkHref && (
        <div className="flex items-center gap-1.5 border-b border-input bg-muted/20 px-3 py-1 text-xs">
          <div className="text-muted-foreground shrink-0">Link:</div>
          <a
            href={toolbarState.linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline underline-offset-2 truncate hover:text-blue-700 flex items-center gap-1"
          >
            {toolbarState.linkHref}
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </div>
      )}

      {/* Editor body */}
      <EditorContent editor={editor} />
    </div>
  );
});

// ── Internal helpers ────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  active: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  title,
  disabled,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor blur
        onClick();
      }}
      className={cn(
        "rounded p-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
        active && "bg-muted text-primary",
      )}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}
