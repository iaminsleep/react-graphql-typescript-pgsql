interface AuthModalProps {
    closeModal: Function;
}

export const AuthModal: React.FC<AuthModalProps> = ({ closeModal }) => {
    return(
        <div className="modal overlay">
            <div className="container modal__body" id="login-modal">
                <div className="modal-close">
                    <button className="modal-close__btn chest-icon" onClick={() => closeModal()}></button>
                </div>
                <section className="wrapper">
                    <h2 className="tweet-form__title">Введите логин и пароль</h2>
                    <div className="tweet-form__error">Что-то пошло не так</div>
                    <div className="tweet-form__subtitle">
                        Если у вас нет логина, пройдите
                        <a href="register.html">регистрацию</a>
                    </div>
                    <form className="tweet-form">
                        <div className="tweet-form__wrapper_inputs">
                            <input
                                type="text"
                                className="tweet-form__input"
                                placeholder="Логин"
                                required
                            />
                            <input
                                type="password"
                                className="tweet-form__input"
                                placeholder="Пароль"
                                required
                            />
                        </div>
                        <div className="tweet-form__btns_center">
                            <button
                                className="tweet-form__btn_center"
                                type="submit"
                            >
                                Войти
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}