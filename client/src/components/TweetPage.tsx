import { Link } from "@chakra-ui/react";
import { RegularPostFragment, useMeQuery, useLikeMutation } from "../generated/graphql";
import { PostButtons } from "./PostButtons";
import { useState } from "react";

interface TweetProps {
    openModal: Function,
    post: RegularPostFragment;
}

export const TweetPage: React.FC<TweetProps> = ({ openModal, post }) => {
    const [{ data: authUserData }] = useMeQuery();
    const [, like] = useLikeMutation();

    const Image = ({ src, alt, fallback }: any) => {
        const [error, setError] = useState(false);

        const onError = () => {
            setError(true);
        };

        return error ? fallback : <img src={src} alt={alt} onError={onError} />;
    };

    return (
        <article className="tweet">
            <div className="cursor-pointer">
                <div className="row">
                    <Link href={`/user/${post.creator.id}`}>
                        <img
                            className="avatar"
                            src={ post.creator.avatar 
                                ? `${process.env.PUBLIC_URL}/img/avatar/${post.creator.avatar}`
                                : `${process.env.PUBLIC_URL}/img/no_avatar.png`
                            }
                            alt={`${post.creator.login}'s avatar`}
                        />
                    </Link>
                    <div className="tweet__wrapper">
                        <header className="tweet__header">
                            <Link href={`/user/${post.creator.id}`}>
                                <div className="tweet_div">
                                    <h3 className="tweet-author">
                                        { (post.creator.username && post.creator.username !== "") ? post.creator.username : post.creator.login}
                                    </h3>
                                    <p className="tweet-author__add tweet-author__nickname">
                                        @{ post.creator.login }
                                    </p>
                                </div>
                            </Link>
                            { authUserData?.me?.id === post.creator.id && 
                                <PostButtons postId={post.id} postCreatorId={post.creator.id}/>
                            }
                        </header>
                        <div className="tweet-post">
                            <p className="tweet-post__text">
                                { post.text }
                            </p>
                            { post.image
                                ? 
                                    <a href={`${process.env.PUBLIC_URL}/img/post/${post.image}`} target="_blank">
                                        <figure className="tweet-post__image">
                                            <Image 
                                                fallback={
                                                    <img src={`${process.env.PUBLIC_URL}/img/no_image.jpg`} alt="no_image"/>
                                                } 
                                                src={`${process.env.PUBLIC_URL}/img/post/${post.image}`}
                                            />
                                        </figure>
                                    </a>
                                : null
                            }
                            <time className="tweet-author__add tweet__date">
                                { post.postCreationDateString }
                            </time>
                        </div>
                    </div>
                </div>
            </div>
            <footer>
                <button 
                    onClick={ 
                        authUserData?.me 
                        ? async () => like({ postId: post.id })
                        : () => openModal()
                    } 
                className={ post.voteStatus === 1 ? "tweet__like tweet__like_active" : "tweet__like" }>
                    { post.likes_count }
                </button>
            </footer>
        </article>
    );
}