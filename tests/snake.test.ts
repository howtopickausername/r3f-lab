import { describe, it, expect } from "vitest";
import { makeSnake, randomFood, tick, GRID } from "../src/lib/snake";

describe("makeSnake", () => {
  it("returns a snake of length 3", () => {
    expect(makeSnake()).toHaveLength(3);
  });

  it("snake head is at (2,4)", () => {
    expect(makeSnake()[0]).toEqual({ x: 2, y: 4 });
  });

  it("all segments within grid", () => {
    for (const p of makeSnake()) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThan(GRID);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThan(GRID);
    }
  });
});

describe("randomFood", () => {
  it("generates in bounds", () => {
    const s = makeSnake();
    for (let i = 0; i < 100; i++) {
      const f = randomFood(s);
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.x).toBeLessThan(GRID);
      expect(f.y).toBeGreaterThanOrEqual(0);
      expect(f.y).toBeLessThan(GRID);
    }
  });

  it("never on snake", () => {
    const s = makeSnake();
    for (let i = 0; i < 100; i++) {
      const f = randomFood(s);
      expect(s.some((p) => p.x === f.x && p.y === f.y)).toBe(false);
    }
  });
});

describe("tick", () => {
  it("moves head right (default)", () => {
    const r = tick(makeSnake(), "RIGHT", { x: 9, y: 9 });
    expect(r.snake[0]).toEqual({ x: 3, y: 4 });
    expect(r.dead).toBe(false);
  });

  it("moves head up", () => {
    const r = tick(makeSnake(), "UP", { x: 9, y: 9 });
    expect(r.snake[0]).toEqual({ x: 2, y: 3 });
  });

  it("moves head down", () => {
    const r = tick(makeSnake(), "DOWN", { x: 9, y: 9 });
    expect(r.snake[0]).toEqual({ x: 2, y: 5 });
  });

  // LEFT from start position (2,4) would collide with body[1]=(1,4).
  // So use a snake pointing UP where left is safe.
  it("moves head left when safe", () => {
    const s = [{ x: 4, y: 5 }, { x: 4, y: 4 }, { x: 4, y: 3 }];
    const r = tick(s, "LEFT", { x: 9, y: 9 });
    expect(r.snake[0]).toEqual({ x: 3, y: 5 });
    expect(r.dead).toBe(false);
  });

  it("wraps top edge", () => {
    const s = [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }];
    expect(tick(s, "UP", { x: 9, y: 9 }).snake[0]).toEqual({ x: 5, y: GRID - 1 });
  });

  it("wraps bottom edge", () => {
    const s = [{ x: 5, y: GRID - 1 }, { x: 5, y: GRID - 2 }, { x: 5, y: GRID - 3 }];
    expect(tick(s, "DOWN", { x: 9, y: 9 }).snake[0]).toEqual({ x: 5, y: 0 });
  });

  it("wraps left edge", () => {
    const s = [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }];
    expect(tick(s, "LEFT", { x: 9, y: 9 }).snake[0]).toEqual({ x: GRID - 1, y: 5 });
  });

  it("wraps right edge", () => {
    const s = [{ x: GRID - 1, y: 5 }, { x: GRID - 2, y: 5 }, { x: GRID - 3, y: 5 }];
    expect(tick(s, "RIGHT", { x: 9, y: 9 }).snake[0]).toEqual({ x: 0, y: 5 });
  });

  it("stays same length when not eating", () => {
    const r = tick(makeSnake(), "RIGHT", { x: 9, y: 9 });
    expect(r.snake).toHaveLength(3);
    expect(r.ate).toBe(false);
  });

  it("grows when eating and food moves", () => {
    const r = tick(makeSnake(), "RIGHT", { x: 3, y: 4 });
    expect(r.snake).toHaveLength(4);
    expect(r.ate).toBe(true);
    expect(r.food).not.toEqual({ x: 3, y: 4 });
  });

  // Tight circle snake, head pointing into body
  it("detects self-collision in tight loop", () => {
    const s = [
      { x: 5, y: 4 }, // head
      { x: 6, y: 4 }, // body1
      { x: 6, y: 5 }, // body2
      { x: 5, y: 5 }, // body3
    ];
    // Move DOWN: (5,4)→(5,5). Body=[(5,4),(6,4),(6,5)]. (5,5) matches body[2]? No.
    // Need a better setup:
    const s2 = [
      { x: 5, y: 3 }, // head
      { x: 5, y: 4 }, // body1
      { x: 5, y: 5 }, // body2 (tail)
    ];
    // Move DOWN: (5,3)→(5,4). Body=[(5,3),(5,4)]. (5,4) matches body[1]!
    const r = tick(s2, "DOWN", { x: 9, y: 9 });
    expect(r.dead).toBe(true);
    expect(r.snake).toEqual(s2); // unchanged
  });

  it("does NOT die when moving into old tail slot (tail will move)", () => {
    const s = [{ x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }];
    // Moving UP: head→(3,3). Body(excl tail)=[(3,4),(3,5)]. (3,3)∉body.
    expect(tick(s, "UP", { x: 9, y: 9 }).dead).toBe(false);
  });

  it("returns snake and food unchanged on death", () => {
    const s = [{ x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }];
    const f = { x: 0, y: 0 };
    const r = tick(s, "DOWN", f);
    expect(r.dead).toBe(true);
    expect(r.snake).toEqual(s);
    expect(r.food).toEqual(f);
    expect(r.ate).toBe(false);
  });
});
