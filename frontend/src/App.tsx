import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { EvaluacionPage } from './pages/EvaluacionPage';
import { EvaluacionesPage } from './pages/EvaluacionesPage';
import { HistorialGlobalPage } from './pages/HistorialGlobalPage';
import { HistorialPage } from './pages/HistorialPage';
import { IndicadoresPage } from './pages/IndicadoresPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { NuevaEvaluacionPage } from './pages/NuevaEvaluacionPage';
import { PredioDetallePage } from './pages/PredioDetallePage';
import { PredioFormPage } from './pages/PredioFormPage';
import { PrediosPage } from './pages/PrediosPage';
import { ReportePage } from './pages/ReportePage';
import { ResultadosPage } from './pages/ResultadosPage';
import { EvaluacionesBorradasPage } from './pages/EvaluacionesBorradasPage';
import { UsuariosPage } from './pages/UsuariosPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/evaluaciones/:id/reporte" element={<ReportePage />} />

        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/predios" element={<PrediosPage />} />
          <Route path="/predios/:id" element={<PredioDetallePage />} />
          <Route path="/evaluaciones" element={<EvaluacionesPage />} />
          <Route path="/evaluaciones/:id/resultados" element={<ResultadosPage />} />
          <Route path="/historial" element={<HistorialPage />} />

          <Route element={<ProtectedRoute roles={['ADMIN', 'EVALUADOR']} />}>
            <Route path="/predios/nuevo" element={<PredioFormPage />} />
            <Route path="/predios/:id/editar" element={<PredioFormPage />} />
            <Route path="/evaluaciones/nueva" element={<NuevaEvaluacionPage />} />
            <Route path="/evaluaciones/borradas" element={<EvaluacionesBorradasPage />} />
            <Route path="/evaluaciones/:id" element={<EvaluacionPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/historial-global" element={<HistorialGlobalPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/indicadores" element={<IndicadoresPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      <Route path="/inicio" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
