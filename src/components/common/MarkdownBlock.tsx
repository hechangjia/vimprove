import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownBlockProps = {
  content: string;
};

export const MarkdownBlock = ({ content }: MarkdownBlockProps) => (
  <div className="prose max-w-none mb-8">
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-success-muted-foreground mt-6 mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-bold text-success-soft mt-4 mb-2">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground-muted">{children}</p>,
        ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-foreground-muted">{children}</li>,
        code: ({ className, children }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-surface-3 text-success-muted-foreground px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-surface-2 text-foreground-muted p-4 rounded-lg overflow-x-auto font-mono text-sm border border-border">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="mb-4">{children}</pre>,
        strong: ({ children }) => <strong className="font-bold text-foreground-strong">{children}</strong>,
        em: ({ children }) => <em className="italic text-foreground">{children}</em>,
      }}
    >
      {content}
    </Markdown>
  </div>
);
