import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface PostButtonsProps {
    postId: number,
    creatorId: number,
}

export const PostButtons: React.FC<PostButtonsProps> = ({ postId,creatorId }) => {
    const [{ data: authUserData }] = useMeQuery();
    const [, deletePost] = useDeletePostMutation();

    if(authUserData?.me?.id !== creatorId) return null;

    return (
    <>
        <NextLink href='/post/edit/[id]' as={`/post/edit/${postId}`}>
            <IconButton
                mr={4}
                aria-label="edit post" 
                icon={<EditIcon/>}
            />
        </NextLink>
        <IconButton 
            aria-label="delete post" 
            icon={<DeleteIcon/>}
            onClick={ () => { 
                deletePost({ id: postId })
            }}
        />
    </>
    );
}