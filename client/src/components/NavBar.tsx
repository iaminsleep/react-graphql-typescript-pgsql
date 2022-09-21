import { useRouter } from 'next/router';
import { MeQuery } from "../generated/graphql";

interface NavBarProps {
    isAuth: Boolean,
    openAuthModal: Function,
    meData: MeQuery | null | undefined,
}

export const NavBar: React.FC<NavBarProps> = ({ isAuth, openAuthModal, meData }) => {
    const router = useRouter()
    const { searchBy } = router.query;

    return(
        <>
            <section className="wrapper">
                <div className="main-header">
                    <a href="/" className="header__link header__link_home" title="Feed"/>
                    { isAuth 
                        ?   <>
                                <a href={`/user/${meData?.me?.id}`} className="header__link header__link_profile" title="Profile"/>
                                <a 
                                    href={`${searchBy === undefined ? "/?searchBy=LIKED" : '/'}`} 
                                    className="header__link header__link_likes" 
                                    title="Liked tweets"
                                />
                            </> 
                        :   <>
                                <a className="header__link header__link_profile" title="Profile" onClick={() => openAuthModal()}/>
                                <a className="header__link header__link_likes" title="Liked tweets" onClick={() => openAuthModal()}/>
                            </>
                    }
                    <a 
                        href={`${searchBy === undefined ? "/?searchBy=LIKES_COUNT" : '/'}`} 
                        className="header__link header__link_sort" 
                        title="Sort tweets"
                    />
                </div>
            </section>
        </>
    );
}