export function getSources(parts: any[]) {
  if (!parts || !Array.isArray(parts)) {
    return []
  }

  const sources = parts
    ?.filter(
      (part) => part.type === "source-url" || part.type === "source-document" || part.type?.startsWith("tool-")
    )
    .map((part) => {
      if (part.type === "source-url" || part.type === "source-document") {
        return part.source || part
      }

      if (part.type?.startsWith("tool-") && part.state === "result") {
        const result = part.output || part.result

        if (
          part.toolName === "summarizeSources" &&
          result?.result?.[0]?.citations
        ) {
          return result.result.flatMap((item: { citations?: unknown[] }) => item.citations || [])
        }

        return Array.isArray(result) ? result.flat() : result
      }

      return null
    })
    .filter(Boolean)
    .flat()

  const validSources =
    sources?.filter(
      (source) =>
        source && typeof source === "object" && source.url && source.url !== ""
    ) || []

  return validSources
}
