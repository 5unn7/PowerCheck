/* Bundles entry.jsx and inlines it into index.html.
   index.html is the whole site — no CDN, no server, nothing to fetch. */
import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const { outputFiles } = await build({
  entryPoints: ["entry.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2019",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "eof",
  write: false,
  outfile: "bundle.js",
});

const js = outputFiles[0].text;
const shell = await readFile("shell.html", "utf8");

// the bundle is inlined verbatim, so it must not close the tag early
if (js.includes("</script>")) throw new Error("bundle contains </script>");

// the bundle is minified JS full of $ and backtick sequences, and a string
// replacement would read $&, $` and $' as substitution patterns and quietly
// corrupt it — a function replacer takes the text as-is
const html = shell.replace("<!--BUNDLE-->", () => `<script>\n${js}</script>`);

// refuse to ship a page that does not parse
new vm.Script(js, { filename: "bundle.js" });
if (!html.includes(js)) throw new Error("bundle was mangled during inlining");

await writeFile("index.html", html);
console.log("index.html written —", (js.length / 1024).toFixed(0), "KB of JS, parses clean");
