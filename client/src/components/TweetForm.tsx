import { MeQuery, useUploadFileMutation } from '../generated/graphql';

interface TweetFormProps {
    authUserData?: MeQuery
}

export const TweetForm: React.FC<TweetFormProps> = ({ authUserData }) => {
    const [, uploadFile] = useUploadFileMutation();

    const handleFileChange = (e: React.ChangeEvent<any>) => {
        const file = e.target.files[0];
        if(!file) return false;
        uploadFile({ file: file });
    }

    return(
        <>
            <section className="wrapper">
                <form className="tweet-form">
                    <div className="tweet-form__wrapper">
                        <img
                            className="avatar"
                            src={authUserData?.me ? "/img/avatar.png" : "img/no_avatar.png"}
                            alt="Avatar"
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
                        <input type="file" onChange={handleFileChange}/>
                        <button className="tweet-form__btn" type="submit">
                            Твитнуть
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}