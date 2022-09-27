import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Upload: any;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type FileResponse = {
  __typename?: 'FileResponse';
  newFilename: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  changePassword: UserResponse;
  createPost: Post;
  deletePost: Scalars['Boolean'];
  forgotPassword: Scalars['Boolean'];
  like: Scalars['Boolean'];
  login: UserResponse;
  logout: Scalars['Boolean'];
  register: UserResponse;
  updatePost: Post;
  uploadFile: FileResponse;
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String'];
  token: Scalars['String'];
};


export type MutationCreatePostArgs = {
  input: PostInput;
};


export type MutationDeletePostArgs = {
  id: Scalars['Int'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String'];
};


export type MutationLikeArgs = {
  postId: Scalars['Int'];
};


export type MutationLoginArgs = {
  loginOrEmail: Scalars['String'];
  password: Scalars['String'];
};


export type MutationRegisterArgs = {
  options: UsernamePasswordInput;
};


export type MutationUpdatePostArgs = {
  id: Scalars['Int'];
  image?: InputMaybe<Scalars['String']>;
  text: Scalars['String'];
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload'];
};

export type PaginatedPosts = {
  __typename?: 'PaginatedPosts';
  hasMore: Scalars['Boolean'];
  posts: Array<Post>;
};

export type Post = {
  __typename?: 'Post';
  createdAt: Scalars['String'];
  creator: User;
  creatorId: Scalars['Float'];
  id: Scalars['Float'];
  image?: Maybe<Scalars['String']>;
  likes_count: Scalars['Int'];
  postCreationDateString: Scalars['String'];
  text: Scalars['String'];
  textSnippet: Scalars['String'];
  updatedAt: Scalars['String'];
  voteStatus?: Maybe<Scalars['Int']>;
};

export type PostInput = {
  image?: InputMaybe<Scalars['String']>;
  text: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  post?: Maybe<Post>;
  posts: PaginatedPosts;
  user?: Maybe<User>;
};


export type QueryPostArgs = {
  id: Scalars['Int'];
};


export type QueryPostsArgs = {
  cursor?: InputMaybe<Scalars['String']>;
  limit: Scalars['Int'];
  searchBy?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['Int']>;
};


export type QueryUserArgs = {
  id: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  email: Scalars['String'];
  id: Scalars['Float'];
  login: Scalars['String'];
  updatedAt: Scalars['String'];
  username?: Maybe<Scalars['String']>;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type UsernamePasswordInput = {
  email: Scalars['String'];
  login: Scalars['String'];
  password: Scalars['String'];
};

export type PostPreviewSnippetFragment = { __typename?: 'Post', id: number, textSnippet: string, postCreationDateString: string, likes_count: number, voteStatus?: number | null, image?: string | null, createdAt: string, updatedAt: string, creator: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } };

export type RegularErrorFragment = { __typename?: 'FieldError', field: string, message: string };

export type RegularPostFragment = { __typename?: 'Post', id: number, text: string, image?: string | null, likes_count: number, voteStatus?: number | null, postCreationDateString: string, createdAt: string, updatedAt: string, creator: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } };

export type RegularUserFragment = { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string };

export type RegularUserResponseFragment = { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } | null };

export type ChangePasswordMutationVariables = Exact<{
  token: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } | null } };

export type CreatePostMutationVariables = Exact<{
  input: PostInput;
}>;


export type CreatePostMutation = { __typename?: 'Mutation', createPost: { __typename?: 'Post', id: number, text: string, image?: string | null, createdAt: string, updatedAt: string, creatorId: number } };

export type DeletePostMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeletePostMutation = { __typename?: 'Mutation', deletePost: boolean };

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword: boolean };

export type LikeMutationVariables = Exact<{
  postId: Scalars['Int'];
}>;


export type LikeMutation = { __typename?: 'Mutation', like: boolean };

export type LoginMutationVariables = Exact<{
  loginOrEmail: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RegisterMutationVariables = Exact<{
  options: UsernamePasswordInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserResponse', errors?: Array<{ __typename?: 'FieldError', field: string, message: string }> | null, user?: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } | null } };

export type UpdatePostMutationVariables = Exact<{
  id: Scalars['Int'];
  image?: InputMaybe<Scalars['String']>;
  text: Scalars['String'];
}>;


export type UpdatePostMutation = { __typename?: 'Mutation', updatePost: { __typename?: 'Post', id: number, createdAt: string, updatedAt: string, image?: string | null, text: string, textSnippet: string } };

export type GetPostQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetPostQuery = { __typename?: 'Query', post?: { __typename?: 'Post', id: number, text: string, image?: string | null, likes_count: number, voteStatus?: number | null, postCreationDateString: string, createdAt: string, updatedAt: string, creator: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } } | null };

export type GetPostsQueryVariables = Exact<{
  limit: Scalars['Int'];
  cursor?: InputMaybe<Scalars['String']>;
  searchBy?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['Int']>;
}>;


export type GetPostsQuery = { __typename?: 'Query', posts: { __typename?: 'PaginatedPosts', hasMore: boolean, posts: Array<{ __typename?: 'Post', id: number, textSnippet: string, postCreationDateString: string, likes_count: number, voteStatus?: number | null, image?: string | null, createdAt: string, updatedAt: string, creator: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } }> } };

