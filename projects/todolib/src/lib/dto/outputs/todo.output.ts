import { personOutput } from "todolib";

export interface todoOutput {
  iscomplete?: boolean;
  id: number;
  title: string;
  person: personOutput;
  startDate: string;
  endDate: string | null;
  priority: 'Facile' | 'Moyen' | 'Difficile';
  labels: Array<'HTML' | 'CSS' | 'NODE JS' | 'JQUERY'>;
  description: string;
}
