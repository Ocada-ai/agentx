     // custom-types.d.ts
     declare module '@langchain/community/tools/searchapi' {
        export class SearchApi {
          constructor(apiKey: string, options: { engine: string });
          // Add any other methods or properties you need
        }
      }