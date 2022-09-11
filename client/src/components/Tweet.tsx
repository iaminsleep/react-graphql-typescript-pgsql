import { PostPreviewSnippetFragment, useMeQuery, useVoteMutation } from "../generated/graphql";
import { PostButtons } from "./PostButtons";

interface TweetProps {
    openModal: Function,
    post: PostPreviewSnippetFragment;
}

export const Tweet: React.FC<TweetProps> = ({ openModal, post }) => {
    const [{ data: authUserData }] = useMeQuery();
    const [, vote] = useVoteMutation();

    return (
        <li>
            <article className="tweet">
                <div className="row">
                    <img
                        className="avatar"
                        src={ post.creator.avatar ? "img/avatar.png" : "img/no_avatar.png"}
                        alt={`${post.creator.login}'s avatar`}
                    />
                    <div className="tweet__wrapper">
                        <header className="tweet__header">
                            <div className="tweet_div">
                                <h3 className="tweet-author">
                                    { post.creator.username ?? post.creator.login }
                                </h3>
                                <a
                                    href="#"
                                    className="tweet-author__add tweet-author__nickname"
                                    >@{ post.creator.login }
                                </a>
                            </div>
                            { authUserData?.me?.id === post.creator.id && 
                                <PostButtons postId={post.id}/>
                            }
                        </header>
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
                    </div>
                </div>
                <footer>
                    <button 
                        onClick={ 
                            authUserData?.me 
                            ? async () => vote({value: 1, postId: post.id})
                            : () => openModal()
                        } 
                    className="tweet__like">
                        { post.likes_count }
                    </button>
                </footer>
            </article>
        </li>
    );
}