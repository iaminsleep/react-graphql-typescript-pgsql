import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { useDeletePostMutation, useGetPostsQuery, useMeQuery } from "../generated/graphql";
import { Box, Button, Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { useState } from 'react';
import NextLink from 'next/link';
import { UpvoteSection } from '../components/UpvoteSection';
import { Link } from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

const Index = () => {
  const [variables, setVariables] = useState({ 
    limit: 15, cursor: null as null | string 
  });

  const [{ data: authUserData }] = useMeQuery();
  const [{data, fetching }] = useGetPostsQuery({
    variables,
  });
  const [, deletePost] = useDeletePostMutation();

  if(!fetching && !data) {
    return <div>There are no posts yet</div>;
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
                  {
                    authUserData?.me?.id !== post.creator.id ? null : (
                      <Box ml="auto">
                        <NextLink href='/post/edit/[id]' as={`/post/edit/${post.id}`}>
                          <IconButton as={Link}
                            mr={4}
                            aria-label="edit post" 
                            icon={<EditIcon/>}
                          />
                        </NextLink>
                        <IconButton 
                          aria-label="delete post" 
                          icon={<DeleteIcon/>}
                          onClick={ () => { 
                            deletePost({id: post.id})
                          }}
                        />
                      </Box>
                    )
                  }
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
