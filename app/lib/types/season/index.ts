export interface SeasonDB {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  registration_open: boolean;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  registrationOpen: boolean;
}
