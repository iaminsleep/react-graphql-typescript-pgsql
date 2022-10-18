// In Next.JS, whatever you name the file it will be the route for browser. For example, register.tsx is accessible by /register route;

import * as React from 'react';

import { Formik, Form } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import { InputField } from '../components/InputField';
import { Layout } from "../components/Layout";

import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import Head from 'next/head';
import { AuthModal } from '../components/AuthModal';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();

    const [isModalOpen, setModalOpen] = React.useState(false);
    const openModal = () => {
        setModalOpen(true);
    }
    const closeModal = () => {
        setModalOpen(false);
    }

    return (
        <Layout openModal={openModal}>
            <Head>
                <title>Twitter</title>
            </Head>
            <div className="paddingeighty">
                <h2 className="tweet-form__title">Welcome to Twitter</h2>
                <div className="tweet-form__subtitle">
                    If you are already registered,&nbsp;
                    <button className="link-pswd" onClick={() => {
                        openModal();
                    }}>login</button>
                </div>
                <Formik
                    initialValues={
                        { email: "", login: "", password: "" }
                    }
                    onSubmit={async (values, { setErrors }) => {
                        const response = await register({
                            options: values
                        }); // onSubmitting variable doesn't change because promise is not returned. That's why it is infinitely spinning, so adding 'return' before function name solves the issue
                        if(response.data?.register.errors) // optional chaining allows to access deep nested properties 
                        {
                            setErrors(toErrorMap(response.data.register.errors));
                        } else if(response.data?.register.user) {
                            // worked
                            router.push('/');
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name="email"
                                placeholder="Email"
                                className="tweet-form__input"
                            />
                            <Box mt={4}>
                            <InputField
                                name="login"
                                placeholder="Login"
                                className="tweet-form__input"
                            />
                            </Box>
                            <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="Password"
                                type="password"
                                className="tweet-form__input"
                            />
                            </Box>
                            <Button
                                mt={4}
                                type="submit"
                                isLoading={ isSubmitting }
                                className="tweet-form__btn_center"
                            >Register
                            </Button>
                        </Form>
                    )}
                </Formik>
                { isModalOpen 
                    ? <AuthModal closeModal={closeModal}></AuthModal>
                    : ''
                }
            </div>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(Register); // wrap the page into urql