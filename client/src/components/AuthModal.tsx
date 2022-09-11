import { Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { InputField } from "./InputField";

interface AuthModalProps {
    closeModal: Function;
}

export const AuthModal: React.FC<AuthModalProps> = ({ closeModal }) => {
    const router = useRouter();
    const [, login] = useLoginMutation();

    return(
        <div className="modal overlay">
            <div className="container modal__body" id="login-modal">
                <div className="modal-close">
                    <button className="modal-close__btn chest-icon" onClick={() => closeModal()}></button>
                </div>
                <section className="wrapper">
                    <h2 className="tweet-form__title">Enter your username and password</h2>
                    <div className="tweet-form__subtitle">
                        If you don't have a username,&nbsp;
                        <NextLink href="/register">
                            register
                        </NextLink>
                    </div>
                    <Formik
                        initialValues={{ loginOrEmail: "", password: "" }}
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
                                    closeModal();
                                }
                            }
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
                </section>
            </div>
        </div>
    );
}