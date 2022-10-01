// folder/[filename].tsx === route/queryname=value
import React from 'react';
import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";
import { AuthModal } from '../../../components/AuthModal';
import { TextareaInput } from '../../../components/TextareaInput';
import { useState } from 'react'; 

export const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();

    const [{ data, fetching }] = useGetPostFromUrl();
    const [, updatePost ] = useUpdatePostMutation();

    const Image = ({ src, alt, fallback }: any) => {
        const [error, setError] = useState(false);

        const onError = () => {
            setError(true);
        };

        return error ? fallback : <img src={src} alt={alt} onError={onError} />;
    };

    const [isModalOpen, setModalOpen] = React.useState(false);
    const openModal = () => {
        setModalOpen(true);
    }
    const closeModal = () => {
        setModalOpen(false);
    }
    
    // note: incapsulate this logic in separate file
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
            <Formik
                initialValues={{ 
                    text: data.post.text,
                    image: data.post.image
                }}
                onSubmit={async (values) => {
                    const { error } = await updatePost(
                        {id: intId, ...values}
                    );
                    if(!error) router.push('/');
                    router.back();
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className="paddingeighty">
                            <h2 className="tweet-form__title">Edit Post</h2>
                            <Box mt={4} display="flex" margin="0 auto">
                                <TextareaInput
                                    className="tweet-form__text"
                                    name="text"
                                    rows={Number("4")}
                                    placeholder="What is happening?"
                                    required
                                />
                            </Box>
                            { data!.post!.image
                                ?   <a href={`${process.env.PUBLIC_URL}/img/post/${data!.post!.image}`} target="_blank">
                                            <Image 
                                                fallback={
                                                    <img src={`${process.env.PUBLIC_URL}/img/no_image.jpg`} alt="no_image"/>
                                                } 
                                                src={`${process.env.PUBLIC_URL}/img/post/${data!.post!.image}`}
                                            />
                                    </a>
                                : null
                            }
                            <Button
                                mt={4}
                                type="submit"
                                isLoading={ isSubmitting }
                                className="tweet-form__btn_center"
                            >Update Post
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        { isModalOpen 
            ? <AuthModal closeModal={closeModal}></AuthModal>
            : ''
        }
        </Layout>
    );
} 

export default withUrqlClient(createUrqlClient)(EditPost);