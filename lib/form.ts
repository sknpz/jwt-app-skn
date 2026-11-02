// Lê os campos do formulário. Campo vazio vira null: para a API, "" num e-mail ou
// numa data seria um valor inválido, e null significa "não informado".
export function formValues(form: HTMLFormElement) {
  const values: Record<string, FormDataEntryValue | null> = {};
  new FormData(form).forEach((value, key) => {
    values[key] = value === '' ? null : value;
  });
  return values;
}

// Monta a URL de busca deixando de fora os filtros vazios.
export function withQuery(path: string, params: Record<string, string>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}
