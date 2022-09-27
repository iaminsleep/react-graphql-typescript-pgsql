import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from "urql";
import { DeletePostMutationVariables, LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, LikeMutationVariables } from "../generated/graphql";
import { betterUpdateQuery } from './betterUpdateQuery';
import { pipe, tap } from 'wonka';
import Router from "next/router";
import gql from 'graphql-tag';
import { isServer } from "./isServer";

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
  };
};

function invalidateAllPosts(cache: Cache) {
    // invalidate the cache and re-render from the server
    const allFields = cache.inspectFields('Query');
    const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
    fieldInfos.forEach((fieldInfo) => {
        cache.invalidate(
            'Query', 
            'posts', 
            fieldInfo.arguments || {}
        ); // specify the query cache we want to invalidate, if this field is found server re-fetches values
    })
}

/** Create URQL client */
export const createUrqlClient = (ssrExchange: any, ctx: any): any => {
    let userIdCookie: string | null = null;
    // this code will run only on the server
    if(isServer()) {
        userIdCookie = ctx?.req?.cookies?.qid;
    }
    return {
        url: "http://localhost:8080/graphql",
        fetchOptions: {
            credentials: "include", // we need this to get cookies. credentaisl were readonly so we converted it to const
            headers: {
                Cookie: userIdCookie 
                    ? 'qid='+userIdCookie 
                    : undefined
            },
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
                    deletePost: (_result, args, cache, info) => {
                        cache.invalidate({ 
                            __typename: "Post",
                            id: (args as DeletePostMutationVariables).id,
                        })
                    },
                    like: (_result, args, cache, info) => {
                        /** this is an alternative method to update data without reloading. in this case, we're not updating the cache, we change values iniside the graphql cache */
                        const { postId } = args as LikeMutationVariables;
                        const data = cache.readFragment(
                            gql `
                                fragment respData on Post {
                                    id
                                    likes_count
                                    voteStatus
                                }
                            `, { id: postId } as any
                        ); // read the graphql fragment
                        if(data) {
                            if(data.voteStatus === 0) {
                                const newPoints = (data.likes_count as number) + 1;
                                cache.writeFragment(
                                    gql `
                                        fragment rewrCache on Post {
                                            likes_count
                                            voteStatus
                                        }
                                    `, { id: postId, likes_count: newPoints, voteStatus: 1 } as any
                                ); // update graphql fragment
                            } else if(data.voteStatus === 1) {
                                const newPoints = (data.likes_count as number) - 1;
                                cache.writeFragment(
                                    gql `
                                        fragment rewrCache on Post {
                                            likes_count
                                            voteStatus
                                        }
                                    `, { id: postId, likes_count: newPoints, voteStatus: 0 } as any
                                );
                            }
                        }
                    },
                    createPost: (_result, args, cache, info) => {
                        invalidateAllPosts(cache);
                    },
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
                        );
                        invalidateAllPosts(cache);
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
    }
}