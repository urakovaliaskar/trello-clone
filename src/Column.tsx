import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { AddNewItem } from './AddNewItem';
import { ColumnContainer, ColumnTitle } from './styles';
import { useAppState } from './state/AppStateContext';
import { Card } from './Card';
import { moveList, addTask, moveTask, setDraggedItem } from './state/actions';
import { useItemDrag } from './utils/useItemDrag';
import { DragItem } from './DragItem';
import { isHidden } from './utils/isHidden';

type ColumnProps = {
	text: string;
	id: string;
	isPreview?: boolean;
};

export const Column = ({ text, id, isPreview }: ColumnProps) => {
	const { draggedItem, getTasksByListId, dispatch } = useAppState();
	const tasks = getTasksByListId(id);
	const ref = useRef<HTMLDivElement>(null);

	const [, drop] = useDrop({
		accept: ['COLUMN', 'CARD'],
		hover(item: DragItem) {
			if (!draggedItem) {
				return;
			}
			if (draggedItem.type === 'COLUMN') {
				if (draggedItem.id === id) {
					return;
				}

				dispatch(moveList(draggedItem.id, id));
			} else {
				if (draggedItem.columnId === id) {
					return;
				}
				if (tasks.length) {
					return;
				}

				dispatch(moveTask(draggedItem.id, null, draggedItem.columnId, id));
				dispatch(setDraggedItem({ ...draggedItem, columnId: id }));
			}
		},
	});

	const { drag } = useItemDrag({ type: 'COLUMN', id, text });

	drag(drop(ref));

	return (
		<ColumnContainer
			isPreview={isPreview}
			ref={ref}
			isHidden={isHidden(draggedItem, 'COLUMN', id, isPreview)}>
			<ColumnTitle>{text}</ColumnTitle>
			{tasks.map(task => (
				<Card text={task.text} columnId={id} key={task.id} id={task.id} />
			))}
			<AddNewItem
				toggleButtonText='+ Add another card'
				onAdd={text => dispatch(addTask(text, id))}
				dark
			/>
		</ColumnContainer>
	);
};
