import { useState, useEffect } from "react";
import { Edit, Trash2, Eye, EyeOff, Save, X } from "lucide-react";
import { cn } from "../utils/cn";
import { api } from "../services/api";
import { DiscordMarkdownRenderer } from "./DiscordMarkdownRenderer";

interface Changelog {
  id: string;
  text: string;
  status: string;
  createdAt: string;
}

const processEmojis = (text: string) => {
  // Common emoji patterns
  const emojiMap: { [key: string]: string } = {
    ":smile:": "😊",
    ":heart:": "❤️",
    ":thumbsup:": "👍",
    ":thumbsdown:": "👎",
    ":fire:": "🔥",
    ":rocket:": "🚀",
    ":star:": "⭐",
    ":check:": "✅",
    ":warning:": "⚠️",
    ":info:": "ℹ️",
    ":bug:": "🐛",
    ":gear:": "⚙️",
    ":sparkles:": "✨",
    ":tada:": "🎉",
    ":memo:": "📝",
    ":bulb:": "💡",
    ":wrench:": "🔧",
    ":package:": "📦",
    ":arrow_up:": "⬆️",
    ":arrow_down:": "⬇️",
    ":arrow_left:": "⬅️",
    ":arrow_right:": "➡️",
    ":white_check_mark:": "✅",
    ":heavy_check_mark:": "✅",
    ":x:": "❌",
    ":heavy_multiplication_x:": "❌",
    ":exclamation:": "❗",
    ":question:": "❓",
    ":grey_exclamation:": "❕",
    ":grey_question:": "❔",
    ":zero:": "0️⃣",
    ":one:": "1️⃣",
    ":two:": "2️⃣",
    ":three:": "3️⃣",
    ":four:": "4️⃣",
    ":five:": "5️⃣",
    ":six:": "6️⃣",
    ":seven:": "7️⃣",
    ":eight:": "8️⃣",
    ":nine:": "9️⃣",
    ":keycap_ten:": "🔟",
  };

  let processedText = text;

  // Replace emoji codes with actual emojis
  Object.entries(emojiMap).forEach(([code, emoji]) => {
    processedText = processedText.replace(new RegExp(code, "g"), emoji);
  });

  processedText = processedText.replace(/<:([^:]+):(\d+)>/g, ":$1:");

  return processedText;
};

