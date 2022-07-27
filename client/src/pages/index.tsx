import { NavBar } from "../components/NavBar"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { useGetPostsQuery } from "../generated/graphql";
import { Box } from "@chakra-ui/react";

const Index = () => {
  const [{data}] = useGetPostsQuery();
  return (
    <>
      <NavBar/>
      {/* if data is true, the posts are going to show. */}
      {!data ? (
        <div>Loading...</div>
      ) : data.posts.map((post) => 
          <div key={post.id}>{post.title}</div>
        )
      }
      <Box>Hello World</Box>
    </>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index) // { ssr: true } enables server-side-rendering. The rule for server-side rendering is using it only for pages that needs to be found by Google + if it contains dynamic data. That means that login or register page does not contain any dynamic data, but the index page has (posts). Not every page needs this.
