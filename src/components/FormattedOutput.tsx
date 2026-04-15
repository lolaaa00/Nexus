import { motion } from "framer-motion";

interface FormattedOutputProps {
  content: string;
  agentName: string;
}

function renderMarkdownLine(line: string, idx: number) {
  // Headers
  if (line.startsWith("## ")) {
    return (
      <h3 key={idx} className="text-sm font-display font-bold text-foreground mt-4 mb-1.5">
        {line.replace("## ", "")}
      </h3>
    );
  }
  if (line.startsWith("# ")) {
    return (
      <h2 key={idx} className="text-base font-display font-bold text-foreground mt-4 mb-2">
        {line.replace("# ", "")}
      </h2>
    );
  }
  // Bullet points
  if (line.startsWith("- ") || line.startsWith("• ")) {
    return (
      <li key={idx} className="text-sm text-foreground/90 ml-4 mb-1 list-disc">
        {renderInline(line.slice(2))}
      </li>
    );
  }
  // Thread separator
  if (line.trim() === "---") {
    return <hr key={idx} className="border-border/30 my-3" />;
  }
  // Numbered items (threads)
  const numberedMatch = line.match(/^(\d+)\//);
  if (numberedMatch) {
    return (
      <div key={idx} className="flex gap-2 mb-2">
        <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
          {numberedMatch[1]}
        </span>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {renderInline(line.slice(numberedMatch[0].length).trim())}
        </p>
      </div>
    );
  }
  // Empty line
  if (line.trim() === "") {
    return <div key={idx} className="h-2" />;
  }
  // Default paragraph
  return (
    <p key={idx} className="text-sm text-foreground/90 leading-relaxed mb-1">
      {renderInline(line)}
    </p>
  );
}

function renderInline(text: string) {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

const FormattedOutput = ({ content, agentName }: FormattedOutputProps) => {
  // Skip code blocks for game builder — handled by CodePreview
  const codeBlockMatch = content.match(/```html\s*[\s\S]*?```/);
  const textContent = codeBlockMatch
    ? content.replace(codeBlockMatch[0], "").trim()
    : content;

  if (!textContent) return null;

  const lines = textContent.split("\n");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-0"
    >
      {lines.map((line, idx) => renderMarkdownLine(line, idx))}
    </motion.div>
  );
};

export default FormattedOutput;
