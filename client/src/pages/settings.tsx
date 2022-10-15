import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import * as React from 'react';
import { useMeQuery, useUpdateUserMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";
import { Form, Formik } from "formik";
import { toErrorMap } from "../utils/toErrorMap";
import { InputField } from "../components/InputField";
import { Button } from "@chakra-ui/react";
import Head from "next/head";
import { FileInput } from '../components/FileInput';
import { Layout } from "../components/Layout";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = ({}) => {
    const router = useRouter();

    const [isServerRendered, setIsServerRendered] = React.useState(false);
    React.useEffect(() => {
        if(isServer()) {
            setIsServerRendered(true);
        }
    })
    const [ meData ] = useMeQuery({
        pause: isServerRendered, // if you don't want to run query on the server
    }); // so, the logout mutation cache update in _app.tsx makes it very convinient to delete username from everywhere, because MeQuery reusult will be equal to null

    React.useEffect(() => {
        const userId = parseInt(router?.query?.userId as string);
        
        if(meData?.data?.me?.id !== userId) {
            router.push('/');
        } //some sort of middleware
    });

    const [, updateUser] = useUpdateUserMutation();

    const [createObjectURL, setCreateObjectURL] = React.useState('');
    const [showImage, setShowImage] = React.useState(true);

    const [isModalOpen, setModalOpen] = React.useState(false);
    const openModal = () => {
        setModalOpen(true);
    }

    const Image = ({ src, alt, fallback }: any) => {
        const [error, setError] = React.useState(false);

        const onError = () => {
            setError(true);
        };

        return error 
            ? fallback 
            : <img className="avatar avatar-profile" src={src} alt={alt} onError={onError} />;
    };
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
                <title>Settings</title>
            </Head>
            <Formik
                initialValues={{ 
                    username: meData?.data?.me?.username,
                    email: meData?.data?.me?.email, 
                    password: "",
                }}
                onSubmit={async (values, { setErrors, resetForm }) => {
                    const response = await updateUser(values);
                    if(response.data?.updateUser.errors) // optional chaining allows to access deep nested properties 
                    {
                        setErrors(toErrorMap(response.data.updateUser.errors));
                    } else if(response.data?.updateUser.user) {
                        // worked
                        resetForm({});
                        router.back();
                    }
                }
            }>
                {({ isSubmitting, setFieldValue }) => (
                    <Form className="tweet-form">
                        <div className="tweet-form__wrapper_inputs alignCenter">
                            { meData?.data?.me?.avatar
                                ?   <>
                                        <a 
                                            href={`${process.env.PUBLIC_URL}/img/avatar/${meData?.data?.me?.avatar}`}
                                            target="_blank"
                                        >
                                            { showImage 
                                                ?   <Image 
                                                        fallback={
                                                            <img className="avatar avatar-profile" src={createObjectURL ? createObjectURL : `${process.env.PUBLIC_URL}/img/no_avatar.png`} alt="no_image"/>
                                                        } 
                                                        src={`${createObjectURL ?? process.env.PUBLIC_URL}/img/avatar/${meData?.data?.me?.avatar}`}
                                                    />
                                                : <img className="avatar avatar-profile" src={createObjectURL ? createObjectURL : `${process.env.PUBLIC_URL}/img/no_avatar.png`} alt="no_image"/>
                                            }
                                        </a>
                                    </>
                                :   
                                    createObjectURL
                                    ?   <>
                                            <a href={createObjectURL} target="_blank">
                                                <img className="avatar avatar-profile" src={createObjectURL}/>
                                            </a>
                                        </>
                                    :   <div>
                                            <img 
                                                className="avatar avatar-profile" 
                                                src={createObjectURL ? createObjectURL : `${process.env.PUBLIC_URL}/img/no_avatar.png`} 
                                                alt="no_image"
                                            />
                                        </div>
                                    
                            }
                            <div className="join-time marginTopBottom">
                                <button className="tweet-img__btn cursor-default" type="button">
                                    <FileInput className="opacity-zero width-fifty-px" name="file" type="file" value={undefined}
                                        onChange={
                                            (e: any) => { 
                                                createPreviewImage(e);
                                                setFieldValue("file", e!.target!.files![0]);
                                            }
                                    }/>
                                </button>
                                {   createObjectURL
                                    ?   <div className="alignCenter">
                                            <button 
                                                onClick={() => {
                                                    setCreateObjectURL(''); 
                                                    setFieldValue("file", null);
                                                }} 
                                                className="tweet__delete-button chest-icon"
                                                title="Delete this photo"
                                            />
                                            <p>Delete the photo</p>
                                        </div>
                                    : meData?.data?.me?.avatar
                                        ?   <div className="alignCenter">
                                                <button 
                                                    onClick={(e) => { 
                                                        e.preventDefault(); 
                                                        setFieldValue("file", null);
                                                        setShowImage(false);
                                                    }} 
                                                    className="tweet__delete-button chest-icon"
                                                    title="Delete this photo"
                                                />
                                                <p>Delete the photo</p>
                                            </div>
                                    : null
                                }
                            </div>
                            <InputField
                                type="text"
                                className="tweet-form__input"
                                placeholder="Username"
                                name="username"
                                autoComplete="off"
                            />
                            <InputField
                                type="text"
                                className="tweet-form__input"
                                placeholder="Email"
                                name="email"
                                autoComplete="off"
                            />
                            <InputField
                                type="password"
                                className="tweet-form__input"
                                placeholder="Password confirmation"
                                required
                                name="password"
                                autoComplete="off"
                            />
                            <div className="tweet-form__btns_center marginTopGap">
                                <Button
                                    type="button"
                                    className="tweet-form__btn_center"
                                    onClick={() => { router.back() }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    isLoading={ isSubmitting }
                                    type="submit"
                                    className="tweet-form__btn_center"
                                >
                                    Confirm changes
                                </Button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(Settings); // wrap the page into urql