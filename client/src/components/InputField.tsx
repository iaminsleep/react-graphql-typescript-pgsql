import { 
    FormControl, 
    FormErrorMessage,
    FormLabel, 
    Input 
} from '@chakra-ui/react';
import { useField } from 'formik';
import { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string,
    name: string;
}; // this tells react that I want to pass props that are exactly input elements

export const InputField: React.FC<InputFieldProps> = ({label, size: _, ...props}) => { // take label from props so you can type 'label' instead of 'props.label'. also don't pass size
    const [field, {error}] = useField(props);
    return (
        // cast error string to boolean if it is not set
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>
                { label }
            </FormLabel>
            <Input 
                {...field} 
                {...props}
                id={field.name} 
            />
            { error ? 
                <FormErrorMessage>
                    { error }
                </FormErrorMessage> 
            : null }
        </FormControl>
    )
}