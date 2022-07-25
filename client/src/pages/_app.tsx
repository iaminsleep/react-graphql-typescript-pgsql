import { ChakraProvider } from '@chakra-ui/react'
import theme from '../theme'
import { AppProps } from 'next/app'

import { Provider, createClient } from 'urql'; // import graphql provider

const client = createClient({
  url: "http://localhost:8080/graphql",
  fetchOptions: {
    credentials: "include" // we need this to get cookies
  }
});

function MyApp({ Component, pageProps }: AppProps): any {
  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
