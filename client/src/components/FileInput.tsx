import { useField } from 'formik';

type FileProps = { 
    className: string;
    name: string;
    type: string;
    value: any;
    onChange: any;
}

export const FileInput: React.FC<FileProps> = ({ ...props }) => {
    const [field] = useField(props);
    return (
        <>
            <input
                { ...field}
                {...props}
                id={field.name}
            />
        </>
    );
};