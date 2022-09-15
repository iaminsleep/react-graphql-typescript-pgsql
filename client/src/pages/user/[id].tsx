import { Box, Button, Flex } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AuthModal } from "../../components/AuthModal";
import { Layout } from "../../components/Layout";
import { Tweet } from "../../components/Tweet";
import { TweetForm } from "../../components/TweetForm";
import { useGetPostsQuery, useMeQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { isServer } from "../../utils/isServer";
import { useGetUserFromUrl } from "../../utils/useGetUserFromUrl";

export const User = ({}) => {
    const router = useRouter();
    const { searchBy } = router.query;

    const [{ data, fetching }] = useGetUserFromUrl();

    const [variables, setVariables] = useState({ 
        limit: 15, cursor: null as null | string | undefined, searchBy: searchBy as string | null, userId: data?.user?.id as number
    });

    const [ postData ] = useGetPostsQuery({
        variables,
    });

    const [isModalOpen, setModalOpen] = useState(false);
    const openModal = () => {
        setModalOpen(true);
    }
    const closeModal = () => {
        setModalOpen(false);
    }

    const [isServerRendered, setIsServerRendered] = useState(false);
    useEffect(() => {
        if(isServer()) {
            setIsServerRendered(true);
        }
    })

    const [ meData ] = useMeQuery({
        pause: isServerRendered, // if you don't want to run query on the server
    }); // so, the logout mutation cache update in _app.tsx makes it very convinient to delete username from everywhere, because MeQuery reusult will be equal to null
    
    if(fetching) {
        return (
            <Layout openModal={openModal}>
                <div>Loading...</div>
            </Layout>
        )
    }
    if(!data?.user) { 
        return (
            <Layout openModal={openModal}>
                <Box>Could not find user</Box>
            </Layout>
        )
    }

    console.log(postData.data?.posts.posts)

    return (
        <Layout openModal={openModal}>
            <div className="">
                <img
                    className="avatar"
                    src={ data.user.avatar ? "img/avatar.png" : "img/no_avatar.png"}
                    alt={`${data.user.login}'s avatar`}
                />
                <button></button>
                <h2>{data.user.username}</h2>
                <h3>{data.user.login}</h3>
                <div><p>{data.user.createdAt}</p></div>
            </div>
            <Head>
                <title>Twitter</title>
            </Head>
            { meData?.data?.me
                ? <TweetForm authUserData={data}/>
                : null
            }
            {/* if data is true, the posts are going to show. */}
            {!postData.data && postData.fetching ? (
                <div>Loading...</div>
            ) : (
                <ul className="tweet-list">
                {postData.data?.posts.posts?.map((post) => // ! exclamation point tells us that data variable is definitely going to have data
                    !post 
                    ? null 
                    : // some posts may be null, so we use this to not show already deleted post, otherwise they throw an error. it is used for invalidating cache
                ( 
                    <Tweet key={post.id} post={post} openModal={openModal}></Tweet>
                ))}
                </ul>    
            )}
            { postData.data && postData.data?.posts.hasMore ? ( 
                <Flex>
                <Button onClick={() => { setVariables(
                    { 
                        limit: variables.limit, 
                        cursor: postData.data?.posts.posts[postData.data?.posts.posts.length - 1].createdAt,
                        searchBy: searchBy as string | null,
                        userId: data!.user!.id
                    })
                }} isLoading={postData.fetching} m="auto" my={8}>
                    Load more
                </Button>
                </Flex>
            ) : null}
            { isModalOpen 
                ? <AuthModal closeModal={closeModal}></AuthModal>
                : ''
            }
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(User);