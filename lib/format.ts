const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatCurrency(value: number | string) {
  return currency.format(Number(value));
}

// YYYY-MM-DD para DD/MM/YYYY. Sem new Date(): ele leria a data como UTC e, no
// fuso do Brasil, mostraria o dia anterior.
export function formatDate(date: string | null) {
  if (!date) {
    return '-';
  }
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function formatCpf(cpf: string) {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}
