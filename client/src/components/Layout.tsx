import Head from "next/head";
import { useEffect, useState } from "react";
import { useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { AuthModal } from "./AuthModal";
import { Header } from "./Header"
import { NavBar } from "./NavBar";
import { TweetForm } from "./TweetForm";
import { Wrapper } from "./Wrapper"

interface LayoutProps {
    children: any,
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isModalOpen, setModalOpen] = useState(false);

    const [isServerRendered, setIsServerRendered] = useState(false);
    useEffect(() => {
        if(isServer()) {
            setIsServerRendered(true);
        }
    })
    const [{ data, fetching }] = useMeQuery({
        pause: isServerRendered, // if you don't want to run query on the server
    }); // so, the logout mutation cache update in _app.tsx makes it very convinient to delete username from everywhere, because MeQuery reusult will be equal to null

    const openModal = () => {
        setModalOpen(true);
    }
    const closeModal = () => {
        setModalOpen(false);
    }

    return (
        <>
            <Head>
                <link rel="icon" href="img/twitter.png"/>
            </Head>
            <div className="container row">
                <Header openModal={openModal} authUserData={data}></Header>
                <main className="main">
                    <NavBar/>
                    <TweetForm authUserData={data}/>
                    <Wrapper>
                        { children }
                    </Wrapper>
                </main>
            </div>
            { isModalOpen 
                ? <AuthModal closeModal={closeModal}></AuthModal>
                : ''
            }
        </>
    );
}