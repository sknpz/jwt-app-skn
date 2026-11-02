'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Feedback } from '@/components/Feedback';
import { formValues, withQuery } from '@/lib/form';
import { useAction, useApiList } from '@/lib/hooks';
import api from '@/lib/http';
import type { Author, Book, Category } from '@/lib/types';

export default function BooksPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const booksUrl = withQuery('/books', {
    title,
    categoryId,
    authorId,
    available: onlyAvailable ? 'true' : '',
  });
  const { items: books, loading, error, reload } = useApiList<Book>(booksUrl);
  const { items: categories } = useApiList<Category>('/categories');
  const { items: authors } = useApiList<Author>('/authors');

  const [editing, setEditing] = useState<Book | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const action = useAction();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = {
      ...formValues(form),
      // Vários checkboxes com o mesmo nome: getAll traz todos os marcados.
      authorIds: new FormData(form).getAll('authorIds').map(Number),
    };
    const saved = await action.run(async () => {
      if (editing) {
        await api.put(`/books/${editing.id}`, data);
        return 'Livro atualizado';
      }
      await api.post('/books', data);
      return 'Livro cadastrado';
    });
    if (saved) {
      setEditing(null);
      setFormVersion((current) => current + 1);
      reload();
    }
  }

  async function remove(book: Book) {
    if (!window.confirm(`Excluir o livro "${book.title}"?`)) {
      return;
    }
    const removed = await action.run(async () => {
      await api.delete(`/books/${book.id}`);
      return 'Livro excluído';
    });
    if (removed) {
      reload();
    }
  }

  return (
    <>
      <h1>Livros</h1>
      <Feedback error={action.error || error} success={action.success} />

      {user?.isAdmin && (
        <section className="panel">
          <h2>{editing ? `Editar: ${editing.title}` : 'Novo livro'}</h2>
          <form key={`${editing?.id ?? 'new'}-${formVersion}`} onSubmit={save} className="form-grid">
            <label className="field">
              Título
              <input name="title" defaultValue={editing?.title} required />
            </label>
            <label className="field">
              ISBN
              <input name="isbn" defaultValue={editing?.isbn} required />
            </label>
            <label className="field">
              Ano
              <input name="year" type="number" defaultValue={editing?.year ?? ''} />
            </label>
            <label className="field">
              Total de exemplares
              <input name="totalCopies" type="number" min="0" defaultValue={editing?.totalCopies ?? 1} required />
            </label>
            <label className="field">
              Categoria
              <select name="categoryId" defaultValue={editing?.category.id ?? ''} required>
                <option value="" disabled>Selecione</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <fieldset className="field checks">
              <legend>Autores</legend>
              {authors.map((author) => (
                <label key={author.id} className="check">
                  <input
                    type="checkbox"
                    name="authorIds"
                    value={author.id}
                    defaultChecked={editing?.authors.some((bookAuthor) => bookAuthor.id === author.id)}
                  />
                  {author.name}
                </label>
              ))}
              {authors.length === 0 && <span className="hint">Cadastre um autor primeiro.</span>}
            </fieldset>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={action.pending}>Salvar</button>
              {editing && <button type="button" className="btn" onClick={() => setEditing(null)}>Cancelar</button>}
            </div>
          </form>
        </section>
      )}

      <section className="panel filters" aria-label="Filtros">
        <label className="field">
          Buscar por título
          <input name="search-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          Categoria
          <select name="filter-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Autor
          <select name="filter-author" value={authorId} onChange={(event) => setAuthorId(event.target.value)}>
            <option value="">Todos</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>{author.name}</option>
            ))}
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            name="filter-available"
            checked={onlyAvailable}
            onChange={(event) => setOnlyAvailable(event.target.checked)}
          />
          Só com exemplar disponível
        </label>
      </section>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>ISBN</th>
              <th>Ano</th>
              <th>Categoria</th>
              <th>Autores</th>
              <th>Disponíveis</th>
              {user?.isAdmin && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.isbn}</td>
                <td>{book.year ?? '-'}</td>
                <td>{book.category.name}</td>
                <td>{book.authors.map((author) => author.name).sort().join(', ')}</td>
                <td>{book.availableCopies} de {book.totalCopies}</td>
                {user?.isAdmin && (
                  <td className="actions">
                    <button type="button" className="btn" onClick={() => setEditing(book)}>Editar</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(book)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="table-note">Carregando...</p>}
        {!loading && books.length === 0 && <p className="table-note">Nenhum livro encontrado.</p>}
      </div>
    </>
  );
}
