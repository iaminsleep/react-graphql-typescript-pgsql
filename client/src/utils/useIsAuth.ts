import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const [{ data, fetching }] = useMeQuery();
    const router = useRouter();
    useEffect(() => {
        if(!fetching && !data?.me) {
            router.replace("/register?next=" + router.pathname); // tell the router where should user be redirected after he logs in (last page)
        }
    }, [ fetching, data, router ]);
}