export function ChangelogPage() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [newChangelog, setNewChangelog] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedChangelog, setSelectedChangelog] = useState<Changelog | null>(
    null
  );

  useEffect(() => {
    fetchChangelogs();
  }, []);

  const fetchChangelogs = async () => {
    try {
      const changelogs = await api.getChangelogs();
      setChangelogs(changelogs);
    } catch (error) {
      console.error("Error fetching changelogs:", error);
    }
  };

  const handleSubmit = async () => {
    if (!newChangelog.trim()) return;

    setLoading(true);
    try {
      await api.createChangelog(newChangelog);
      setNewChangelog("");
      fetchChangelogs();
    } catch (error) {
      console.error("Error creating changelog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingText.trim()) return;

    try {
      await api.updateChangelog(id, editingText);
      setEditingId(null);
      setEditingText("");
      fetchChangelogs();
    } catch (error) {
      console.error("Error updating changelog:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this changelog?")) return;

    try {
      await api.deleteChangelog(id);
      fetchChangelogs();
    } catch (error) {
      console.error("Error deleting changelog:", error);
    }
  };

  const startEdit = (changelog: Changelog) => {
    setEditingId(changelog.id);
    setEditingText(changelog.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const openChangelogModal = (changelog: Changelog) => {
    setSelectedChangelog(changelog);
  };

  const closeChangelogModal = () => {
    setSelectedChangelog(null);
  };

  // Mock data for Discord mentions (in a real app, these would come from your Discord API)
  const mockResolvers = {
    resolveUser: (id: string) => ({
      username: `User${id.slice(-3)}`,
      avatar: undefined,
    }),
    resolveRole: (id: string) => ({
      name: `Role${id.slice(-3)}`,
      color: "#7289da",
    }),
    resolveChannel: (id: string) => ({
      name: `channel-${id.slice(-3)}`,
      type: "text",
    }),
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;

    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + "...";
    }

    return truncated + "...";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Changelog Management
          </h1>
          <p className="text-gray-600 dark:text-white">
            Create and manage changelog entries with markdown support
          </p>
        </div>

        {/* Create New Changelog */}
        <div className="bg-white dark:bg-brand-card rounded-xl shadow-md p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Create New Changelog
          </h2>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Changelog Content
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center text-sm text-brand-light dark:text-white hover:text-brand-light/80 dark:hover:text-gray-300 transition-colors"
              >
                {showPreview ? (
                  <EyeOff className="h-4 w-4 mr-1" />
                ) : (
                  <Eye className="h-4 w-4 mr-1" />
                )}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <textarea
                  value={newChangelog}
                  onChange={(e) => setNewChangelog(e.target.value)}
                  placeholder={`# Changelog Example

**New Features:**
• Added support for **bold** and *italic* text
• Implemented __underlined__ and ~~strikethrough~~ formatting
• Added code blocks with syntax highlighting:

\`\`\`javascript
function hello() {
  console.log("Hello Discord!");
}
\`\`\`

• Support for inline \`code\` snippets
• Quote blocks:
> This is a quote
>>> This is a nested quote

• Lists:
1. Numbered list item
2. Another item
• Bullet point
• Another bullet

• Spoilers: ||Click to reveal hidden content||

• Mentions: <@123456789> <@&987654321> <#111222333>
• Special mentions: @here @everyone

• Timestamps: <t:1703123456:f> <t:1703123456:R>

• Emojis: :smile: :heart: :fire: :rocket: :star:`}
                  className="w-full h-64 p-3 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent resize-none font-mono text-sm dark:bg-brand-card dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {showPreview && (
                <div className="border border-gray-300 dark:border-gray-500 rounded-lg p-3 h-64 overflow-y-auto bg-gray-900 dark:bg-brand-dark">
                  <DiscordMarkdownRenderer
                    content={processEmojis(newChangelog)}
                    {...mockResolvers}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading || !newChangelog.trim()}
              className="flex items-center px-4 py-2 bg-brand-light dark:bg-brand-light text-white rounded-lg hover:bg-brand-light/80 dark:hover:bg-brand-light/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Changelog"}
            </button>
          </div>
        </div>

        {/* Changelogs Table */}
        <div className="bg-white dark:bg-brand-card rounded-xl shadow-md overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              All Changelogs
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-brand-600">
              <thead className="bg-gray-50 dark:bg-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-brand-card divide-y divide-gray-200 dark:divide-gray-500">
                {changelogs.map((changelog) => (
                  <tr
                    key={changelog.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {editingId === changelog.id ? (
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-brand-600 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none dark:bg-brand-700 dark:text-white"
                          rows={3}
                        />
                      ) : (
                        <div
                          className="bg-gray-900 dark:bg-brand-900 p-3 rounded cursor-pointer hover:bg-gray-800 dark:hover:bg-brand-800 transition-colors"
                          onClick={() => openChangelogModal(changelog)}
                        >
                          <div className="max-h-32 overflow-hidden">
                            <DiscordMarkdownRenderer
                              content={processEmojis(
                                truncateText(changelog.text, 150)
                              )}
                              {...mockResolvers}
                            />
                          </div>
                          {changelog.text.length > 150 && (
                            <div className="mt-2 text-xs text-blue-400 dark:text-brand-300 border-t border-gray-700 dark:border-brand-600 pt-2">
                              Cliquez pour voir tout le contenu
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                          changelog.status === "new"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                            : "bg-brand-100 dark:bg-brand-700 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-600"
                        )}
                      >
                        {changelog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-brand-400">
                      {new Date(changelog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === changelog.id ? (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEdit(changelog.id)}
                            className="p-2 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Sauvegarder"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-gray-600 dark:text-brand-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-brand-700 rounded-lg transition-colors"
                            title="Annuler"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => startEdit(changelog)}
                            className="p-2 text-brand-600 dark:text-brand-300 hover:text-brand-900 dark:hover:text-brand-100 hover:bg-brand-50 dark:hover:bg-brand-700 rounded-lg transition-colors"
                            title="Éditer"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(changelog.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {changelogs.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-brand-400">
                No changelogs found. Create your first one above!
              </div>
            )}
          </div>
        </div>

        {/* Modal pour afficher le contenu complet */}
        {selectedChangelog && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeChangelogModal}
          >
            <div
              className="bg-white dark:bg-brand-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-brand-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Changelog -{" "}
                  {new Date(selectedChangelog.createdAt).toLocaleDateString()}
                </h3>
                <button
                  onClick={closeChangelogModal}
                  className="text-gray-400 dark:text-brand-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="bg-gray-900 dark:bg-brand-900 p-4 rounded">
                  <DiscordMarkdownRenderer
                    content={processEmojis(selectedChangelog.text)}
                    {...mockResolvers}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
