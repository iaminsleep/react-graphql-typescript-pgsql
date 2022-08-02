import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { useGetPostsQuery } from "../generated/graphql";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { useState } from 'react';

const Index = () => {
  const [variables, setVariables] = useState({ 
    limit: 15, cursor: null as null | string 
  });

  const [{data, fetching }] = useGetPostsQuery({
    variables,
  });

  if(!fetching && !data) {
    return <div>There are no posts yet</div>;
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading mb={5}>Twitter</Heading>
      </Flex>
      {/* if data is true, the posts are going to show. */}
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((post) => ( // ! exclamation point tells us that data variable is definitely going to have data
            <Box key={post.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text>posted by {post.creator.username}</Text>
              <Text mt={4}>{post.textSnippet}...</Text>
            </Box>
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
