// folder/[filename].tsx === route/queryname=value

import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { Layout } from "../../components/Layout";
import { PostButtons } from "../../components/PostButtons";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

export const Post = ({}) => {
    const [{ data, fetching }] = useGetPostFromUrl();

    if(fetching) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        )
    }
    // after fetching show if post is not found
    if(!data?.post) { 
        return (
            <Layout>
                <Box>Could not find post</Box>
            </Layout>
        )
    }

    return (
        <Layout>
            <Heading>{data?.post?.title}</Heading>
            <Box>{data?.post?.text}</Box>
            <Box>
                <PostButtons 
                    postId={data?.post?.id} 
                    creatorId={data?.post?.creator.id}
                />
            </Box>
        </Layout>
    );
}

// ChangePassword.getInitialProps = ({query}) => { // get any query parameters and pass to original function
//     return {
//         token: query.token as string // cast token as string
//     } another way instead of using 'router.query.token'
// }

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);