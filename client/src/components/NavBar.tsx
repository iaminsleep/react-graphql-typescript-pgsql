import { Box, Button, Flex, Heading, Link, Spacer } from "@chakra-ui/react"
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from 'next/router';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();

    const [isServerRendered, setIsServerRendered] = useState(false);
    useEffect(() => {
        if(isServer()) {
            setIsServerRendered(true);
        }
    })
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation(); // if data is fetching, logoutFetcing is set to 'true';
    const [{ data, fetching }] = useMeQuery({
        pause: isServerRendered, // if you don't want to run query on the server
    }); // so, the logout mutation cache update in _app.tsx makes it very convinient to delete username from everywhere, because MeQuery reusult will be equal to null 
    let body = null;

    // There are 3 states of data fetching. We can use this to display the corresponding html. In this case the query is loading
    if(fetching) {

    } 
    // user is not logged in
    else if(!data?.me) {
        body = (
            <>
                {/* the purpose of this is because NextLink is using client side routing and this is important */}
                <NextLink href="/login">
                    <Link color="white" mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link color="white">Register</Link>
                </NextLink>
            </>
        )
    } 
    // user is logged in
    else {
        body = ( 
            <Flex minWidth='max-content' alignItems='center' gap='2'>
                <Box mr={2}>  
                    <Button as={Link} href="/create-post">
                        Create Post
                    </Button>
                </Box>
                <Spacer/>
                <Box mr={2}>{ data.me.username }</Box>
                <Button 
                    onClick={async () => {
                        await logout();
                        router.reload();
                    }}
                    isLoading={logoutFetching}
                    variant="link"
                >Logout</Button>
            </Flex>
        )
    }
    return(
        <Flex 
            zIndex={1} 
            position="sticky" 
            top={0} 
            bg='lightblue' 
            p={4}
        >
            <Flex 
                flex={1} 
                align="center" 
                maxW={800} 
                m='auto'
            >
                <NextLink href="/">
                    <Link>
                        <Flex align="center">
                            <Heading mb={5}>Twitter</Heading>
                        </Flex>
                    </Link>
                </NextLink>
                <Box ml={'auto'}>
                    { body }
                </Box>
            </Flex>
        </Flex>
    )
}