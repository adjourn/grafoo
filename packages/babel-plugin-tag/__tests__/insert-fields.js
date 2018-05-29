import fs from "fs";
import { parse, print } from "graphql";
import path from "path";
import insertFields from "../src/insert-fields";

const schema = fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8");

const cases = [
  {
    should: "should insert a field",
    input: "{ author { name } }",
    expectedOutput: "{ author { name id } }",
    fieldsToInsert: ["id"]
  },
  {
    should: "should insert more then a field if specified",
    input: "{ author { name } }",
    expectedOutput: "{ author { name username email id } }",
    fieldsToInsert: ["username", "email", "id"]
  },
  {
    should: "should insert `__typename` if specified",
    input: "{ author { name } }",
    expectedOutput: "{ author { name __typename } }",
    fieldsToInsert: ["__typename"]
  },
  {
    should: "should insert props in queries with fragments",
    input: `
      {
        user {
          ...UserFrag
        }
      }

      fragment UserFrag on Author {
        name
        posts {
          title
        }
      }
    `,
    expectedOutput: `
      {
        user {
          ...UserFrag
          id
        }
      }

      fragment UserFrag on Author {
        name
        posts {
          title
          id
        }
      }
    `,
    fieldsToInsert: ["id"]
  },
  {
    should: "should insert props in queries with inline fragments",
    input: `
      {
        user {
          name
          ...on Author {
            posts {
              title
            }
          }
        }
      }
    `,
    expectedOutput: `
      {
        user {
          name
          ...on Author {
            posts {
              title
              id
              __typename
            }
          }
          id
          __typename
        }
      }
    `,
    fieldsToInsert: ["id", "__typename"]
  },
  {
    should: "should not insert `__typename` inside fragments",
    input: `
      {
        user {
          ...UserFrag
        }
      }

      fragment UserFrag on Author {
        name
        posts {
          title
        }
      }
    `,
    expectedOutput: `
      {
        user {
          ...UserFrag
          __typename
        }
      }

      fragment UserFrag on Author {
        name
        posts {
          title
          __typename
        }
      }
    `,
    fieldsToInsert: ["__typename"]
  },
  {
    should: "should not insert `__typename` inside inline fragments",
    input: `
      {
        user {
          name
          ...on Author {
            posts {
              title
            }
          }
        }
      }
    `,
    expectedOutput: `
      {
        user {
          name
          ...on Author {
            posts {
              title
              __typename
            }
          }
          __typename
        }
      }
    `,
    fieldsToInsert: ["__typename"]
  },
  {
    should: "should insert field present on a fragment",
    input: `
      {
        user {
          ...UserFrag
        }
      }

      fragment UserFrag on Author {
        name
        posts {
          title
        }
      }
    `,
    expectedOutput: `
      {
        user {
          ...UserFrag
        }
      }

      fragment UserFrag on Author {
        name
        posts {
          title
        }
        bio
      }
    `,
    fieldsToInsert: ["bio"]
  },
  {
    should: "should insert field present in an inline fragment",
    input: `
      {
        user {
          name
          ...on Author {
            posts {
              title
            }
          }
        }
      }
    `,
    expectedOutput: `
      {
        user {
          name
          ...on Author {
            posts {
              title
            }
            bio
          }
        }
      }
    `,
    fieldsToInsert: ["bio"]
  },
  {
    should: "should not insert `__typename` in an operation definition",
    input: `
      mutation createPost($title: Int!, $body: Int!, $id: ID! $authors: [ID!]!) {
        createPost(title: $title, body: $body, authors: $authors) {
          title
          body
          createdAt
          tags { name }
          authors { name username }
        }
      }
    `,
    expectedOutput: `
      mutation createPost($title: Int!, $body: Int!, $id: ID! $authors: [ID!]!) {
        createPost(title: $title, body: $body, authors: $authors) {
          title
          body
          createdAt
          tags { name id __typename }
          authors { name username id __typename }
          id
          __typename
        }
      }
    `,
    fieldsToInsert: ["id", "__typename"]
  }
];

describe("insert-fields", () => {
  for (const { should, input, expectedOutput, fieldsToInsert } of cases) {
    it(should, () => {
      expect(print(insertFields(schema, parse(input), fieldsToInsert))).toBe(
        print(parse(expectedOutput))
      );
    });
  }
});
