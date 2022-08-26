import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface PostButtonsProps {
    postId: number,
}

export const PostButtons: React.FC<PostButtonsProps> = ({ postId }) => {
    const [, deletePost] = useDeletePostMutation();

    return (
    <div className="displayFlex">
        <NextLink href='/post/edit/[id]' as={`/post/edit/${postId}`}>
            <button className="edit-icon"/>
        </NextLink>
        <button 
            onClick={() => deletePost({ id: postId })} 
            className="tweet__delete-button chest-icon"
        />
    </div>
    );
}