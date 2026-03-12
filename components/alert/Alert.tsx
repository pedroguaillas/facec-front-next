interface AlertProps {
    message: string
}

export const Alert = ({ message }: AlertProps) => {
    return (
        <div className='p-2 bg-red-500 text-white'>{message}</div>
    )
}
