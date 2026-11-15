export function masonryLayout(heights: number[], columns: number, width: number, gap: number) {
  const count = Math.max(1, Math.floor(columns));
  const spacing = Math.max(0, gap);
  const itemWidth = Math.max(0, (width - spacing * (count - 1)) / count);
  const bottoms = Array<number>(count).fill(0);
  const positions = heights.map((height) => {
    const column = bottoms.indexOf(Math.min(...bottoms));
    const position = { left: column * (itemWidth + spacing), top: bottoms[column] };
    bottoms[column] += Math.max(0, height) + spacing;
    return position;
  });
  return { positions, itemWidth, height: heights.length ? Math.max(...bottoms) - spacing : 0 };
}
