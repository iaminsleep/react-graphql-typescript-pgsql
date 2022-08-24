import NextLink from "next/link";
import { MeQuery, useLogoutMutation } from "../generated/graphql";
import { useRouter } from 'next/router';

interface HeaderProps {
    openModal: Function;
    authUserData?: MeQuery
}

export const Header: React.FC<HeaderProps> = ({ openModal, authUserData }) => {
    const router = useRouter();

    const [{ fetching: logoutFetching }, logout] = useLogoutMutation(); // if data is fetching, logoutFetcing is set to 'true';
    // There are 3 states of data fetching. We can use this to display the corresponding html. In this case the query is loading
    
    return(
        <>
            <header className="header">
                <h1 className="visually-hidden">Twitter</h1>
                <nav className="header__navigation">
                    <ul>
                        <li>
                            <NextLink href="/">
                                <a className="header__link header__link_main"/>
                            </NextLink>
                        </li>
                        <li>
                            { !authUserData?.me
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