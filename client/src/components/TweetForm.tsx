import { Button, FormControl } from '@chakra-ui/react';
import { Form, Formik, useField } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { MeQuery, useCreatePostMutation, useUploadFileMutation } from '../generated/graphql';
import { TextareaInput } from './TextareaInput';

interface TweetFormProps {
    authUserData?: MeQuery
}

export const TweetForm: React.FC<TweetFormProps> = ({ authUserData }) => {
    const router = useRouter();

    const [, createPost] = useCreatePostMutation();
    const [, uploadFile] = useUploadFileMutation();

    const [image, setImage] = useState('');
    const [createObjectURL, setCreateObjectURL] = useState('');

    const uploadToClient = (e: React.ChangeEvent<any>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // const reader = new FileReader();
            // reader.readAsDataURL(file);
            // reader.onloadend = function () {
            // const base64String = reader.result as string;

            // setImage(base64String);

            setImage(file);
            console.log(file);

            uploadFile({ file: file });
            
            setCreateObjectURL(URL.createObjectURL(file));
        }
        // if(!file) return false;
        // uploadFile({ file: file });
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
                            <input className="opacity-zero" name="image" type="file" onChange={uploadToClient}/>
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