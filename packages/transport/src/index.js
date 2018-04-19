import { assign } from "@grafoo/util";

import GraphQlError from "./graphql-error";

export default function createTransport(uri, fetchOptions) {
  fetchOptions = fetchOptions || {};

  return request => {
    const init = fetchOptions.call ? fetchOptions() : fetchOptions;

    assign(init, {
      body: JSON.stringify(request),
      method: "POST",
      headers: assign({}, init.headers, { "Content-Type": "application/json" })
    });

    return fetch(uri, init)
      .then(res => res.json())
      .then(({ data, errors }) => {
        if (errors) throw new GraphQlError(errors, request);

        return data;
      });
  };
}
