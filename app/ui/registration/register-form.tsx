'use client';

import { useState } from 'react';
import {
  createClimbingMember,
  ClimbingState,
} from '@/app/lib/actions/climbing/actions';
import FormRegistration from './form-registration';
import { kanit } from '../style/fonts';

export default function RegisterForm() {
  const initialState: ClimbingState = {
    isSuccess: undefined,
    errors: {},
    message: null,
  };
  const [state, setState] = useState<ClimbingState>(initialState);

  const dispatch = async (formData: FormData): Promise<ClimbingState> => {
    const newState = await createClimbingMember(state, formData, true);
    setState(newState);
    return newState;
  };

  return (
    <div
      className={`flex flex-col md:flex-row md:space-x-12 md:px-9 ${kanit.className}`}
    >
      <div className="min-w-0 w-full md:w-1/2">
        <h2 className="text-lg font-bold">LICENCE ET TARIFS</h2>
        <p className="my-2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita,
          illum quae? Dolores, sapiente deserunt hic tenetur mollitia itaque
          placeat accusamus eum doloribus, in quaerat atque numquam. Hic numquam
          temporibus quos.
        </p>
        <h2 className="text-lg font-bold mt-8">HORAIRES</h2>
        <p className="mt-2 mb-8">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita,
          illum quae? Dolores, sapiente deserunt hic tenetur mollitia itaque
          placeat accusamus eum doloribus, in quaerat atque numquam. Hic numquam
          temporibus quos.
        </p>
      </div>
      <FormRegistration dispatch={dispatch} state={state} />
    </div>
  );
}
