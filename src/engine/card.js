/* The parts of a shared card that are not about any aircraft: the ink, the
   type, line breaking, and the verdict block that every card carries.

   An aircraft's own view.jsx draws its own chart onto the card and nothing
   here knows how — but the header, the verdict and the type they are set in
   are the same on every card, and one of them drifting from the others is
   how a card ends up saying less than the screen it came from. */

export const CARD_INK = "#16272c", CARD_INK3 = "#5d7076";
const STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
export const F = (weight, size) => `${weight} ${size}px ${STACK}`;

/* Canvas has no line breaking of its own: text drawn past the edge of the
   image is simply not there. Measure in the font it will be drawn in. */
export function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of String(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/* The verdict, drawn the way the page draws it: a rule in the colour of the
   answer, the answer as a word, then the manual's own sentence. Returns the
   y the next thing may start at. */
export function drawVerdicts(ctx, says, left, top, width) {
  let y = top;
  for (const v of says || []) {
    ctx.textAlign = "left";
    ctx.font = F(500, 13.5);
    const lines = wrapText(ctx, v.text, width - 14);
    const height = 16 + lines.length * 18;
    ctx.fillStyle = v.hex;
    ctx.fillRect(left, y - 12, 2, height);
    ctx.font = F(700, 11);
    ctx.fillText(v.word.toUpperCase(), left + 14, y);
    ctx.fillStyle = CARD_INK;
    ctx.font = F(500, 13.5);
    lines.forEach((line, i) => ctx.fillText(line, left + 14, y + 19 + i * 18));
    y += height + 16;
  }
  return y;
}
