import { useField } from 'formik';

type TextareaProps = { 
        className: string;
        name: string;
        rows: number;
        placeholder: string
        required: boolean;
    }

export const TextareaInput: React.FC<TextareaProps> = ({ ...props }) => {
    const [field] = useField(props);
    return (
        <>
            <textarea
                { ...field}
                {...props}
                id={field.name}
            />
        </>
    );
};