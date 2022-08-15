import Head from "next/head";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { Header } from "./Header"
import { NavBar } from "./NavBar";
import { Wrapper } from "./Wrapper"

interface LayoutProps {
    children: any,
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isModalOpen, setModalOpen] = useState(false);

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
                <Header openModal={openModal}></Header>
                <main className="main">
                    <NavBar></NavBar>
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