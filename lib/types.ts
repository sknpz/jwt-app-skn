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
