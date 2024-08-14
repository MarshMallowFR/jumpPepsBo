'use client';

import { useState } from 'react';
import {
  ClimbingState,
  createClimbingMember,
} from '@/app/lib/actions/climbing/actions';
import Form from './form';

export default function CreateForm() {
  const initialState: ClimbingState = {
    isSuccess: undefined,
    errors: {},
    message: null,
  };
  const [state, setState] = useState<ClimbingState>(initialState);

  const dispatch = async (formData: FormData): Promise<ClimbingState> => {
    const newState = await createClimbingMember(state, formData, false);
    setState(newState);
    return newState;
  };

  return <Form dispatch={dispatch} state={state} />;
}

//OLD for record
// import { useFormState } from 'react-dom';
// import {
//   ClimbingState,
//   createClimbingMember,
// } from '@/app/lib/actions/climbing/actions';
// import Form from './form';

// export default function CreateForm() {
//   const initialState = { message: null, errors: {} };
//   const [state, dispatch] = useFormState(
//     (prevState: ClimbingState, formData: FormData) =>
//       createClimbingMember(prevState, formData, false),
//     initialState,
//   );

//   return <Form dispatch={dispatch} state={state} />;
// }
