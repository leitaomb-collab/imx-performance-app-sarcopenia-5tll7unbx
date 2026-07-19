export function RichText({ content, emptyMsg }: { content?: string; emptyMsg: string }) {
  if (!content || !content.trim())
    return <p className="text-sm text-muted-foreground">{emptyMsg}</p>
  if (/<[^>]+>/.test(content))
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  return <p className="text-sm whitespace-pre-wrap">{content}</p>
}
