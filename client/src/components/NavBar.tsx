import Link from 'next/link';
import NextLink from 'next/link';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = () => {
    return(
        <>
            <section className="wrapper">
                <div className="main-header">
                    <NextLink href="/">
                        <a className="header__link header__link_home" title="Feed"/>
                    </NextLink>
                    <NextLink href="/profile">
                        <a className="header__link header__link_profile" title="Profile"/>
                    </NextLink>
                    <NextLink href="/">
                        <a className="header__link header__link_likes" title="Liked tweets"/>
                    </NextLink>
                    <NextLink href="/">
                        <a className="header__link header__link_sort" title="Sort tweets"/>
                    </NextLink>
                </div>
            </section>
        </>
    );
}