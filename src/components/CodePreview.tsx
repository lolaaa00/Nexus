import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RefreshCw, Download, CheckCircle2 } from "lucide-react";

function extractHtmlCode(text: string): string | null {
  const match = text.match(/```html\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    return text.trim();
  }
  return null;
}

interface CodePreviewProps {
  content: string;
  agentName: string;
}

const CodePreview = ({ content, agentName }: CodePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const htmlCode = extractHtmlCode(content);

  const downloadCode = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentName.toLowerCase().replace(/\s+/g, "-")}-game.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!htmlCode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          Execution Complete
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => { setShowPreview(true); setIframeKey((k) => k + 1); }}
          className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-2 rounded-xl hover:bg-primary/20 transition-colors"
        >
          <Play className="w-3 h-3" />
          {showPreview ? "Run Code" : "Live Preview"}
        </button>
        {showPreview && (
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="flex items-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-2 rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        )}
        <button
          onClick={downloadCode}
          className="flex items-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-2 rounded-xl hover:bg-secondary/80 transition-colors"
        >
          <Download className="w-3 h-3" />
          Download
        </button>
      </div>

      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl overflow-hidden border border-border"
        >
          <iframe
            key={iframeKey}
            srcDoc={htmlCode}
            className="w-full min-h-[400px] bg-white rounded-2xl"
            sandbox="allow-scripts"
            title="Code Preview"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default CodePreview;
