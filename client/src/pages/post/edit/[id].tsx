// folder/[filename].tsx === route/queryname=value

import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

export const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();

    const [{ data, fetching }] = useGetPostFromUrl();
    const [, updatePost ] = useUpdatePostMutation();

    // note: incapsulate this logic in separate file
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
        <Layout variant="small">
            <Formik
                initialValues={{ 
                    title: data.post.title, 
                    text: data.post.text }
                }
                onSubmit={async (values) => {
                    const { error } = await updatePost(
                        {id: intId, ...values}
                    );
                    if(!error) router.push('/');
                    // router.back();
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="title"
                            placeholder="title"
                            label="Title"
                        />
                        <Box mt={4}>
                            <InputField
                                name="text"
                                placeholder="text..."
                            />
                        </Box>      
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={ isSubmitting }
                            color="white"
                            backgroundColor="teal"
                        >Update Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
} 

export default withUrqlClient(createUrqlClient)(EditPost);