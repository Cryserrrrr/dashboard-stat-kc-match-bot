import { DiscordMarkdownRenderer } from "./DiscordMarkdownRenderer";

export function DiscordMarkdownTest() {
  const testMessage = `🧪 **Message de test Discord** — copiez-collez tel quel

**Gras**  *Italique*  __Souligné__  ~~Barré~~  ***Gras+Italique***  ___Souligné+Italique___  ||Spoiler||
Texte monospacé inline : \`npm run dev\`
Caractères échappés : \\*ceci n'est pas en italique\\*

> Citation simple (ligne 1)
> Ligne 2

>>> Bloc de citation multi-ligne
Ligne suivante
Encore une ligne
<<< fin du bloc (laissez une ligne vide ci-dessous)

Listes :
1. Premier
2. Deuxième
3. Troisième

- Puce A
  - Sous-puce A.1
- Puce B

Pseudo-checklist (visuel) :
- [ ] À faire
- [x] Fait

Mentions (sécurisées, n'enverront pas de ping) :
\\@everyone  \\@here
Utilisateur : <@123456789012345678>
Rôle : <@&123456789012345678>
Salon : <#123456789012345678>
👉 Pour tester réellement les pings, supprimez la barre oblique inverse \`\\\`.

Liens :
Aperçu normal : https://www.wikipedia.org
Sans aperçu : <https://www.wikipedia.org>

Horodatages (UTC) :
Complet : <t:1735689600:F>
Relatif : <t:1735689600:R>
Heure seule : <t:1735689600:t>

Émojis :
Unicode : 😄🔥🎯
Personnalisé (remplacez l'ID par un vrai) : <:custom_emoji:123456789012345678>

Bloc de code (JS) :
\`\`\`js
const sum = (a, b) => a + b;
console.log('sum(2,3)=', sum(2,3));
\`\`\`

Bloc de diff :
\`\`\`diff
+ Ajouté : nouvelle fonctionnalité
- Supprimé : ancien comportement
! Attention : changement potentiellement cassant
\`\`\`

Bloc de code (bash) :
\`\`\`bash
curl -I https://example.com
\`\`\`

Texte souligné long :
__Ceci est un long segment de texte souligné pour vérifier le rendu sur plusieurs mots.__

Fin du message ✅`;

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Test Discord Markdown Renderer
        </h1>
        <p className="text-gray-600">Test avec le message Discord fourni</p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
        <DiscordMarkdownRenderer content={testMessage} {...mockResolvers} />
      </div>
    </div>
  );
}
