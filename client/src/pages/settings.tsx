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
    const closeModal = () => {
        setModalOpen(false);
    }

    const Image = ({ src, alt, fallback }: any) => {
        const [error, setError] = React.useState(false);

        const onError = () => {
            setError(true);
        };

        return error ? fallback : <img src={src} alt={alt} onError={onError} />;
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
        <>
            <Formik
                initialValues={{ loginOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors, resetForm }) => {
                    // const response = await updateUser(values);
                    // if(response.data?.login.errors) // optional chaining allows to access deep nested properties 
                    // {
                    //     setErrors(toErrorMap(response.data.login.errors));
                    // } else if(response.data?.login.user) {
                    //     // worked
                    //     resetForm({});
                    // }
                }
            }>
                {({ isSubmitting }) => (
                    <Form className="tweet-form">
                        <div className="tweet-form__wrapper_inputs">
                            <InputField
                                type="text"
                                className="tweet-form__input"
                                placeholder="Login"
                                required
                                name="loginOrEmail"
                                autoComplete="off"
                            />
                            <InputField
                                type="password"
                                className="tweet-form__input"
                                placeholder="Password"
                                required
                                name="password"
                                autoComplete="off"
                            />
                        </div>
                        <div className="tweet-form__btns_center">
                            <Button
                                isLoading={ isSubmitting }
                                type="submit"
                                className="tweet-form__btn_center"
                            >
                                Login
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
            <div>
                <img
                    className="avatar avatar-profile"
                    src={ meData?.data?.me?.avatar 
                        ? `${process.env.PUBLIC_URL}/img/${meData?.data?.me?.avatar}` 
                        : `${process.env.PUBLIC_URL}/img/no_avatar.png`
                    }
                    alt={`${meData?.data?.me?.login}'s avatar`}
                />
            </div>
        </>
    );
}

export default withUrqlClient(createUrqlClient)(Settings); // wrap the page into urql