// this way of naming files is the tsx solution for variable in url. in the brackets [token] token is the name of variable

import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

export const ChangePassword: NextPage<{token: string}> = ({token}) => {
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState('');
    
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ newPassword: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({token, newPassword: values.newPassword });
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
                    <Form>
                        <InputField
                            name="newPassword"
                            placeholder="new password"
                            label="New Password"
                            type="password"
                        />
                        { tokenError 
                        ? <Box color='red'>{tokenError}</Box> 
                        : null }
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={ isSubmitting }
                            color="white"
                            backgroundColor="teal"
                        >Change Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

ChangePassword.getInitialProps = ({query}) => { // get any query parameters and pass to original function
    return {
        token: query.token as string // cast token as string
    }
}

export default withUrqlClient(createUrqlClient)(ChangePassword);