'use client';

import { useFormState } from 'react-dom';
import { createClimbingMember } from '@/app/lib/actions/climbing/actions';
import FormRegistration from './FormRegistration';

export default function RegisterForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(
    (prevState: any, formData: any) =>
      createClimbingMember(prevState, formData, true),
    initialState,
  );
  return (
    <div className="flex flex-col md:flex-row md:space-x-12 md:px-9">
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
