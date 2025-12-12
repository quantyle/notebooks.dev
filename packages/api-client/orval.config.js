module.exports = {
  "api-client": {
    output: {
      mode: "single",
      target: "./lib/client.ts",
      client: "axios",
      override: {
        mutator: {
          path: "./lib/custom-axios.ts",
          name: "customAxios",
        },
      },
    },
    input: {
      target: "http://localhost:3001/openapi.json",
    },
  },
};
