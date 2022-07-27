import { Cache, QueryInput } from '@urql/exchange-graphcache';

// this function is better than generic updateQuery function from exchange-graphql library because it allows to properly cast variables 
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(
    qi,
    data => fn(result, data as any) as any
  );
}
