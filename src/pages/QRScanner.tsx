
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Flashlight,
  History,
  Info,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";



type ScannerStatus =
  | "idle"
  | "starting"
  | "scanning"
  | "success"
  | "error";

interface ScanHistoryItem {
  id: string;
  value: string;
  scannedAt: Date;
}

const QR_REGION_ID = "labguardian-qr-reader";

export default function QRScanner() {
  const navigate = useNavigate();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);

  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [cameraPermissionDenied, setCameraPermissionDenied] =
    useState(false);
  const [copied, setCopied] = useState(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;

    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (stopError) {
      console.warn("No se pudo detener el escáner:", stopError);
    }

    try {
      scanner.clear();
    } catch {
      // El contenedor puede haberse desmontado.
    }

    if (scannerRef.current === scanner) {
      scannerRef.current = null;
    }
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (processingRef.current || !mountedRef.current) return;

      processingRef.current = true;

      setResult(decodedText);
      setStatus("success");
      setError("");

      setHistory((previous) => {
        const newItem: ScanHistoryItem = {
          id: `${Date.now()}-${Math.random()}`,
          value: decodedText,
          scannedAt: new Date(),
        };

        return [newItem, ...previous].slice(0, 10);
      });

      await stopScanner();
    },
    [stopScanner],
  );

  const startScanner = useCallback(async () => {
    if (!mountedRef.current) return;

    setError("");
    setResult("");
    setCopied(false);
    setCameraPermissionDenied(false);
    setStatus("starting");
    processingRef.current = false;

    await stopScanner();

    try {
      const scanner = new Html5Qrcode(QR_REGION_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();

      if (!mountedRef.current) {
        scanner.clear();
        return;
      }

      if (!cameras.length) {
        throw new Error("No se encontraron cámaras disponibles.");
      }

      const preferredCamera =
        cameras.find((camera) =>
          /back|rear|environment|trasera|posterior/i.test(camera.label),
        ) ?? cameras[0];

      await scanner.start(
        preferredCamera.id,
        {
          fps: 10,
          qrbox: {
            width: 240,
            height: 240,
          },
          aspectRatio: 1,
        },
        (decodedText) => {
          void handleScanSuccess(decodedText);
        },
        () => {
          // Los errores de lectura individuales son normales
          // mientras la cámara busca un código QR.
        },
      );

      if (mountedRef.current && !processingRef.current) {
        setStatus("scanning");
      }
    } catch (scannerError) {
      console.error("Error al iniciar el escáner:", scannerError);

      if (!mountedRef.current) return;

      const message =
        scannerError instanceof Error
          ? scannerError.message
          : "No fue posible iniciar la cámara.";

      const permissionError =
        /permission|notallowed|denied|permiso/i.test(message);

      setCameraPermissionDenied(permissionError);
      setError(
        permissionError
          ? "No se concedió permiso para acceder a la cámara. Habilita el acceso desde la configuración del navegador."
          : message,
      );
      setStatus("error");

      await stopScanner();
    }
  }, [handleScanSuccess, stopScanner]);

  const handleReset = async () => {
    processingRef.current = false;
    setResult("");
    setError("");
    setCopied(false);
    await startScanner();
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);

      window.setTimeout(() => {
        if (mountedRef.current) setCopied(false);
      }, 2000);
    } catch {
      setError("No fue posible copiar el contenido del código QR.");
    }
  };

  const handleOpenResult = () => {
    if (!result) return;

    try {
      const url = new URL(result);

      if (url.protocol === "http:" || url.protocol === "https:") {
        window.open(url.toString(), "_blank", "noopener,noreferrer");
      }
    } catch {
      // El contenido no es una URL.
    }
  };

  const isUrl = (() => {
    try {
      const url = new URL(result);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  })();

  const handleViewSample = () => {
    if (!result) return;

    const sampleId = result.trim();

    navigate(`/samples?search=${encodeURIComponent(sampleId)}`);
  };

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      const scanner = scannerRef.current;

      if (scanner) {
        if (scanner.isScanning) {
          void scanner
            .stop()
            .then(() => scanner.clear())
            .catch(() => {
              // Limpieza al desmontar el componente.
            });
        } else {
          try {
            scanner.clear();
          } catch {
            // El escáner ya fue liberado.
          }
        }

        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <PageContainer
      title="Escáner QR"
      description="Identifica muestras y consulta su trazabilidad mediante códigos QR."
      eyebrow="IDENTIFICACIÓN Y TRAZABILIDAD"
      className="qr-scanner-page"
      actions={
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          Regresar
        </Button>
      }
    >
      <div className="qr-scanner-page__content">
        {/* Información superior */}
        <section className="qr-scanner-page__intro">
          <div className="qr-scanner-page__intro-icon">
            <QrCode size={25} />
          </div>

          <div className="qr-scanner-page__intro-text">
            <h2>Identificación inteligente</h2>
            <p>
              Escanea el código QR de una muestra para identificarla
              rápidamente dentro del laboratorio.
            </p>
          </div>

          <Badge
            variant={
              status === "scanning"
                ? "success"
                : status === "error"
                  ? "danger"
                  : "neutral"
            }
            dot
          >
            {status === "scanning"
              ? "Cámara activa"
              : status === "starting"
                ? "Iniciando cámara"
                : status === "success"
                  ? "Código detectado"
                  : status === "error"
                    ? "Error de cámara"
                    : "En espera"}
          </Badge>
        </section>

        <div className="qr-scanner-page__grid">
          {/* Panel del escáner */}
          <Card
            className="qr-scanner-page__scanner-card"
            padding="none"
            title="Lector de códigos QR"
            description="Coloca el código dentro del área de escaneo."
            headerIcon={<ScanLine size={19} />}
            actions={
              <Badge variant="info">
                <Camera size={12} />
                Escaneo en tiempo real
              </Badge>
            }
          >
            <div className="qr-scanner-page__scanner-body">
              <div
                className={`qr-scanner-page__camera ${
                  status === "scanning"
                    ? "qr-scanner-page__camera--active"
                    : ""
                }`}
              >
                <div
                  id={QR_REGION_ID}
                  className="qr-scanner-page__reader"
                />

                {status === "idle" && (
                  <div className="qr-scanner-page__camera-placeholder">
                    <div className="qr-scanner-page__camera-placeholder-icon">
                      <Camera size={34} />
                    </div>
                    <strong>Cámara desactivada</strong>
                    <span>
                      Inicia el escáner para comenzar a identificar muestras.
                    </span>
                  </div>
                )}

                {status === "starting" && (
                  <div className="qr-scanner-page__camera-overlay">
                    <LoaderCircle
                      size={32}
                      className="qr-scanner-page__spinner"
                    />
                    <strong>Iniciando cámara...</strong>
                    <span>Solicitando acceso al dispositivo.</span>
                  </div>
                )}

                {status === "error" && (
                  <div className="qr-scanner-page__camera-placeholder">
                    <div className="qr-scanner-page__camera-placeholder-icon qr-scanner-page__camera-placeholder-icon--error">
                      <CameraOff size={34} />
                    </div>
                    <strong>No se pudo iniciar la cámara</strong>
                    <span>
                      {cameraPermissionDenied
                        ? "Revisa los permisos de cámara de tu navegador."
                        : "Comprueba que exista una cámara disponible."}
                    </span>
                  </div>
                )}

                {status === "scanning" && (
                  <div className="qr-scanner-page__scan-instruction">
                    <span className="qr-scanner-page__scan-line" />
                    <span>Coloca el código dentro del recuadro</span>
                  </div>
                )}

                {status === "success" && (
                  <div className="qr-scanner-page__success-overlay">
                    <CheckCircle2 size={44} />
                    <strong>Código QR detectado</strong>
                  </div>
                )}
              </div>

              {error && (
                <div className="qr-scanner-page__error">
                  <XCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="qr-scanner-page__controls">
                {status === "idle" || status === "error" ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<Camera size={18} />}
                    onClick={() => void startScanner()}
                  >
                    Activar cámara
                  </Button>
                ) : status === "starting" ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    disabled
                    loading
                  >
                    Iniciando...
                  </Button>
                ) : status === "scanning" ? (
                  <Button
                    variant="danger"
                    size="lg"
                    fullWidth
                    leftIcon={<CameraOff size={18} />}
                    onClick={() => {
                      void stopScanner();
                      setStatus("idle");
                    }}
                  >
                    Detener escáner
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<RefreshCw size={17} />}
                    onClick={() => void handleReset()}
                  >
                    Escanear otro código
                  </Button>
                )}
              </div>

              <div className="qr-scanner-page__camera-tip">
                <Info size={15} />
                <span>
                  Para utilizar la cámara, permite el acceso cuando el
                  navegador lo solicite. Se requiere HTTPS o localhost.
                </span>
              </div>
            </div>
          </Card>

          {/* Resultado */}
          <div className="qr-scanner-page__side">
            <Card
              title="Resultado del escaneo"
              description="Información obtenida del código QR."
              headerIcon={<ShieldCheck size={19} />}
              className="qr-scanner-page__result-card"
            >
              {status === "success" && result ? (
                <div className="qr-scanner-page__result">
                  <div className="qr-scanner-page__result-success">
                    <div className="qr-scanner-page__result-icon">
                      <CheckCircle2 size={23} />
                    </div>

                    <div>
                      <strong>Lectura completada</strong>
                      <span>El código QR se identificó correctamente.</span>
                    </div>
                  </div>

                  <div className="qr-scanner-page__result-field">
                    <label>Contenido del código</label>
                    <div className="qr-scanner-page__result-value">
                      <span>{result}</span>
                      <button
                        type="button"
                        onClick={() => void handleCopy()}
                        title="Copiar contenido"
                        aria-label="Copiar contenido"
                      >
                        {copied ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <Clipboard size={17} />
                        )}
                      </button>
                    </div>

                    {copied && (
                      <span className="qr-scanner-page__copied">
                        Contenido copiado
                      </span>
                    )}
                  </div>

                  <div className="qr-scanner-page__result-actions">
                    <Button
                      variant="primary"
                      fullWidth
                      leftIcon={<QrCode size={17} />}
                      onClick={handleViewSample}
                    >
                      Buscar muestra
                    </Button>

                    {isUrl && (
                      <Button
                        variant="outline"
                        fullWidth
                        leftIcon={<ExternalLink size={16} />}
                        onClick={handleOpenResult}
                      >
                        Abrir enlace
                      </Button>
                    )}
                  </div>

                  <div className="qr-scanner-page__result-note">
                    <Info size={15} />
                    <span>
                      El contenido se ha leído correctamente. La búsqueda
                      de la muestra se realiza en el inventario del sistema.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="qr-scanner-page__result-empty">
                  <div className="qr-scanner-page__result-empty-icon">
                    <QrCode size={32} />
                  </div>

                  <strong>Sin resultados todavía</strong>

                  <p>
                    Cuando escanees un código QR, su contenido aparecerá
                    aquí para que puedas consultarlo.
                  </p>
                </div>
              )}
            </Card>

            {/* Instrucciones */}
            <Card
              title="¿Cómo utilizarlo?"
              description="Sigue estos sencillos pasos."
              headerIcon={<Info size={18} />}
              className="qr-scanner-page__instructions"
            >
              <div className="qr-scanner-page__steps">
                <div className="qr-scanner-page__step">
                  <span className="qr-scanner-page__step-number">01</span>
                  <div>
                    <strong>Activa la cámara</strong>
                    <p>Permite el acceso a la cámara del dispositivo.</p>
                  </div>
                </div>

                <div className="qr-scanner-page__step">
                  <span className="qr-scanner-page__step-number">02</span>
                  <div>
                    <strong>Enfoca el código QR</strong>
                    <p>
                      Mantén el código visible dentro del área de escaneo.
                    </p>
                  </div>
                </div>

                <div className="qr-scanner-page__step">
                  <span className="qr-scanner-page__step-number">03</span>
                  <div>
                    <strong>Consulta la muestra</strong>
                    <p>
                      Revisa el contenido detectado y busca la muestra
                      correspondiente.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Historial */}
        <Card
          title="Historial de escaneos"
          description="Últimos códigos QR leídos durante esta sesión."
          headerIcon={<History size={19} />}
          actions={
            history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X size={15} />}
                onClick={() => setHistory([])}
              >
                Limpiar historial
              </Button>
            )
          }
          className="qr-scanner-page__history-card"
        >
          {history.length > 0 ? (
            <div className="qr-scanner-page__history">
              {history.map((item, index) => (
                <div
                  className="qr-scanner-page__history-item"
                  key={item.id}
                >
                  <div className="qr-scanner-page__history-icon">
                    <QrCode size={18} />
                  </div>

                  <div className="qr-scanner-page__history-info">
                    <strong>
                      {item.value.length > 55
                        ? `${item.value.substring(0, 55)}...`
                        : item.value}
                    </strong>
                    <span>
                      {item.scannedAt.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>

                  <Badge variant="success" size="sm">
                    Escaneado
                  </Badge>

                  <button
                    type="button"
                    className="qr-scanner-page__history-action"
                    title="Consultar resultado"
                    onClick={() => {
                      setResult(item.value);
                      setStatus("success");
                      processingRef.current = true;
                    }}
                  >
                    <ExternalLink size={16} />
                  </button>

                  <span className="qr-scanner-page__history-index">
                    #{history.length - index}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="qr-scanner-page__history-empty">
              <History size={23} />
              <span>Aún no hay códigos escaneados en esta sesión.</span>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
