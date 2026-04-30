import { DocumentData, FieldValue, QueryDocumentSnapshot } from 'firebase/firestore';

export type HeistStatus = 'success' | 'failure' | null;

export interface Heist {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByCodename: string;
  assignedTo: string;
  assignedToCodename: string;
  deadline: Date;
  finalStatus: HeistStatus;
}

export interface CreateHeistInput {
  title: string;
  description: string;
  createdBy: string;
  createdByCodename: string;
  assignedTo: string;
  assignedToCodename: string;
  deadline: FieldValue;
  finalStatus: null;
}

export interface UpdateHeistInput {
  title?: string;
  description?: string;
  assignedTo?: string;
  assignedToCodename?: string;
  deadline?: FieldValue;
  finalStatus?: HeistStatus;
}

export const heistConverter = {
  toFirestore: (data: Partial<Heist>): DocumentData => data,

  fromFirestore: (snapshot: QueryDocumentSnapshot): Heist => ({
    id: snapshot.id,
    ...snapshot.data(),
    deadline: snapshot.data().deadline?.toDate(),
  } as Heist),
};
