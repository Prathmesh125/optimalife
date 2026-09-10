"use client";

import { useState, useRef } from "react";
import {
  ChevronUp, ChevronDown, Trash2, Plus, X,
  Type, Heading, Image as ImageIcon, Columns, Minus, GripVertical
} from "lucide-react";

export interface PageBlock {
  id: string;
  type: "heading" | "text" | "image" | "two-column" | "divider";
  content?: string;       // heading / text / left column
  content2?: string;      // right column (two-column)
  url?: string;           // image url
  caption?: string;       // image caption
  label?: string;         // column 1 label (two-column)
  label2?: string;        // column 2 label
}

interface Props {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  images?: { filename: string; url: string }[];
  slug: string;
  onUpload?: (file: File) => Promise<string | null>;
}

const BLOCK_TYPES = [
  { type: "heading",    label: "Heading",    Icon: Heading,    desc: "A styled H2 section heading" },
  { type: "text",       label: "Text",       Icon: Type,       desc: "A rich paragraph or body text" },
  { type: "image",      label: "Image",      Icon: ImageIcon,  desc: "Full-width image with caption" },
  { type: "two-column", label: "Two Column", Icon: Columns,    desc: "Side-by-side text columns" },
  { type: "divider",    label: "Divider",    Icon: Minus,      desc: "A visual horizontal separator" },
] as const;

