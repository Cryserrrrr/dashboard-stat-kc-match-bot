import React, { useState } from "react";
import { parse } from "discord-markdown-parser";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface DiscordMarkdownRendererProps {
  content: string;
  resolveUser?: (id: string) => { username: string; avatar?: string } | null;
  resolveRole?: (id: string) => { name: string; color?: string } | null;
  resolveChannel?: (id: string) => { name: string; type?: string } | null;
}

export function DiscordMarkdownRenderer({
  content,
  resolveUser,
  resolveRole,
  resolveChannel,
}: DiscordMarkdownRendererProps) {
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(
    new Set()
  );

  const toggleSpoiler = (id: string) => {
    const newRevealed = new Set(revealedSpoilers);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedSpoilers(newRevealed);
  };

  const renderNode = (node: any, key: string = ""): React.ReactNode => {
    if (!node) return null;

    switch (node.type) {
      case "text":
        const textContent = node.content || "";
        if (textContent.includes("\n")) {
          const lines = textContent.split("\n");
          return lines.map((line: string, i: number) => (
            <React.Fragment key={`${key}-line-${i}`}>
              {line}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ));
        }
        return textContent.replace(/ {2,}/g, (match: string) =>
          "\u00A0".repeat(match.length)
        );

      case "strong":
        return (
          <strong key={key} className="font-bold">
            {node.content.map((child: any, i: number) =>
              renderNode(child, `${key}-${i}`)
            )}
          </strong>
        );

      case "em":
        return (
          <em key={key} className="italic">
            {node.content.map((child: any, i: number) =>
              renderNode(child, `${key}-${i}`)
            )}
          </em>
        );

      case "u":
        return (
          <u key={key} className="underline">
            {node.content.map((child: any, i: number) =>
              renderNode(child, `${key}-${i}`)
            )}
          </u>
        );

      case "s":
        return (
          <s key={key} className="line-through">
            {node.content.map((child: any, i: number) =>
              renderNode(child, `${key}-${i}`)
            )}
          </s>
        );

      case "code":
        return (
          <code
            key={key}
            className="bg-gray-800 text-gray-200 px-1 py-0.5 rounded text-sm font-mono"
          >
            {node.content}
          </code>
        );

      case "codeBlock":
        return (
          <pre
            key={key}
            className="bg-gray-800 text-gray-200 p-3 rounded-lg overflow-x-auto my-2"
          >
            <code className="font-mono text-sm">
              {node.language && (
                <div className="text-gray-400 text-xs mb-2 border-b border-gray-700 pb-1">
                  {node.language}
                </div>
              )}
              {node.content}
            </code>
          </pre>
        );

      case "quote":
        return (
          <blockquote
            key={key}
            className="border-l-4 border-gray-400 pl-4 my-2 italic text-gray-600"
          >
            {node.content.map((child: any, i: number) =>
              renderNode(child, `${key}-${i}`)
            )}
          </blockquote>
        );

      case "list":
        const ListTag = node.ordered ? "ol" : "ul";
        return (
          <ListTag
            key={key}
            className={`${
              node.ordered ? "list-decimal" : "list-disc"
            } ml-6 my-2`}
          >
            {node.content.map((item: any, i: number) => (
              <li key={`${key}-${i}`}>
                {item.content.map((child: any, j: number) =>
                  renderNode(child, `${key}-${i}-${j}`)
                )}
              </li>
            ))}
          </ListTag>
        );

      case "spoiler":
        const spoilerId = `spoiler-${key}`;
        const isRevealed = revealedSpoilers.has(spoilerId);
        return (
          <span key={key}>
            <span
              className={`inline-block px-1 rounded cursor-pointer transition-colors ${
                isRevealed
                  ? "bg-gray-200 text-gray-800"
                  : "bg-gray-800 text-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => toggleSpoiler(spoilerId)}
            >
              {isRevealed
                ? node.content.map((child: any, i: number) =>
                    renderNode(child, `${key}-${i}`)
                  )
                : "SPOILER"}
            </span>
          </span>
        );

      case "user":
        const user = resolveUser?.(node.id);
        return (
          <span
            key={key}
            className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-sm"
          >
            @{user?.username || `User-${node.id}`}
          </span>
        );

      case "role":
        const role = resolveRole?.(node.id);
        return (
          <span
            key={key}
            className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-sm"
          >
            @{role?.name || `Role-${node.id}`}
          </span>
        );

      case "channel":
        const channel = resolveChannel?.(node.id);
        return (
          <span
            key={key}
            className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm"
          >
            #{channel?.name || `Channel-${node.id}`}
          </span>
        );

      case "everyone":
        return (
          <span
            key={key}
            className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-sm"
          >
            @everyone
          </span>
        );

      case "here":
        return (
          <span
            key={key}
            className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-sm"
          >
            @here
          </span>
        );

      case "timestamp":
        const timestamp = dayjs.unix(node.timestamp);
        const format = node.format || "f";
        let formattedDate = "";

        switch (format) {
          case "t":
            formattedDate = timestamp.format("HH:mm");
            break;
          case "T":
            formattedDate = timestamp.format("HH:mm:ss");
            break;
          case "d":
            formattedDate = timestamp.format("DD/MM/YYYY");
            break;
          case "D":
            formattedDate = timestamp.format("DD MMMM YYYY");
            break;
          case "f":
            formattedDate = timestamp.format("DD MMMM YYYY HH:mm");
            break;
          case "F":
            formattedDate = timestamp.format("dddd, DD MMMM YYYY HH:mm");
            break;
          case "R":
            formattedDate = timestamp.fromNow();
            break;
          default:
            formattedDate = timestamp.format("DD/MM/YYYY HH:mm");
        }

        return (
          <span
            key={key}
            className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm"
          >
            {formattedDate}
          </span>
        );
      case "newline":
      case "br":
        return <br key={key} />;

      case "paragraph":
        return (
          <p key={key} className="my-2">
            {node.content.map((child: any, i: number) =>
              renderNode(child, `${key}-${i}`)
            )}
          </p>
        );

      default:
        if (Array.isArray(node.content)) {
          return node.content.map((child: any, i: number) =>
            renderNode(child, `${key}-${i}`)
          );
        }
        return node.content || null;
    }
  };

  const preprocessContent = (content: string) => {
    return content.replace(/\n\n+/g, "\n\n");
  };

  try {
    const processedContent = preprocessContent(content);
    const ast = parse(processedContent);

    const renderedContent = ast.map((node: any, index: number) => {
      const renderedNode = renderNode(node, `node-${index}`);

      return renderedNode;
    });

    return <div className="discord-md">{renderedContent}</div>;
  } catch (error) {
    console.error("Error parsing Discord markdown:", error);
    return (
      <div className="discord-md">
        <pre className="bg-red-100 text-red-800 p-2 rounded text-sm">
          Error parsing markdown: {content}
        </pre>
      </div>
    );
  }
}
