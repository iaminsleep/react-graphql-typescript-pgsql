import * as React from 'react';

import { Formik, Form } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';

import { useForgotPasswordMutation } from '../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
    const [complete, setComplete] = React.useState(false);
    const [, sendResetPasswordLink] = useForgotPasswordMutation();
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    await sendResetPasswordLink(values);
                    setComplete(true);
                }}
            >
                {({ isSubmitting }) => (
                    complete ? (
                        <Box>If an account with that email exists, we will sent you the reset link.</Box>
                    ) : (
                        <Form>
                            <InputField
                                    name="email"
                                    placeholder="email@example.com"
                                    label="Email"
                                    type="email"
                            />    
                            <Button
                                mt={4}
                                type="submit"
                                isLoading={ isSubmitting }
                                color="white"
                                backgroundColor="teal"
                            >Reset Password
                            </Button>
                        </Form>
                    )   
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword); // server-side rendering is not enabled because data here is static