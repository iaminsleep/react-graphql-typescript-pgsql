import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import theme from '../theme';
import '../css/style.css';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

const client = new ApolloClient({
  link: createUploadLink({
    uri: 'http://localhost:8080/graphql',
  }),
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }: AppProps): any {
  return (
      <ChakraProvider theme={theme}>
        <ApolloProvider client={client}>
            <Component {...pageProps} />
        </ApolloProvider>
      </ChakraProvider>
  )
}

export default MyApp
