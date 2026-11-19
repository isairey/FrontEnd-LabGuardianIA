
// src/pages/Equipment.tsx

import { useCallback, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Plus,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";

import EquipmentTable, {
  type EquipmentData,
} from "../components/equipment/EquipmentTable";

import { useEquipment } from "../hooks/useEquipment";

import "./equipment.css";

export default function Equipment() {
  const navigate = useNavigate();

  const {
    equipment,
    loading,
    error,
    fetchEquipment,
    deleteEquipment,
  } = useEquipment({
    autoFetch: true,
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const equipmentList = equipment ?? [];

  const statistics = useMemo(() => {
    const total = equipmentList.length;

    const operational = equipmentList.filter((item) =>
      ["operational", "available", "active"].includes(
        item.status?.toLowerCase() ?? "",
      ),
    ).length;

    const maintenance = equipmentList.filter((item) =>
      ["maintenance", "under_maintenance", "calibration", "calibrating"].includes(
        item.status?.toLowerCase() ?? "",
      ),
    ).length;

    const unavailable = equipmentList.filter((item) =>
      ["out_of_service", "inactive", "offline", "disabled"].includes(
        item.status?.toLowerCase() ?? "",
      ),
    ).length;

    return {
      total,
      operational,
      maintenance,
      unavailable,
    };
  }, [equipmentList]);

  const handleRefresh = useCallback(async () => {
    await fetchEquipment();
  }, [fetchEquipment]);

  const handleView = useCallback(
    (item: EquipmentData) => {
      navigate(`/equipment/${item.id}`);
    },
    [navigate],
  );

  const handleEdit = useCallback(
    (item: EquipmentData) => {
      navigate(`/equipment/${item.id}/edit`);
    },
    [navigate],
  );

  const handleDelete = useCallback(
    async (item: EquipmentData) => {
      const confirmed = window.confirm(
        `¿Estás seguro de eliminar el equipo "${item.name}" (${item.code})? Esta acción no se puede deshacer.`,
      );

      if (!confirmed) return;

      try {
        setDeletingId(item.id);
        await deleteEquipment(item.id);
      } catch (deleteError) {
        console.error("Error al eliminar el equipo:", deleteError);
        window.alert(
          "No fue posible eliminar el equipo. Inténtalo nuevamente.",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [deleteEquipment],
  );

  const handleCreate = () => {
    navigate("/equipment/new");
  };

  const isLoading =
    typeof loading === "boolean"
      ? loading
      : Boolean(loading?.list ?? loading?.equipment);

  return (
    <PageContainer
      title="Equipamiento"
      description="Administra los equipos del laboratorio, supervisa su disponibilidad y controla sus mantenimientos."
      eyebrow="GESTIÓN DEL LABORATORIO"
      className="equipment-page"
      actions={
        <div className="equipment-page__header-actions">
          <Button
            variant="outline"
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            leftIcon={<Plus size={17} />}
            onClick={handleCreate}
          >
            Registrar equipo
          </Button>
        </div>
      }
    >
      <div className="equipment-page__content">
        {/* Indicadores */}
        <section
          className="equipment-page__stats"
          aria-label="Resumen del equipamiento"
        >
          <Card className="equipment-page__stat-card">
            <div className="equipment-page__stat">
              <div className="equipment-page__stat-icon equipment-page__stat-icon--primary">
                <ClipboardList size={21} />
              </div>

              <div className="equipment-page__stat-info">
                <span className="equipment-page__stat-label">
                  Total de equipos
                </span>

                <strong className="equipment-page__stat-value">
                  {isLoading ? "—" : statistics.total}
                </strong>

                <span className="equipment-page__stat-description">
                  Equipos registrados
                </span>
              </div>
            </div>
          </Card>

          <Card className="equipment-page__stat-card">
            <div className="equipment-page__stat">
              <div className="equipment-page__stat-icon equipment-page__stat-icon--success">
                <CheckCircle2 size={21} />
              </div>

              <div className="equipment-page__stat-info">
                <span className="equipment-page__stat-label">
                  Operativos
                </span>

                <strong className="equipment-page__stat-value">
                  {isLoading ? "—" : statistics.operational}
                </strong>

                <span className="equipment-page__stat-description">
                  Disponibles para uso
                </span>
              </div>
            </div>
          </Card>

          <Card className="equipment-page__stat-card">
            <div className="equipment-page__stat">
              <div className="equipment-page__stat-icon equipment-page__stat-icon--warning">
                <Wrench size={21} />
              </div>

              <div className="equipment-page__stat-info">
                <span className="equipment-page__stat-label">
                  En mantenimiento
                </span>

                <strong className="equipment-page__stat-value">
                  {isLoading ? "—" : statistics.maintenance}
                </strong>

                <span className="equipment-page__stat-description">
                  Requieren atención técnica
                </span>
              </div>
            </div>
          </Card>

          <Card className="equipment-page__stat-card">
            <div className="equipment-page__stat">
              <div className="equipment-page__stat-icon equipment-page__stat-icon--danger">
                <AlertTriangle size={21} />
              </div>

              <div className="equipment-page__stat-info">
                <span className="equipment-page__stat-label">
                  Fuera de servicio
                </span>

                <strong className="equipment-page__stat-value">
                  {isLoading ? "—" : statistics.unavailable}
                </strong>

                <span className="equipment-page__stat-description">
                  No disponibles actualmente
                </span>
              </div>
            </div>
          </Card>
        </section>

        {/* Avisos */}
        {statistics.maintenance > 0 && !isLoading && (
          <div className="equipment-page__notice">
            <div className="equipment-page__notice-icon">
              <CalendarClock size={19} />
            </div>

            <div className="equipment-page__notice-content">
              <strong>Equipos que requieren atención</strong>
              <span>
                Hay {statistics.maintenance} equipo(s) en mantenimiento,
                calibración o revisión.
              </span>
            </div>

            <Badge variant="warning" size="md">
              Atención
            </Badge>
          </div>
        )}

        {/* Error general */}
        {error && (
          <ErrorMessage
            title="No se pudo cargar el equipamiento"
            message={
              typeof error === "string"
                ? error
                : "Ocurrió un problema al obtener los equipos del laboratorio."
            }
            onRetry={handleRefresh}
          />
        )}

        {/* Tabla principal */}
        <Card
          className="equipment-page__table-card"
          padding="none"
          title="Inventario de equipos"
          description="Consulta, filtra y administra los equipos registrados en el laboratorio."
          headerIcon={<Activity size={19} />}
          actions={
            <Badge variant="info" size="md">
              {statistics.total} equipos
            </Badge>
          }
        >
          {isLoading && equipmentList.length === 0 ? (
            <div className="equipment-page__loading">
              <LoadingSpinner
                size="lg"
                text="Cargando equipamiento..."
                centered
              />
            </div>
          ) : error && equipmentList.length === 0 ? (
            <div className="equipment-page__empty">
              <EmptyState
                title="No se pudo cargar el inventario"
                description="Comprueba la conexión con el servidor e inténtalo nuevamente."
                icon={AlertTriangle}
                variant="error"
                action={{
                  label: "Reintentar",
                  onClick: handleRefresh,
                }}
              />
            </div>
          ) : (
            <EquipmentTable
              equipment={equipmentList}
              loading={isLoading}
              onRetry={handleRefresh}
              onRefresh={handleRefresh}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              title=""
              description=""
              pageSize={10}
              showSearch
              showFilters
              emptyMessage="No hay equipos registrados. Registra el primer equipo para comenzar a administrar el inventario."
              toolbarActions={
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={15} />}
                  onClick={handleCreate}
                >
                  Nuevo equipo
                </Button>
              }
            />
          )}
        </Card>

        {/* Estado del inventario */}
        {!isLoading && equipmentList.length > 0 && (
          <div className="equipment-page__footer">
            <div className="equipment-page__footer-indicator">
              <span className="equipment-page__footer-dot" />
              <span>Inventario sincronizado</span>
            </div>

            <span>
              {statistics.operational} de {statistics.total} equipos operativos
            </span>
          </div>
        )}

        {deletingId !== null && (
          <div className="equipment-page__delete-status">
            <LoadingSpinner size="sm" text="Eliminando equipo..." />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
