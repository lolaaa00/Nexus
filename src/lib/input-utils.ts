const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

export function detectUrls(text: string): string[] {
  return text.match(URL_REGEX) || [];
}

export function isCodeInput(text: string): boolean {
  const codeIndicators = [
    /```/,
    /function\s+\w+/,
    /const\s+\w+\s*=/,
    /import\s+/,
    /<\w+[^>]*>/,
    /\{\s*\n/,
  ];
  return codeIndicators.some((r) => r.test(text));
}

export function buildEnhancedPrompt(
  userInput: string,
  agentName: string,
  isMultiAgent: boolean = false
): string {
  const urls = detectUrls(userInput);
  const hasCode = isCodeInput(userInput);

  let enhanced = userInput;

  if (urls.length > 0) {
    enhanced = `The user provided the following URL(s): ${urls.join(", ")}.\n\nUser request: ${userInput}\n\nPlease analyze the URL context and incorporate it into your response.`;
  }

  if (hasCode) {
    enhanced = `The user provided code/technical content:\n\n${userInput}\n\nAnalyze and respond based on the provided code.`;
  }

  // Add output format instructions per agent
  if (agentName === "Content Engine") {
    enhanced += "\n\nFormat your response as a structured thread:\n- Start with a bold hook line prefixed with 🧵\n- Number each tweet (1/, 2/, etc.)\n- End with a clear CTA\n- Keep each tweet under 280 chars\n- Separate tweets with ---";
    if (isMultiAgent) {
      enhanced += "\n\nYou are part of a multi-agent team. The Crypto Analyst is providing a detailed breakdown and the Game Builder is creating an interactive experience on the same topic. Your role is to distill the topic into compelling, shareable content. Make it complementary — not redundant.";
    }
  } else if (agentName === "Crypto Analyst") {
    enhanced += "\n\nFormat your response as a structured report with these sections:\n## Overview\n## Key Findings\n## Risk Assessment\n## Opportunities\n## Conclusion\nUse bullet points and bold key terms.";
    if (isMultiAgent) {
      enhanced += "\n\nYou are part of a multi-agent team. The Content Engine is creating shareable content and the Game Builder is creating an interactive experience on the same topic. Your role is to provide the deepest factual analysis. Be the knowledge foundation the other agents build on.";
    }
  } else if (agentName === "Game Builder") {
    enhanced += "\n\nIMPORTANT: Output ONLY the complete HTML code first (wrapped in ```html), then a brief explanation. The code must be a single self-contained HTML file with inline CSS and JS.";
    if (isMultiAgent) {
      enhanced += "\n\nYou are part of a multi-agent team. The Crypto Analyst is explaining the topic and the Content Engine is creating shareable content on the same topic. Your role is to turn the concept into an interactive learning experience.\n\nIf the topic is educational or conceptual, create a quiz-style game with:\n- Multiple-choice questions about the topic\n- Score tracking\n- Correct/incorrect feedback with explanations\n- A restart option\n- Modern, polished UI with gradients and animations\n\nMake the game teach the user about the topic through play.";
    }
  }

  return enhanced;
}
