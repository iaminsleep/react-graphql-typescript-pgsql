import * as React from 'react';

import { Formik, Form } from 'formik';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';

import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login(values);
                    if(response.data?.login.errors) // optional chaining allows to access deep nested properties 
                    {
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if(response.data?.login.user) {
                        // worked
                        if(typeof router.query.next === 'string') {
                            router.push(router.query.next); // if next path is set in router query
                        } else {            
                            router.push('/');
                        }
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="usernameOrEmail"
                            placeholder="username or email"
                            label="Username or Email"
                        />
                        <Box mt={4}>
                        <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                        />
                        </Box>
                        <Flex> 
                            <NextLink href="/forgot-password">
                                <Link mt={2} textDecoration='none' color="blue" ml="auto">
                                    Forgot Password?
                                </Link>
                            </NextLink>
                        </Flex>          
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={ isSubmitting }
                            color="white"
                            backgroundColor="teal"
                        >Login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(Login); // server-side rendering is not enabled because data here is static