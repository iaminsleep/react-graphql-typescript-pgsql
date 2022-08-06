import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

// specify what do you pass in component in inteface 
interface UpvoteSectionProps {
    post: PostSnippetFragment // equals to GetPostsQuery['posts']['posts'][0],
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<"upvote-loading" | "downvote-loading" | "not-loading">("not-loading"); // to show loading icon
    const [, vote] = useVoteMutation();

    return (
        <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
            <IconButton 
                onClick={async () => {
                    if(post.voteStatus === 1) {
                        return;
                    }
                    setLoadingState("upvote-loading");
                    await vote({value: 1, postId: post.id});
                    setLoadingState("not-loading");
                }}
                isLoading={ 
                    loadingState === "upvote-loading"
                }
                colorScheme={ post.voteStatus === 1 
                    ? 'green' 
                    : undefined
                }
                aria-label="Upvote" 
                icon={<ChevronUpIcon w={10} h={10}/>}
            />
            { post.points }
            <IconButton 
                onClick={async () => {
                    if(post.voteStatus === -1) {
                        return;
                    }
                    setLoadingState("upvote-loading");
                    await vote({value: -1, postId: post.id});
                    setLoadingState("not-loading");
                }}
                isLoading={ 
                    loadingState === "upvote-loading"
                }
                colorScheme={ post.voteStatus === -1 
                    ? 'red' 
                    : undefined
                }
                aria-label="Downvote" 
                icon={<ChevronDownIcon w={10} h={10}/>}
            />
        </Flex>
    );
}