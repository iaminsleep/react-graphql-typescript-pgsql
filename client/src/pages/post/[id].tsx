// folder/[filename].tsx === route/queryname=value

import { Box } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import { useState } from "react";
import { AuthModal } from "../../components/AuthModal";
import { Layout } from "../../components/Layout";
import { TweetPage } from "../../components/TweetPage";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

export const Post = ({}) => {
    const [{ data, fetching }] = useGetPostFromUrl();

    const [isModalOpen, setModalOpen] = useState(false);
    const openModal = () => {
        setModalOpen(true);
    }
    const closeModal = () => {
        setModalOpen(false);
    }
    
    if(fetching) {
        return (
            <Layout openModal={openModal}>
                <div>Loading...</div>
            </Layout>
        )
    }
    // after fetching show if post is not found
    if(!data?.post) { 
        return (
            <Layout openModal={openModal}>
                <Box>Could not find post</Box>
            </Layout>
        )
    }

    return (
        <Layout openModal={openModal}>
            <Head>
                <title>{ data?.post.creator.username ?? data?.post.creator.login }'s post</title>
            </Head>
            <TweetPage key={data?.post.id} post={data?.post} openModal={openModal}/>
            { isModalOpen 
                ? <AuthModal closeModal={closeModal}></AuthModal>
                : ''
            }
        </Layout>
    );
}

// ChangePassword.getInitialProps = ({query}) => { // get any query parameters and pass to original function
//     return {
//         token: query.token as string // cast token as string
//     } another way instead of using 'router.query.token'
// }

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);