import { Box } from "@chakra-ui/react"

interface WrapperProps { 
    children: any 
    variant?: "modal" | "regular", // question mark because this is optinal
};

export const Wrapper: React.FC<WrapperProps> = ({ children, variant="regular" }) => {
    return <Box 
        mt={8} 
        mx='auto' 
        maxW={ variant === "regular" ? "800px" : "400px" } 
        w="100%"
    >
        { children }
    </Box>
}