import { PostPreviewSnippetFragment } from "../generated/graphql";
import Link from "next/link";
import { Heading } from "@chakra-ui/react";

interface TweetProps {
    post: PostPreviewSnippetFragment;
}

export const Tweet: React.FC<TweetProps> = ({ post }) => {
    return (
        <li>
            <article className="tweet">
                <div className="row">
                    <img
                        className="avatar"
                        src="images/mary.jpg"
                        alt="Аватар пользователя Мария"
                    />
                    <div className="tweet__wrapper">
                        <header className="tweet__header">
                            <h3 className="tweet-author">
                                { post.creator.username }
                                <a
                                    href="#"
                                    className="tweet-author__add tweet-author__nickname"
                                    >@{ post.creator.username }</a>
                                <time
                                    className="tweet-author__add tweet__date"
                                    >11 января</time
                                >
                            </h3>
                            <button
                                className="tweet__delete-button chest-icon"
                            ></button>
                        </header>
                        <div className="tweet-post">
                            <p className="tweet-post__text">
                                { post.textSnippet }
                            </p>
                            <figure className="tweet-post__image">
                                <img
                                    src="https://picsum.photos/400/300?random=1"
                                    alt="Сообщение Марии Lorem ipsum dolor sit amet, consectetur."
                                />
                            </figure>
                        </div>
                    </div>
                </div>
                <footer>
                    <button className="tweet__like">{ post.likes }</button>
                </footer>
            </article>
        </li>
    );
}