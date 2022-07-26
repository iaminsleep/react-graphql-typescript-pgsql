import { Box, Button, Flex, Link } from "@chakra-ui/react"
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{fetching: logoutFetching}, logout] = useLogoutMutation(); // if data is fetching, logoutFetcing is set to 'true';
    const [{data, fetching}] = useMeQuery(); // so, the logout mutation cache update in _app.tsx makes it very convinient to delete username from everywhere, because MeQuery reusult will be equal to null 
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
            <Flex>
                <Box mr={2}>{ data.me.username }</Box>
                <Button 
                    onClick={() => logout()} 
                    isLoading={logoutFetching}
                    variant="link"
                >Logout</Button>
            </Flex>
        )
    }
    return(
        <Flex bg='tan' p={4}>
            <Box ml={'auto'}>
                { body }
            </Box>
        </Flex>
    )
}