import { Button, FormControl } from '@chakra-ui/react';
import { Form, Formik, useField } from 'formik';
import { useRouter } from 'next/router';
import { MeQuery, useCreatePostMutation, useUploadFileMutation } from '../generated/graphql';
import { TextareaInput } from './TextareaInput';

interface TweetFormProps {
    authUserData?: MeQuery
}

export const TweetForm: React.FC<TweetFormProps> = ({ authUserData }) => {
    const router = useRouter();

    const [, createPost] = useCreatePostMutation();
    const [, uploadFile] = useUploadFileMutation();

    const handleFileChange = (e: React.ChangeEvent<any>) => {
        const file = e.target.files[0];
        console.log(file);
        if(!file) return false;
        uploadFile({ file: file });
    }

    // type FileProps = { 
    //     type: string;
    //     name: string;
    //     value: File
    // }

    // const FileInput: React.FC<FileProps> = ({ ...props }) => {
    //     const [field] = useField(props);
    //     return (
    //         <>
    //             <input
    //                 { ...field}
    //                 {...props}
    //                 id={field.name}
    //                 onChange={handleFileChange}
    //             />
    //         </>
    //     );
    // };

    return(
        <section className="wrapper">
            <Formik
                initialValues={{ text: "" }}
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
                        <Button 
                            isLoading={ isSubmitting } 
                            className="tweet-form__btn" 
                            type="submit"
                        >
                            Tweet
                        </Button>
                    </div>
                </Form>
            )}
            </Formik>
        </section>
    );
}