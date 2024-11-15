'use client';

import { useEffect, useState } from 'react';
import {
  createClimbingMember,
  ClimbingState,
} from '@/app/lib/actions/climbing/actions';
import FormRegistration from './form-registration';
import { kanit } from '../style/fonts';
import { Season } from '@/app/lib/types/season';
import { getSeasons } from '@/app/lib/actions/season/actions';
import NoRegistrationForm from './no-registration-form';

export default function RegisterForm() {
  const initialState: ClimbingState = {
    isSuccess: undefined,
    errors: {},
    message: null,
  };
  const [state, setState] = useState<ClimbingState>(initialState);
  const [currentSeason, setCurrentSeason] = useState<Season | undefined>(
    undefined,
  );

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const { currentSeason } = await getSeasons();
        setCurrentSeason(currentSeason);
      } catch (error) {
        console.error('Erreur lors de la récupération des saison', error);
      }
    };

    fetchSeasons();
  }, []);

  const dispatch = async (formData: FormData): Promise<ClimbingState> => {
    const newState = await createClimbingMember(state, formData, true);
    setState(newState);
    return newState;
  };

  return (
    <div
      className={`flex flex-col lg:flex-row lg:space-x-12 px-4 sm:px-6 md:px-8 lg:px-12 ${kanit.className}`}
    >
      <div className="min-w-0 w-full lg:w-1/2 mb-8">
        <h2 className="text-lg font-bold">
          INSCRIPTION POUR LA SAISON {currentSeason?.name}
        </h2>
        <p className="my-2">
          Les inscriptions sont actuellement{' '}
          {currentSeason?.registrationOpen ? 'ouvertes' : 'fermées'}.
        </p>
        <h2 className="text-lg font-bold mt-8">INFORMATIONS IMPORTANTES</h2>
        <p className="my-2">
          Le dossier sera validé et donnera accès à l’adhérent aux
          infrastructures sportives quand tous les documents ci- dessous seront
          transmis :
        </p>
        <ul className="list-disc pl-5">
          <li>dossier d’inscription rempli et envoyé</li>
          <li>questionnaire de santé</li>
          <li>paiement de la cotisation annuelle</li>
        </ul>
      </div>
      {currentSeason && currentSeason.registrationOpen ? (
        <FormRegistration
          dispatch={dispatch}
          state={state}
          season={currentSeason}
        />
      ) : (
        <NoRegistrationForm />
      )}
    </div>
  );
}
