interface WrapperProps { 
    children: any
};

export const Wrapper: React.FC<WrapperProps> = ({ children }) => {
    return (
        <section className="wrapper">
            { children }
        </section>
    );
}