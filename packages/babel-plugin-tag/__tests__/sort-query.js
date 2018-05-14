import { parse, print } from "graphql";

import sortQuery from "../src/sort-query";

test("sorts fields, variable declarations and arguments", () => {
  const query = `
    query ($f: ID $e: ID $d: ID $c: ID $b: ID $a: ID) {
      f
      e
      d
      c
      b
      a (f: $f e: $e d: $d c: $c b: $b a: $a) {
        f
        e
        d
        c
        b
        a (f: $f e: $e d: $d c: $c b: $b a: $a) {
          f
          e
          d
          c
          b
          a
        }
      }
    }
  `;

  const expected = `
    query ($a: ID, $b: ID, $c: ID, $d: ID, $e: ID, $f: ID) {
      a(a: $a, b: $b, c: $c, d: $d, e: $e, f: $f) {
        a(a: $a, b: $b, c: $c, d: $d, e: $e, f: $f) {
          a
          b
          c
          d
          e
          f
        }
        b
        c
        d
        e
        f
      }
      b
      c
      d
      e
      f
    }
  `;

  expect(print(sortQuery(parse(query)))).toBe(print(parse(expected)));
});