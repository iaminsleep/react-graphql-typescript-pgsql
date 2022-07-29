import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, Exchange, fetchExchange } from "urql";
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

/** Create URQL client */
export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:8080/graphql",
    fetchOptions: {
        credentials: "include" as const // we need this to get cookies. credentaisl were readonly so we converted it to const
    },
    exchanges: [dedupExchange, cacheExchange({
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