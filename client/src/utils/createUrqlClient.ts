import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from "urql";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";
import { betterUpdateQuery } from './betterUpdateQuery';
import { pipe, tap } from 'wonka';
import Router from "next/router";

// functon to catch any errors on server side
const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            // If the OperationResult has an error send a request to sentry
            if(error) {
                // the error is a CombinedError with networkError and graphqlErrors properties
                if(error?.message.includes("not authenticated")) {
                    Router.replace('/login');
                }
            }
        })
    )
};

// improvised urql pagination for reddit or twitter
const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => { // the shape of resolver
    const { parentKey: entityKey, fieldName } = info;

    // console.log(entityKey, fieldName); // all of your query is in the cache
    const allFields = cache.inspectFields(entityKey);
    // console.log('all fields: ', allFields);

    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined; // return undefined if there is no data
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`; // is equal to posts({"cursor": "1458932942", "limit": 10})
    const isDataInTheCache = cache.resolve(
        cache.resolveFieldByKey(entityKey, fieldKey) as string, // negate cache availability
        "posts"
    );
    
    info.partial = !isDataInTheCache; // by passing true we're making urql think that not every data was loaded so it's going to fetch it from the server
    let hasMore = true;

    const results: string[] = [];
    fieldInfos.forEach((field) => {
        const key = cache.resolveFieldByKey(entityKey, field.fieldKey) as string;
        const data = cache.resolve(key, 'posts') as string[];
        const _hasMore = cache.resolve(key, 'hasMore');
        if(!_hasMore ) { 
            hasMore = _hasMore as boolean 
        };
        results.push(...data);
    }) // we are reading data by the cache

    return {
        __typename: "PaginatedPosts",
        hasMore,
        posts: results
    }

//     const visited = new Set();
//     let result: NullArray<string> = [];
//     let prevOffset: number | null = null;

//     for (let i = 0; i < size; i++) {
//       const { fieldKey, arguments: args } = fieldInfos[i];
//       if (args === null || !compareArgs(fieldArgs, args)) {
//         continue;
//       }

//       const links = cache.resolve(entityKey, fieldKey) as string[];
//       const currentOffset = args[offsetArgument];

//       if (
//         links === null ||
//         links.length === 0 ||
//         typeof currentOffset !== 'number'
//       ) {
//         continue;
//       }

//       const tempResult: NullArray<string> = [];

//       for (let j = 0; j < links.length; j++) {
//         const link = links[j];
//         if (visited.has(link)) continue;
//         tempResult.push(link);
//         visited.add(link);
//       }

//       if (
//         (!prevOffset || currentOffset > prevOffset) ===
//         (mergeMode === 'after')
//       ) {
//         result = [...result, ...tempResult];
//       } else {
//         result = [...tempResult, ...result];
//       }

//       prevOffset = currentOffset;
//     }

//     const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
//     if (hasCurrentPage) {
//       return result;
//     } else if (!(info as any).store.schema) {
//       return undefined;
//     } else {
//       info.partial = true;
//       return result;
//     }
  };
};

/** Create URQL client */
export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:8080/graphql",
    fetchOptions: {
        credentials: "include" as const // we need this to get cookies. credentaisl were readonly so we converted it to const
    },
    exchanges: [dedupExchange, cacheExchange({
        keys: {
            PaginatedPosts: () => null,
        },
        resolvers: {
            Query: {
                posts: cursorPagination(), // server side pagination
            }
        },
        updates: {
            // these functions will run whenever mutation or query function will run to update cache, without them the pages would save the state into cache and you would have to refresh the page to update state (pretty annoying).
            Mutation: {
                login: (_result: LoginMutation, args, cache, info) => {
                    betterUpdateQuery<LoginMutation, MeQuery>(
                        cache,
                        { query: MeDocument },
                        _result,
                        (result, query) => {
                            if(result.login.errors) {
                                return query;
                            } else {
                                return { me: result.login.user };
                            }
                        }
                    )
                },
                register: (_result: RegisterMutation, args, cache, info) => {
                    betterUpdateQuery<RegisterMutation, MeQuery>(
                        cache,
                        { query: MeDocument },
                        _result,
                        (result, query) => {
                            if(result.register.errors) {
                                return query;
                            } else {
                                return { me: result.register.user };
                            }
                        }
                    )
                },
                logout: (_result, args, cache, info) => {
                    // MeQuery
                    betterUpdateQuery<LogoutMutation, MeQuery>(
                        cache,
                        { query: MeDocument },
                        _result,
                        () => ({ me: null })
                    ); // this should make listeners think that current user is null
                }
            },
        }
    }), 
    errorExchange,
    ssrExchange, 
    fetchExchange ],
})