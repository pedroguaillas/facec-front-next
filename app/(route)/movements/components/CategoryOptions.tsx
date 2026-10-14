import { movementCategoryGroupLabels, movementCategoryHints, movementCategoryLabels } from "@/constants";
import { MovementType } from "@/types";
import { useMovementCategories } from "../hooks/useMovementCategories";

interface Props {
    type: MovementType;
    emptyLabel?: string;
}

// <option>s del selector de categoría: "Del negocio" y "Dueño y préstamos" en grupos separados
export const CategoryOptions = ({ type, emptyLabel = 'Sin clasificar' }: Props) => {
    const { groupedFor } = useMovementCategories();

    return (
        <>
            <option value="">{emptyLabel}</option>
            {groupedFor(type).map(({ group, items }) => (
                <optgroup key={group} label={movementCategoryGroupLabels[group]}>
                    {items.map(({ category }) => (
                        <option key={category} value={category}>
                            {movementCategoryLabels[category] ?? category}
                            {movementCategoryHints[category] ? ` (${movementCategoryHints[category]})` : ''}
                        </option>
                    ))}
                </optgroup>
            ))}
        </>
    );
};
