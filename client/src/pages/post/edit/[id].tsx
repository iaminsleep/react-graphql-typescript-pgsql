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
import { FileInput } from '../../../components/FileInput';
import Head from 'next/head';

export const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const [createObjectURL, setCreateObjectURL] = useState('');
    const [showImage, setShowImage] = useState(true);

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

    const createPreviewImage = (e: React.ChangeEvent<any>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if(!file) return false;

            setCreateObjectURL(URL.createObjectURL(file));

            return file;
        }
    }
    
    return (
        <Layout openModal={openModal}>
            <Head>
                <title>Edit your post</title>
            </Head>
            <Formik
                initialValues={{ 
                    text: data.post.text,
                }}
                onSubmit={async (values, { resetForm }) => {
                    const { error } = await updatePost(
                        {id: intId, ...values}
                    );
                    if(!error) { 
                        router.back();
                        resetForm({});
                    }
                }}
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form>
                        <div className="paddingeighty">
                            <h2 className="tweet-form__title">Edit Post</h2>
                            <Box mt={4} display="flex" flexDirection="column" margin="0 auto">
                                <TextareaInput
                                    className="tweet-form__text margin-left-twenty"
                                    name="text"
                                    rows={Number("4")}
                                    placeholder="What is happening?"
                                    required
                                />
                                { data!.post!.image
                                    ?   <>
                                            <a 
                                                href={`${process.env.PUBLIC_URL}/img/post/${data!.post!.image}`} 
                                                className="margin-left-twenty margin-top-twenty" 
                                                target="_blank"
                                            >
                                                { showImage 
                                                    ?   <Image 
                                                            fallback={
                                                                <img src={createObjectURL ? createObjectURL : `${process.env.PUBLIC_URL}/img/no_image.jpg`} alt="no_image"/>
                                                            } 
                                                            src={`${createObjectURL ?? process.env.PUBLIC_URL}/img/post/${data!.post!.image}`}
                                                        />
                                                    : null
                                                }
                                            </a>
                                            <button 
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    setFieldValue("file", null);
                                                    setShowImage(false);
                                                }} 
                                                className="tweet__delete-button chest-icon"
                                            />
                                        </>
                                    :   
                                        createObjectURL
                                        ?   <>
                                                <a className="margin-left-twenty margin-top-twenty" href={createObjectURL} target="_blank">
                                                    <img src={createObjectURL}/>
                                                </a>
                                                <button 
                                                    onClick={() => setCreateObjectURL('')} 
                                                    className="tweet__delete-button chest-icon"
                                                />
                                            </>
                                        :   null
                                        
                                }
                                <button className="tweet-img__btn cursor-default margin-left-twenty margin-top-twenty" type="button">
                                    <FileInput className="opacity-zero" name="file" type="file" value={undefined} onChange={
                                        (e: any) => { 
                                            createPreviewImage(e); 
                                            setFieldValue("file", e!.target!.files![0]);
                                        }
                                    }/>
                                </button>
                            </Box>
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