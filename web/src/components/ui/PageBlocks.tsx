import ReactMarkdown from "react-markdown";

export interface PageBlock {
  id: string;
  type: "heading" | "text" | "image" | "two-column" | "divider";
  content?: string;
  content2?: string;
  url?: string;
  caption?: string;
  label?: string;
  label2?: string;
}

interface Props {
  blocks: PageBlock[];
}

export default function PageBlocks({ blocks }: Props) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 lg:px-12 py-16 space-y-12">
      {blocks.map((block) => {
        if (block.type === "divider") {
          return (
            <div key={block.id} className="w-full flex items-center space-x-6 py-2">
              <div className="flex-1 h-px bg-slate-200 rounded-full" />
              <div className="w-2 h-2 bg-slate-300 rounded-full" />
              <div className="flex-1 h-px bg-slate-200 rounded-full" />
            </div>
          );
        }

        if (block.type === "heading") {
          return (
            <div key={block.id}>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#3a356a] tracking-tight">
                {block.content}
              </h2>
              <div className="w-12 h-1 bg-[#6C63FF] rounded-full mt-4" />
            </div>
          );
        }

        if (block.type === "text") {
          return (
            <div key={block.id} className="text-lg text-slate-600 leading-relaxed prose prose-slate max-w-none">
              <ReactMarkdown>{block.content || ""}</ReactMarkdown>
            </div>
          );
        }

        if (block.type === "image") {
          return (
            <div key={block.id} className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              {block.url && (
                <img
                  src={block.url}
                  alt={block.caption || "Page image"}
                  className="w-full h-auto object-cover"
                />
              )}
              {block.caption && (
                <p className="text-center text-sm text-slate-500 italic py-3 bg-slate-50 border-t border-slate-100 font-medium">
                  {block.caption}
                </p>
              )}
            </div>
          );
        }

        if (block.type === "two-column") {
          return (
            <div key={block.id} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {block.content && (
                <div>
                  {block.label && (
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#6C63FF] mb-3">{block.label}</h3>
                  )}
                  <div className="text-slate-600 leading-relaxed prose prose-slate">
                    <ReactMarkdown>{block.content}</ReactMarkdown>
                  </div>
                </div>
              )}
              {block.content2 && (
                <div>
                  {block.label2 && (
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">{block.label2}</h3>
                  )}
                  <div className="text-slate-600 leading-relaxed prose prose-slate">
                    <ReactMarkdown>{block.content2}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </section>
  );
}
