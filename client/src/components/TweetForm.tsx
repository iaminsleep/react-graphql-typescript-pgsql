import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { MeQuery, useCreatePostMutation } from '../generated/graphql';
import { TextareaInput } from './TextareaInput';
import { FileInput } from './FileInput';

interface TweetFormProps {
    authUserData?: MeQuery
}

export const TweetForm: React.FC<TweetFormProps> = ({ authUserData }) => {
    const router = useRouter();

    const [ , createPost ] = useCreatePostMutation();

    const [createObjectURL, setCreateObjectURL] = useState('');

    const createPreviewImage = (e: React.ChangeEvent<any>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if(!file) return false;

            setCreateObjectURL(URL.createObjectURL(file));

            return file;
        }
    }

    return(
        <section className="wrapper">
            <Formik
                enableReinitialize={true}
                initialValues={{ text: "", file: null }}
                onSubmit={async (values, { resetForm }) => {
                    await createPost({ 
                        text: values.text, 
                        file: values.file
                    });
                    resetForm({});
                    setCreateObjectURL('');
                    router.push('/');
                }}
            >
            {({ isSubmitting, setFieldValue }) => (
                <Form className="tweet-form">
                    <div className="tweet-form__wrapper">
                        <img
                            className="avatar"
                            src={ authUserData?.me?.avatar
                                ? `${process.env.PUBLIC_URL}/img/avatar/${authUserData?.me?.avatar}`
                                : `${process.env.PUBLIC_URL}/img/no_avatar.png`
                            }
                            alt="Avatar"
                        />
                        <TextareaInput
                            className="tweet-form__text margin-left-twenty"
                            name="text"
                            rows={Number("4")}
                            placeholder="What is happening?"
                            required
                        />
                    </div>
                    <div className="tweet-form__btns">
                        <button className="tweet-img__btn cursor-default" type="button">
                            <FileInput className="opacity-zero" name="file" type="file" value={undefined} onChange={
                                (e: any) => { 
                                    createPreviewImage(e); 
                                    setFieldValue("file", e!.target!.files![0]);
                                }
                            }/>
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