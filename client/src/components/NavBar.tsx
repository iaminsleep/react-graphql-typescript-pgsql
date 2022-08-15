interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = () => {
    return(
        <>
            <section className="wrapper">
                <div className="main-header">
                    <a
                        href="index.html"
                        className="header__link header__link_home"
                        title="Лента"
                    ></a>
                    <a
                        href="#"
                        className="header__link header__link_profile"
                        title="Твиты пользователя"
                    ></a>
                    <a
                        href="#"
                        className="header__link header__link_likes"
                        title="Понравившиеся твиты"
                    ></a>
                    <a
                        href="#"
                        className="header__link header__link_sort"
                        title="Сортировать"
                    ></a>
                </div>
            </section>
            <section className="wrapper">
                <form className="tweet-form">
                    <div className="tweet-form__wrapper">
                        <img
                            className="avatar"
                            src="images/avatar.jpg"
                            alt="Аватар"
                        />
                        <textarea
                            className="tweet-form__text"
                            rows={Number("4")}
                            placeholder="Что происходит?"
                            required
                        ></textarea>
                    </div>
                    <div className="tweet-form__btns">
                        <button
                            className="tweet-img__btn"
                            type="button"
                        ></button>
                        <span id="image-span">path/to/image</span>
                        <input type="hidden" id="image-path" />
                        <button className="tweet-form__btn" type="submit">
                            Твитнуть
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}