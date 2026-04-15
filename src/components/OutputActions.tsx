import { Copy, ExternalLink, Download, Check } from "lucide-react";
import { useState } from "react";

interface OutputActionsProps {
  content: string;
  agentName: string;
  htmlCode?: string | null;
}

const OutputActions = ({ content, agentName, htmlCode }: OutputActionsProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInNewTab = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const downloadHtml = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentName.toLowerCase().replace(/\s+/g, "-")}-output.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentName.toLowerCase().replace(/\s+/g, "-")}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy"}
      </button>

      {agentName === "Game Builder" && htmlCode && (
        <>
          <button
            onClick={openInNewTab}
            className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/15 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open in Tab
          </button>
          <button
            onClick={downloadHtml}
            className="flex items-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </>
      )}

      {agentName === "Crypto Analyst" && (
        <button
          onClick={exportAsText}
          className="flex items-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Download className="w-3 h-3" />
          Export
        </button>
      )}
    </div>
  );
};

export default OutputActions;
