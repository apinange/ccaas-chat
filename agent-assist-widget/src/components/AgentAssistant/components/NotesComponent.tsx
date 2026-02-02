import React from 'react';
import {NoteType} from '../../../types';
import {SNoteContainer, SToastBoxText} from './styled';

interface Props {
   notes:NoteType[] | undefined | null;
}

const NotesComponent = ({notes}:Props) => {
    return (
        <>
            {notes && notes.map(note=><SNoteContainer>
                <SToastBoxText level={3}>
                    {note.key} :
                </SToastBoxText>
                <SToastBoxText level={3}>
                    {note.value}
                </SToastBoxText>
            </SNoteContainer>)}
        </>
    )
}

export default NotesComponent