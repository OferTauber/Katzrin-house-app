import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useQuery } from '@tanstack/react-query';
import { EventDTO, exclusive, LogedUser } from '../../../utils/types';
import Button from '@mui/material/Button';
import {
  extreacJoinungList,
  userIsJoining,
} from '../../../utils/utilFunctions';
import { joinToEvent, leaveEvent, deleteEvent } from '../../../utils/axios';
import { QueryKeys } from '../../../utils/types';

const DialogController = ({
  event,
  closeDialog,
}: {
  event: EventDTO;
  closeDialog: () => void;
}) => {
  const { data: logedUser }: { data: LogedUser | undefined } = useQuery([
    QueryKeys.user,
  ]);

  if (!event || !logedUser) return <></>;

  return event.owner.id === logedUser.id ? (
    <UesersEvent
      event={event}
      closeDialog={closeDialog}
      logedUser={logedUser}
    />
  ) : (
    <NotUesersEvent
      event={event}
      logedUser={logedUser}
      closeDialog={closeDialog}
    />
  );
};

export default DialogController;

const UesersEvent = ({
  event,
  logedUser,
  closeDialog,
}: {
  event: EventDTO;
  logedUser: LogedUser;
  closeDialog: () => void;
}) => {
  const { refetch } = useQuery([QueryKeys.events]);
  const handelClick = (
    callback: typeof deleteEvent | typeof joinToEvent | typeof leaveEvent,
    event: EventDTO,
    logedUser: LogedUser,
  ) => {
    callback(event, logedUser);
    refetch();
    closeDialog();
  };

  let content = <></>;

  switch (event.isExclusiveConfirmed) {
    case exclusive.no:
      content = (
        <DialogContentText>
          מצטרפים: {extreacJoinungList(event)}
        </DialogContentText>
      );
      break;
    default:
      content = (
        <DialogContentText>
          הזמנה סגורה{' '}
          {event.isExclusiveConfirmed === exclusive.unConfirmed &&
            ', ממתינה לאישור'}
        </DialogContentText>
      );
  }

  return (
    <>
      {content}
      <DialogActions>
        <Button onClick={() => handelClick(deleteEvent, event, logedUser)}>
          ביטול הזמנה
        </Button>
      </DialogActions>
    </>
  );
};

const NotUesersEvent = ({
  event,
  logedUser,
  closeDialog,
}: {
  event: EventDTO;
  logedUser: LogedUser;
  closeDialog: () => void;
}) => {
  const { refetch } = useQuery([QueryKeys.events]);

  const handelClick = async (
    callback: typeof deleteEvent | typeof joinToEvent | typeof leaveEvent,

    event: EventDTO,
    logedUser: LogedUser,
  ) => {
    const res = await callback(event, logedUser);
    console.log(res);
    await refetch();
    closeDialog();
  };

  if (event.isExclusiveConfirmed !== exclusive.no) {
    return (
      <DialogContentText>זוהי הזמנה סגורה, לא ניתן להצטרף</DialogContentText>
    );
  }
  const button = userIsJoining(event, logedUser) ? (
    <DialogActions>
      <Button onClick={() => handelClick(leaveEvent, event, logedUser)}>
        יציאה
      </Button>
    </DialogActions>
  ) : (
    <DialogActions>
      <Button onClick={() => handelClick(joinToEvent, event, logedUser)}>
        הצטרפות
      </Button>
    </DialogActions>
  );

  return (
    <>
      <DialogContentText>
        {'מצטרפים: ' + extreacJoinungList(event, logedUser)}
      </DialogContentText>
      {button}
    </>
  );
};
