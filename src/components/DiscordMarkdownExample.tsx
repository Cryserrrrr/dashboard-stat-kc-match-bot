import { DiscordMarkdownRenderer } from "./DiscordMarkdownRenderer";

export function DiscordMarkdownExample() {
  // Example Discord markdown content
  const exampleContent = `# 🎉 New Bot Features Released!

**Major Updates:**
• **Enhanced** moderation commands with *improved* accuracy
• __Underlined__ important features and ~~removed~~ deprecated ones
• Added support for \`inline code\` and code blocks:

\`\`\`javascript
// Example bot command
bot.on('message', (msg) => {
  if (msg.content.includes('!hello')) {
    msg.reply('Hello, Discord!');
  }
});
\`\`\`

**Quotes and References:**
> This is a regular quote
>>> This is a nested quote for important announcements

**Lists and Organization:**
1. First priority feature
2. Second priority feature
3. Third priority feature

• Bullet point for general notes
• Another important note
• Final reminder

**Interactive Elements:**
• Spoilers: ||This is hidden content that users can reveal by clicking||
• More spoilers: ||Another secret feature||

**Discord-Specific Features:**
• User mentions: <@123456789012345678>
• Role mentions: <@&987654321098765432>
• Channel mentions: <#111222333444555666>
• Special mentions: @here @everyone

**Timestamps:**
• Release date: <t:1703123456:f>
• Time since release: <t:1703123456:R>
• Short time: <t:1703123456:t>
• Full date: <t:1703123456:F>

**Status Updates:**
✅ Completed features
🔄 In progress
❌ Known issues
⚠️ Important warnings

---

*This changelog was generated automatically by the bot management system.*`;

  // Mock resolvers for Discord mentions
  const mockResolvers = {
    resolveUser: (id: string) => ({
      username: `User${id.slice(-3)}`,
      avatar: undefined,
    }),
    resolveRole: (id: string) => ({
      name: `Moderator${id.slice(-3)}`,
      color: "#7289da",
    }),
    resolveChannel: (id: string) => ({
      name: `general-${id.slice(-3)}`,
      type: "text",
    }),
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Discord Markdown Renderer Example
        </h1>
        <p className="text-gray-600">
          This example shows how the DiscordMarkdownRenderer component handles
          various Discord markdown features.
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
        <DiscordMarkdownRenderer content={exampleContent} {...mockResolvers} />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          Features Demonstrated:
        </h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>
            • <strong>Bold</strong>, <em>italic</em>, <u>underlined</u>, and{" "}
            <s>strikethrough</s> text
          </li>
          <li>
            • Inline <code>code</code> and code blocks with syntax highlighting
          </li>
          <li>• Quote blocks (single and nested)</li>
          <li>• Numbered and bulleted lists</li>
          <li>• Spoilers (click to reveal)</li>
          <li>• Discord mentions (users, roles, channels)</li>
          <li>• Special mentions (@here, @everyone)</li>
          <li>• Timestamps with various formats</li>
          <li>• Emojis and special characters</li>
        </ul>
      </div>
    </div>
  );
}
