import { Navigate, useParams } from 'react-router-dom';

/** /learning-paths/<id> → /learning-paths#<id>: a trilha é uma seção da tela HTML. */
export function LearningPathRedirect() {
  const { pathId } = useParams();
  return <Navigate to={`/learning-paths${pathId ? `#${pathId}` : ''}`} replace />;
}
