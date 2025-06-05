import { personInput } from "todolib";

export  interface todoInput {
  id: number;
  title: string;
  person: personInput;
  startDate: string;
  endDate: string | null;
  priority: 'Facile' | 'Moyen' | 'Difficile';
  labels: Array<'HTML' | 'CSS' | 'NODE JS' | 'JQUERY'>;
  description: string;
}
