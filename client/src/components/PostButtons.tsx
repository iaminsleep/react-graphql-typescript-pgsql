import Link from "next/link";
import { useDeletePostMutation } from "../generated/graphql";

interface PostButtonsProps {
    postId: number,
    postCreatorId: number,
}

export const PostButtons: React.FC<PostButtonsProps> = ({ postId, postCreatorId }) => {
    const [, deletePost] = useDeletePostMutation();

    return (
    <div className="displayFlex">
        <Link href={{ 
            pathname: '/post/edit/[id]', 
            query: { postCreatorId: postCreatorId }}} as={`/post/edit/${postId}`}
        >
            <button className="edit-icon"/>
        </Link>
        <button 
            onClick={() => deletePost({ id: postId })} 
            className="tweet__delete-button chest-icon"
        />
    </div>
    );
}