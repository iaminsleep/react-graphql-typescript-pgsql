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
                <section>
                    <h2 className="tweet-form__title">Enter your login and password</h2>
                    <div className="tweet-form__subtitle">
                        If you are new here,&nbsp;
                        <NextLink href="/register">
                            <a className="link-pswd">
                                register
                            </a>
                        </NextLink>.
                    </div>
                    <Formik
                        initialValues={{ loginOrEmail: "", password: "" }}
                        onSubmit={async (values, { setErrors, resetForm }) => {
                            const response = await login(values);
                            if(response.data?.login.errors) // optional chaining allows to access deep nested properties 
                            {
                                setErrors(toErrorMap(response.data.login.errors));
                            } else if(response.data?.login.user) {
                                // worked
                                resetForm({});
                                if(typeof router.query.next === 'string') {
                                    router.push(router.query.next); // if next path is set in router query
                                } else {  
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
                                        placeholder="Login (or email)"
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
                                    <NextLink href="/forgot-password">
                                        <a className="link-pswd forgot-password1">Forgot password?</a>
                                    </NextLink>
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