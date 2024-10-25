export interface Data {
  user: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  questions: {
    [question: string]: number;
  };
}
