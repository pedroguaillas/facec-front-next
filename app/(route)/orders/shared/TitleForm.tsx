interface Props {
    title: string;
    description?: string;
}

export const TitleForm = ({ title, description }: Props) => {
    return (
        <div>
            <p>
                <strong className='font-bold'>{title} </strong>
                {description}
            </p>
        </div>
    )
}
