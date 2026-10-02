export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  load: string;
  restSec: number;
  note?: string;
}

export interface Workout {
  id: string;
  name: string;
  minutes: number;
  exercises: Exercise[];
}

// Week 4, Lower body A (home, dumbbells). Production: generated from profile + last logs.
export const TODAY_WORKOUT: Workout = {
  id: 'lowerA-w4',
  name: 'Lower body A',
  minutes: 35,
  exercises: [
    { id: 'goblet', name: 'Goblet squat', sets: 3, reps: '10', load: '16 kg', restSec: 90, note: 'Up from 14 kg — last week you did all 3 × 10 with 2 reps to spare.' },
    { id: 'rdl', name: 'Romanian deadlift', sets: 3, reps: '8', load: '2 × 14 kg', restSec: 90 },
    { id: 'lunge', name: 'Reverse lunge', sets: 3, reps: '8 / leg', load: '2 × 8 kg', restSec: 75 },
    { id: 'bridge', name: 'Glute bridge', sets: 3, reps: '12', load: '16 kg', restSec: 60 },
    { id: 'plank', name: 'Plank', sets: 3, reps: '40 s', load: 'Bodyweight', restSec: 45 },
  ],
};
