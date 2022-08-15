import { Box, Button, Flex, Heading, Link, Spacer } from "@chakra-ui/react"
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from 'next/router';

interface HeaderProps {
    openModal: Function;
}

export const Header: React.FC<HeaderProps> = ({ openModal }) => {
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
    return(
        <>
            <header className="header">
                <h1 className="visually-hidden">Twitter</h1>
                <nav className="header__navigation">
                    <ul>
                        <li>
                            <a href="index.html" className="header__link header__link_main"></a>
                        </li>
                        <li>
                            { !data?.me
                             ? <button 
                                className="header__link header__link_profile_fill"
                                onClick={() => {
                                    openModal();
                                }}/>
                             : <button 
                                className="header__link header__link_exit"
                                onClick={async () => {
                                    await logout();
                                    router.reload();
                                }}/>
                            }
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    )
}