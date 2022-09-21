import { Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { PostPreviewSnippetFragment, useMeQuery, useLikeMutation } from "../generated/graphql";
import { PostButtons } from "./PostButtons";

interface TweetProps {
    openModal: Function,
    post: PostPreviewSnippetFragment;
}

export const Tweet: React.FC<TweetProps> = ({ openModal, post }) => {
    const [{ data: authUserData }] = useMeQuery();
    const [, like] = useLikeMutation();

    return (
        <li>
            <article className="tweet">
                    <div className="cursor-pointer">
                        <div className="row">
                            <Link href={`/user/${post.creator.id}`}>
                                <img
                                    className="avatar"
                                    src={ post.creator.avatar 
                                        ? `${process.env.PUBLIC_URL}/img/avatar.png` 
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
                                                { post.creator.username ?? post.creator.login }
                                            </h3>
                                            <p className="tweet-author__add tweet-author__nickname">
                                                @{ post.creator.login }
                                            </p>
                                        </div>
                                    </Link>
                                    { authUserData?.me?.id === post.creator.id && 
                                        <PostButtons postId={post.id}/>
                                    }
                                </header>
                                <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                                    <a>
                                        <div className="tweet-post">
                                            <p className="tweet-post__text">
                                                { post.textSnippet }
                                            </p>
                                            {/* <figure className="tweet-post__image">
                                                <img
                                                    src="https://chudo-prirody.com/uploads/posts/2021-08/1628921960_133-p-foto-milikh-kotyat-i-shchenyat-144.jpg"
                                                />
                                            </figure> */}
                                            <time className="tweet-author__add tweet__date">
                                                { post.postCreationDateString }
                                            </time>
                                        </div>
                                    </a>
                                </NextLink>
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
        </li>
    );
}