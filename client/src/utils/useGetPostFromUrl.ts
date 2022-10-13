import { useGetPostQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => { // incapsulate getting post from query id logic here
    const intId = useGetIntId();
    
    return useGetPostQuery({
        pause: intId === -1, // pause the query if id is not valid or query is bad
        variables: {
            id: intId
        }
    })
}