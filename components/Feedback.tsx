export function Feedback({ error, success }: { error?: string | null; success?: string | null }) {
  return (
    <>
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {success && <p className="alert alert-success" role="status">{success}</p>}
    </>
  );
}
