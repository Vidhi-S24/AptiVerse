import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const sanitizeMalformedMath = (raw: string): string => {
  return raw
    .replace(/\/\s*\{/g, "/")
    .replace(/\{\s*\{/g, "{")
    .replace(/(^|\s)\}(\s|$)/g, "$1$2")
    .replace(/[^\S\n]+/g, " ")
    .trim();
};

const renderSegment = (text: string, isMath: boolean): string => {
  if (isMath) {
    try {
      return katex.renderToString(text, {
        displayMode: false,
        throwOnError: true,
        strict: false,
      });
    } catch (error) {
      console.error("KaTeX rendering error:", error);
      const safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<span>${safe}</span>`;
    }
  } else {
    // Basic HTML escaping for non-math text
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};

export const renderKaTeX = (raw: string, isBlock = false): React.ReactNode => {
  if (!raw) return null;

  const processed = sanitizeMalformedMath(raw);
  const lines = isBlock
    ? processed.split(/\n+/)
    : [processed.replace(/\n+/g, " ")];

  return (
    <div
      className={isBlock ? "textbook-solution-container" : "math-inline-flow"}
    >
      <style>{`
        .katex-mathml { display: none !important; }
        .math-inline-flow { display: inline; white-space: normal; }
        
        .textbook-solution-container { 
          display: block; 
          line-height: 1.7; 
          color: #2d3748; 
        }

        .solution-step { 
          display: block; 
          margin-bottom: 12px; 
          white-space: normal; 
        }

        .text-segment, .math-segment { 
          display: inline; 
        }
        
        .textbook-solution-container span.math-segment {
          margin-left: -50px;
        } 
        
        .textbook-solution-container span.mfrac {
          font-size: 1.4em;
        }

        .katex { margin: 0; }
      `}</style>

      {lines.map((line, lineIndex) => {
        const cleanLine = line.trim();
        if (!cleanLine) return null;

        const segments = cleanLine.split(/(\$.*?\$)/g);

        return (
          <div
            key={lineIndex}
            className={isBlock ? "solution-step" : "math-inline-flow"}
          >
            {segments.map((seg, segIndex) => {
              if (!seg) return null;

              const isMath = seg.startsWith("$") && seg.endsWith("$");
              const content = isMath ? seg.slice(1, -1).trim() : seg;

              return (
                <span
                  key={segIndex}
                  className={isMath ? "math-segment" : "text-segment"}
                  dangerouslySetInnerHTML={{
                    __html: renderSegment(content, isMath),
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
