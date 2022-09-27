import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { MeQuery, useCreatePostMutation, useUploadFileMutation } from '../generated/graphql';
import { TextareaInput } from './TextareaInput';
import { gql, useMutation } from "@apollo/client";

const MUTATION = gql`
    mutation ($file: Upload!) {
        uploadFile(file: $file) {
            newFilename
        }
    }
`;

interface TweetFormProps {
    authUserData?: MeQuery
}

export const TweetForm: React.FC<TweetFormProps> = ({ authUserData }) => {
    const router = useRouter();

    const [mutate] = useMutation(MUTATION);
    const [, createPost] = useCreatePostMutation();

    const [image, setImage] = useState('');
    const [createObjectURL, setCreateObjectURL] = useState('');

    const uploadToClient = (e: React.ChangeEvent<any>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if(!file) return false;

            try {
                mutate({ 
                    variables: { file },
                    context: { 
                        headers: { 'apollo-require-preflight': true, }
                    }
                }).then((response) => {
                    const newFilename = response!.data!.uploadFile.newFilename
                    setImage(newFilename);
                }).catch(errors => { console.log(errors) });
            } catch(err) {
                console.log(err);
            }

            setCreateObjectURL(URL.createObjectURL(file));
        }
    }

    return(
        <section className="wrapper">
            <Formik
                enableReinitialize={true}
                initialValues={{ text: "", image: image }}
                onSubmit={async (values, { resetForm }) => {
                    const {error} = await createPost(
                        { input: values }
                    );
                    resetForm({});
                    if(!error) router.push('/');
                }}
            >
            {({ isSubmitting }) => (
                <Form className="tweet-form">
                    <div className="tweet-form__wrapper">
                        <img
                            className="avatar"
                            src={ authUserData?.me 
                                ? `${process.env.PUBLIC_URL}/img/no_avatar.png`
                                : `${process.env.PUBLIC_URL}/img/no_avatar.png`
                            }
                            alt="Avatar"
                        />
                        <TextareaInput
                            className="tweet-form__text"
                            name="text"
                            rows={Number("4")}
                            placeholder="What is happening?"
                            required
                        />
                    </div>
                    <div className="tweet-form__btns">
                        <button className="tweet-img__btn cursor-default" type="button">
                            <input className="opacity-zero" type="file" onChange={uploadToClient}/>
                        </button>
                        <Button 
                            isLoading={ isSubmitting } 
                            className="tweet-form__btn" 
                            type="submit"
                        >
                            Tweet
                        </Button>
                    </div>
                    {
                        createObjectURL
                        ?   <a href={createObjectURL} target="_blank">
                                <img className="img-preview" src={createObjectURL}/>
                            </a>
                        :   null
                    }
                </Form>
            )}
            </Formik>
        </section>
    );
}