import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { useGetPostsQuery } from "../generated/graphql";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { useState } from 'react';
import NextLink from 'next/link';
import { UpvoteSection } from '../components/UpvoteSection';
import { Link } from '@chakra-ui/react';
import { PostButtons } from '../components/PostButtons';

const Index = () => {
  const [variables, setVariables] = useState({ 
    limit: 15, cursor: null as null | string 
  });

  const [{data, error, fetching }] = useGetPostsQuery({
    variables,
  });
  

  if(!fetching && !data && !error) {
    return <div>There are no posts yet</div>;
  }

  if(error) {
    return <div>{error?.message}</div>;
  }

  return (
    <Layout>
      {/* if data is true, the posts are going to show. */}
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((post) => // ! exclamation point tells us that data variable is definitely going to have data
          !post ? null : // some posts may be null, so we use this to not show already deleted post, otherwise they throw an error. it is used for invalidating cache
          ( 
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <UpvoteSection post={post}/>
              <Box flex={1}>
                <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                  <Link>
                    <Heading fontSize="xl">
                      {post.title}
                    </Heading>
                  </Link>
                </NextLink>
                <Text>posted by {post.creator.username}</Text>
                <Flex align="center">
                  <Text flex={1} mt={4}>
                    {post.textSnippet}...
                  </Text>
                  <Box ml="auto">
                    <PostButtons 
                      postId={post.id} 
                      creatorId={post.creator.id}
                    />
                  </Box>
                </Flex>
              </Box>       
            </Flex>
          ))}
        </Stack>    
      )}
      { data && data.posts.hasMore ? ( 
        <Flex>
          <Button onClick={() => { setVariables(
            { 
              limit: variables.limit, 
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
            })
          }} isLoading={fetching} m="auto" my={8}>
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index) // { ssr: true } enables server-side-rendering. The rule for server-side rendering is using it only for pages that needs to be found by Google + if it contains dynamic data. That means that login or register page does not contain any dynamic data, but the index page has (posts). Not every page needs this.
