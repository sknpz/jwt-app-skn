export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  isAdmin: boolean;
  active: boolean;
};

export type DashboardReport = {
  totalBooks: number;
  activeLoans: number;
  overdueLoans: number;
  totalFines: number;
};

export type Category = {
  id: number;
  name: string;
  description: string | null;
};

export type Author = {
  id: number;
  name: string;
  nationality: string | null;
  birthDate: string | null;
};

export type Book = {
  id: number;
  title: string;
  isbn: string;
  year: number | null;
  totalCopies: number;
  availableCopies: number;
  category: Pick<Category, 'id' | 'name'>;
  authors: Pick<Author, 'id' | 'name'>[];
};

export type Reader = {
  id: number;
  name: string;
  cpf: string;
  email: string | null;
  phone: string | null;
};

export type LoanStatus = 'ATIVO' | 'ATRASADO' | 'DEVOLVIDO';

export type Loan = {
  id: number;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  fine: number | string;
  book: Pick<Book, 'id' | 'title' | 'isbn'>;
  reader: Pick<Reader, 'id' | 'name' | 'cpf'>;
  user: Pick<User, 'id' | 'name'>;
};
