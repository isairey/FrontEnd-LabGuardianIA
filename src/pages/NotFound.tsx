
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  Home,
  SearchX,
  ShieldAlert,
} from "lucide-react";

import Button from "../components/common/Button";


export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleGoHome = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <main className="not-found">
      <div className="not-found__container">
        {/* Identidad de la aplicación */}
        <div className="not-found__brand">
          <div className="not-found__brand-icon">
            <FlaskConical size={22} strokeWidth={2.2} />
          </div>

          <span>
            LabGuardian<span className="not-found__brand-accent"> AI</span>
          </span>
        </div>

        {/* Ilustración */}
        <div className="not-found__illustration">
          <div className="not-found__circle not-found__circle--outer" />
          <div className="not-found__circle not-found__circle--inner" />

          <div className="not-found__illustration-icon">
            <SearchX size={66} strokeWidth={1.35} />
          </div>

          <div className="not-found__floating-icon not-found__floating-icon--one">
            <ShieldAlert size={21} />
          </div>

          <div className="not-found__floating-icon not-found__floating-icon--two">
            <FlaskConical size={19} />
          </div>

          <span className="not-found__error-code">404</span>
        </div>

        {/* Mensaje */}
        <div className="not-found__content">
          <span className="not-found__eyebrow">
            <span className="not-found__eyebrow-dot" />
            ERROR DE NAVEGACIÓN
          </span>

          <h1>
            Página no <span>encontrada</span>
          </h1>

          <p className="not-found__description">
            Lo sentimos, la página que estás buscando no existe, fue movida
            o la dirección que ingresaste es incorrecta.
          </p>

          <div className="not-found__actions">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Home size={18} />}
              rightIcon={<ArrowRight size={17} />}
              onClick={handleGoHome}
            >
              Ir al dashboard
            </Button>

            <Button
              variant="outline"
              size="lg"
              leftIcon={<ArrowLeft size={17} />}
              onClick={handleGoBack}
            >
              Regresar
            </Button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="not-found__footer">
          <div className="not-found__footer-divider" />

          <div className="not-found__footer-content">
            <span>LabGuardian AI</span>
            <span className="not-found__footer-separator">·</span>
            <span>Sistema de gestión y trazabilidad de laboratorio</span>
          </div>
        </div>
      </div>
    </main>
  );
}
