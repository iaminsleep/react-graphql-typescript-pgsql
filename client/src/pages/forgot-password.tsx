import * as React from 'react';

import { Formik, Form } from 'formik';
import { Box, Button, Link } from '@chakra-ui/react';
import { InputField } from '../components/InputField';

import { useForgotPasswordMutation } from '../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Layout } from '../components/Layout';
import Head from 'next/head';
import { AuthModal } from '../components/AuthModal';

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
    const [received, setReceived] = React.useState(false);
    const [notReceived, setNotReceived] = React.useState(false);
    const [url, setUrl] = React.useState('');
    const [, sendResetPasswordLink] = useForgotPasswordMutation();

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
                <title>Reset Password</title>
            </Head>
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    const response = await sendResetPasswordLink(values);
                    if (response.data?.forgotPassword.url) {
                        setUrl(response.data?.forgotPassword.url);
                        setReceived(true);
                    } else {
                        setNotReceived(true);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    received ? (
                        <Box display="flex" flexDirection="column" alignItems="center" margin="50px">
                            <Box width="250px">
                                <img src={`${process.env.PUBLIC_URL}/img/email.png`}/>
                            </Box>
                            <Box textAlign="center" paddingBottom="50px" paddingTop="50px">
                                Congratulations! You've received an email. Please, click on the link down below to view it.
                            </Box>
                            <Link textAlign="center" href={url} target="_blank" className="link-pswd">
                                { url }
                            </Link>
                        </Box>
                    ) :
                    notReceived ? (
                        <Box display="flex" flexDirection="column" alignItems="center" margin="50px">
                            <Box width="250px">
                                <img src={`${process.env.PUBLIC_URL}/img/email_not_available.png`}/>
                            </Box>
                            <Box textAlign="center" paddingBottom="50px" paddingTop="50px">
                                Sorry :(! We did not find your email in the database. Please, check if you've typed the email correctly.
                            </Box>
                            <Link onClick={() => setNotReceived(false)} className="link-pswd">
                                Try again
                            </Link>
                        </Box>
                    ) 
                    : (
                        <Form className="tweet-form padding-150">
                            <InputField
                                name="email"
                                className="tweet-form__input"
                                placeholder="email@example.com"
                                type="email"
                            />    
                            <div className="tweet-form__btns_center">
                                <Button
                                    mt={4}
                                    type="submit"
                                    isLoading={ isSubmitting }
                                    className="tweet-form__btn_center"
                                >Reset Password
                                </Button>
                            </div>
                        </Form>
                    )   
                )}
            </Formik>
            { isModalOpen 
                ? <AuthModal closeModal={closeModal}></AuthModal>
                : ''
            }
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword); // server-side rendering is not enabled because data here is static