export type GetUserQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, login: string, username?: string | null, avatar?: string | null, createdAt: string } | null };

export const RegularUserFragmentDoc = gql`
    fragment RegularUser on User {
  id
  login
  username
  avatar
  createdAt
}
    `;
export const PostPreviewSnippetFragmentDoc = gql`
    fragment PostPreviewSnippet on Post {
  id
  textSnippet
  postCreationDateString
  likes_count
  voteStatus
  image
  creator {
    ...RegularUser
  }
  createdAt
  updatedAt
}
    ${RegularUserFragmentDoc}`;
export const RegularPostFragmentDoc = gql`
    fragment RegularPost on Post {
  id
  text
  image
  likes_count
  voteStatus
  creator {
    ...RegularUser
  }
  postCreationDateString
  createdAt
  updatedAt
}
    ${RegularUserFragmentDoc}`;
export const RegularErrorFragmentDoc = gql`
    fragment RegularError on FieldError {
  field
  message
}
    `;
export const RegularUserResponseFragmentDoc = gql`
    fragment RegularUserResponse on UserResponse {
  errors {
    ...RegularError
  }
  user {
    ...RegularUser
  }
}
    ${RegularErrorFragmentDoc}
${RegularUserFragmentDoc}`;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($token: String!, $newPassword: String!) {
  changePassword(token: $token, newPassword: $newPassword) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useChangePasswordMutation() {
  return Urql.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument);
};
export const CreatePostDocument = gql`
    mutation CreatePost($input: PostInput!) {
  createPost(input: $input) {
    id
    text
    image
    createdAt
    updatedAt
    creatorId
  }
}
    `;

export function useCreatePostMutation() {
  return Urql.useMutation<CreatePostMutation, CreatePostMutationVariables>(CreatePostDocument);
};
export const DeletePostDocument = gql`
    mutation DeletePost($id: Int!) {
  deletePost(id: $id)
}
    `;

export function useDeletePostMutation() {
  return Urql.useMutation<DeletePostMutation, DeletePostMutationVariables>(DeletePostDocument);
};
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `;

export function useForgotPasswordMutation() {
  return Urql.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument);
};
export const LikeDocument = gql`
    mutation Like($postId: Int!) {
  like(postId: $postId)
}
    `;

export function useLikeMutation() {
  return Urql.useMutation<LikeMutation, LikeMutationVariables>(LikeDocument);
};
export const LoginDocument = gql`
    mutation Login($loginOrEmail: String!, $password: String!) {
  login(loginOrEmail: $loginOrEmail, password: $password) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const RegisterDocument = gql`
    mutation Register($options: UsernamePasswordInput!) {
  register(options: $options) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument);
};
export const UpdatePostDocument = gql`
    mutation UpdatePost($id: Int!, $image: String, $text: String!) {
  updatePost(id: $id, image: $image, text: $text) {
    id
    createdAt
    updatedAt
    image
    text
    textSnippet
  }
}
    `;

export function useUpdatePostMutation() {
  return Urql.useMutation<UpdatePostMutation, UpdatePostMutationVariables>(UpdatePostDocument);
};
export const GetPostDocument = gql`
    query GetPost($id: Int!) {
  post(id: $id) {
    ...RegularPost
  }
}
    ${RegularPostFragmentDoc}`;

export function useGetPostQuery(options: Omit<Urql.UseQueryArgs<GetPostQueryVariables>, 'query'>) {
  return Urql.useQuery<GetPostQuery>({ query: GetPostDocument, ...options });
};
export const GetPostsDocument = gql`
    query GetPosts($limit: Int!, $cursor: String, $searchBy: String, $userId: Int) {
  posts(limit: $limit, cursor: $cursor, searchBy: $searchBy, userId: $userId) {
    posts {
      ...PostPreviewSnippet
    }
    hasMore
  }
}
    ${PostPreviewSnippetFragmentDoc}`;

export function useGetPostsQuery(options: Omit<Urql.UseQueryArgs<GetPostsQueryVariables>, 'query'>) {
  return Urql.useQuery<GetPostsQuery>({ query: GetPostsDocument, ...options });
};
export const GetUserDocument = gql`
    query GetUser($id: Int!) {
  user(id: $id) {
    ...RegularUser
  }
}
    ${RegularUserFragmentDoc}`;

export function useGetUserQuery(options: Omit<Urql.UseQueryArgs<GetUserQueryVariables>, 'query'>) {
  return Urql.useQuery<GetUserQuery>({ query: GetUserDocument, ...options });
};
export const MeDocument = gql`
    query Me {
  me {
    ...RegularUser
  }
}
    ${RegularUserFragmentDoc}`;

export function useMeQuery(options?: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'>) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
};