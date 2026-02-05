import { Navigate } from "react-router-dom";
import { isAuthed } from "../services/mockAuth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!isAuthed()) return <Navigate to="/" replace />;
  return children;
}