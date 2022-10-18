// this way of naming files is the tsx solution for variable in url. in the brackets [token] token is the name of variable. If you noticed, in the browser search /token=token is not dipslayed, instead it's just /token. The only reason it works is becuase we told Next.JS the token name - [token]

import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { AuthModal } from "../../components/AuthModal";
import { InputField } from "../../components/InputField";
import { Layout } from "../../components/Layout";
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

export const ChangePassword: NextPage<{token: string}> = () => {
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState('');
    
    const [isModalOpen, setModalOpen] = useState(false);
    const openModal = () => {
        setModalOpen(true);
    }
    const closeModal = () => {
        setModalOpen(false);
    }

    return (
        <Layout openModal={openModal}>
            <Head>
                <title>New Password</title>
            </Head>
            <Formik
                initialValues={{ newPassword: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({token: typeof router.query.token === 'string' ? router.query.token : '', newPassword: values.newPassword });
                    if(response.data?.changePassword.errors) // optional chaining allows to access deep nested properties 
                    {
                        const errorMap = toErrorMap(response.data.changePassword.errors);
                        if('token' in errorMap) {
                            setTokenError(errorMap.token); // set error message for token
                        }
                        setErrors(errorMap);
                    } else if(response.data?.changePassword.user) {
                        // worked
                        router.push('/');
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="tweet-form padding-150">
                        <InputField
                            name="newPassword"
                            className="tweet-form__input"
                            placeholder="New Password"
                            type="password"
                        />
                        { tokenError 
                        ? <Box color='red'>{tokenError}</Box> 
                        : null }
                        <div className="tweet-form__btns_center">
                            <Button
                                mt={4}
                                type="submit"
                                isLoading={ isSubmitting }
                                className="tweet-form__btn_center"
                            >Change Password
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

export default withUrqlClient(createUrqlClient)(ChangePassword);