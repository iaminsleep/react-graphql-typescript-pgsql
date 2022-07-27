// In Next.JS, whatever you name the file it will be the route for browser. For example, register.tsx is accessible by /register route;

import * as React from 'react';

import { Formik, Form } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';

import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={
                    { email: "", username: "", password: "" }
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
                            placeholder="email"
                            label="Email"
                        />
                        <Box mt={4}>
                        <InputField
                                name="username"
                                placeholder="username"
                                label="Username"
                        />
                        </Box>
                        <Box mt={4}>
                        <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                        />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={ isSubmitting }
                            color="white"
                            backgroundColor="teal"
                        >Register
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(Register); // wrap the page into urql