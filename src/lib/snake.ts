// ═══ Snake Game — Pure Logic (no React, no Canvas) ═══

export const GRID = 10;

export type Point = { x: number; y: number };

export function makeSnake(): Point[] {
  return [
    { x: 2, y: 4 },
    { x: 1, y: 4 },
    { x: 0, y: 4 },
  ];
}

export function randomFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

export function tick(
  snake: Point[],
  dir: string,
  food: Point
): { snake: Point[]; food: Point; ate: boolean; dead: boolean } {
  const head = snake[0];
  const newHead = { x: head.x, y: head.y };

  if (dir === "UP") newHead.y = (newHead.y - 1 + GRID) % GRID;
  else if (dir === "DOWN") newHead.y = (newHead.y + 1) % GRID;
  else if (dir === "LEFT") newHead.x = (newHead.x - 1 + GRID) % GRID;
  else newHead.x = (newHead.x + 1) % GRID;

  // Self collision: check against body (NOT tail tip, since it will move)
  const body = snake.slice(0, -1);
  if (body.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    return { snake, food, ate: false, dead: true };
  }

  const ate = newHead.x === food.x && newHead.y === food.y;
  const newSnake = [newHead, ...snake];
  if (!ate) newSnake.pop();

  return { snake: newSnake, food: ate ? randomFood(newSnake) : food, ate, dead: false };
}