function genId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function PageBlockEditor({ blocks, onChange, images = [], slug, onUpload }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const update = (idx: number, patch: Partial<PageBlock>) => {
    const next = [...blocks];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(blocks.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...blocks];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx === blocks.length - 1) return;
    const next = [...blocks];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    onChange(next);
  };

  const addBlock = (type: PageBlock["type"]) => {
    onChange([...blocks, { id: genId(), type, content: "", content2: "", url: "", caption: "", label: "Column 1", label2: "Column 2" }]);
    setShowPicker(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    setUploadingId(blocks[idx].id);
    const url = await onUpload(file);
    if (url) update(idx, { url });
    setUploadingId(null);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Block List */}
      {blocks.map((block, idx) => (
        <div
          key={block.id}
          className="group relative bg-white border border-slate-200 rounded-2xl p-6 transition-shadow hover:shadow-md"
        >
          {/* Control Bar */}
          <div className="absolute top-4 right-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => moveUp(idx)}
              disabled={idx === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-slate-100 disabled:opacity-30 transition-colors"
              title="Move Up"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => moveDown(idx)}
              disabled={idx === blocks.length - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C63FF] hover:bg-slate-100 disabled:opacity-30 transition-colors"
              title="Move Down"
            >
              <ChevronDown size={16} />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete Block"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Block Type Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <GripVertical size={14} className="text-slate-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              {block.type}
            </span>
          </div>

          {/* Heading Block */}
          {block.type === "heading" && (
            <input
              type="text"
              value={block.content || ""}
              onChange={(e) => update(idx, { content: e.target.value })}
              placeholder="Section heading text..."
              className="w-full bg-transparent border-none outline-none text-2xl font-extrabold text-[#3a356a] placeholder-slate-300 focus:ring-0"
            />
          )}

          {/* Text Block */}
          {block.type === "text" && (
            <textarea
              value={block.content || ""}
              onChange={(e) => update(idx, { content: e.target.value })}
              rows={5}
              placeholder="Write paragraph content here... (Markdown supported)"
              className="w-full bg-slate-50/60 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6C63FF]/20 focus:border-[#6C63FF] text-slate-700 text-sm leading-relaxed resize-none font-medium placeholder-slate-300 transition-all"
            />
          )}

          {/* Image Block */}
          {block.type === "image" && (
            <div className="space-y-3">
              {block.url ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200">
                  <img src={block.url} alt="Block" className="w-full max-h-80 object-cover" />
                  <button
                    type="button"
                    onClick={() => update(idx, { url: "" })}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-1.5 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center space-y-3 bg-slate-50/50">
                  <ImageIcon size={32} className="text-slate-300" />
                  <p className="text-slate-400 text-sm font-medium">Upload an image or paste a URL below</p>
                  <div className="flex space-x-3">
                    {onUpload && (
                      <label className="bg-[#6C63FF] text-white px-4 py-2 rounded-xl font-bold text-sm cursor-pointer hover:bg-[#5b54d6] transition-colors shadow-sm">
                        {uploadingId === block.id ? "Uploading..." : "Upload File"}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          disabled={uploadingId === block.id}
                          onChange={(e) => handleFileUpload(e, idx)}
                        />
                      </label>
                    )}
                  </div>
                  {/* Or pick from Page Media */}
                  {images.length > 0 && (
                    <div className="w-full pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Or pick from Page Media:</p>
                      <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                        {images.map((img) => (
                          <button
                            key={img.url}
                            type="button"
                            onClick={() => update(idx, { url: img.url })}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#6C63FF] transition-all"
                            title={img.filename}
                          >
                            <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <input
                type="text"
                value={block.url || ""}
                onChange={(e) => update(idx, { url: e.target.value })}
                placeholder="Or paste image URL directly..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6C63FF]/20 focus:border-[#6C63FF] text-sm font-mono text-slate-600 transition-all"
              />
              <input
                type="text"
                value={block.caption || ""}
                onChange={(e) => update(idx, { caption: e.target.value })}
                placeholder="Optional image caption..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6C63FF]/20 focus:border-[#6C63FF] text-sm text-slate-600 italic transition-all"
              />
            </div>
          )}

          {/* Two Column Block */}
          {block.type === "two-column" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={block.label || "Column 1"}
                  onChange={(e) => update(idx, { label: e.target.value })}
                  className="w-full mb-2 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 bg-transparent border-none outline-none focus:ring-0"
                  placeholder="Column 1 Label"
                />
                <textarea
                  value={block.content || ""}
                  onChange={(e) => update(idx, { content: e.target.value })}
                  rows={6}
                  placeholder="Left column content..."
                  className="w-full bg-slate-50/60 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6C63FF]/20 focus:border-[#6C63FF] text-slate-700 text-sm leading-relaxed resize-none font-medium placeholder-slate-300 transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={block.label2 || "Column 2"}
                  onChange={(e) => update(idx, { label2: e.target.value })}
                  className="w-full mb-2 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 bg-transparent border-none outline-none focus:ring-0"
                  placeholder="Column 2 Label"
                />
                <textarea
                  value={block.content2 || ""}
                  onChange={(e) => update(idx, { content2: e.target.value })}
                  rows={6}
                  placeholder="Right column content..."
                  className="w-full bg-slate-50/60 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6C63FF]/20 focus:border-[#6C63FF] text-slate-700 text-sm leading-relaxed resize-none font-medium placeholder-slate-300 transition-all"
                />
              </div>
            </div>
          )}

          {/* Divider Block */}
          {block.type === "divider" && (
            <div className="flex items-center space-x-4 py-2">
              <div className="flex-1 h-px bg-slate-200 rounded-full" />
              <span className="text-xs text-slate-300 font-medium">DIVIDER</span>
              <div className="flex-1 h-px bg-slate-200 rounded-full" />
            </div>
          )}
        </div>
      ))}

      {/* Empty State */}
      {blocks.length === 0 && (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-300">
            <Plus size={24} />
          </div>
          <p className="text-slate-500 font-bold">No custom blocks yet</p>
          <p className="text-slate-400 text-sm max-w-xs">Click "Add Section" below to add headings, text, images or two-column layouts.</p>
        </div>
      )}

      {/* Add Section Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className={`w-full flex items-center justify-center space-x-2 py-4 rounded-2xl border-2 border-dashed font-bold transition-all duration-200 ${
            showPicker
              ? "border-[#6C63FF] bg-[#6C63FF] text-white"
              : "border-slate-200 text-slate-400 hover:border-[#6C63FF] hover:text-[#6C63FF] hover:bg-slate-50"
          }`}
        >
          {showPicker ? <X size={18} /> : <Plus size={18} />}
          <span>{showPicker ? "Cancel" : "+ Add Section"}</span>
        </button>

        {showPicker && (
          <div className="mt-3 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {BLOCK_TYPES.map(({ type, label, Icon, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="flex flex-col items-center p-4 rounded-xl border border-slate-100 hover:border-[#6C63FF] hover:bg-indigo-50 transition-all group text-center space-y-2"
              >
                <div className="w-10 h-10 bg-slate-50 group-hover:bg-[#6C63FF]/10 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#6C63FF] transition-colors">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-[#6C63FF]">{label}</span>
                <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">{desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
