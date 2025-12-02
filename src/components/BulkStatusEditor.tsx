// src/components/BulkStatusEditor.tsx
import React, { useState, useEffect } from 'react';
import styles from '../modules/BulkStatusEditor.module.css';

export interface Technology {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending' | 'completed';
  category: string;
  description?: string;
}

interface BulkStatusEditorProps {
  technologies: Technology[];
  onStatusUpdate: (
    techIds: string[],
    newStatus: Technology['status']
  ) => Promise<void>;
}

export const BulkStatusEditor: React.FC<BulkStatusEditorProps> = ({
  technologies,
  onStatusUpdate,
}) => {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState<Technology['status']>('active');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Сбрасываем сообщение через 3 секунды
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleTechSelect = (techId: string) => {
    setSelectedTechs((prev) =>
      prev.includes(techId)
        ? prev.filter((id) => id !== techId)
        : [...prev, techId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTechs(
      selectedTechs.length === technologies.length
        ? []
        : technologies.map((tech) => tech.id)
    );
  };

  const handleStatusUpdate = async () => {
    if (selectedTechs.length === 0) {
      setMessage({ type: 'error', text: 'Выберите хотя бы одну технологию' });
      return;
    }

    setLoading(true);
    try {
      await onStatusUpdate(selectedTechs, newStatus);
      setMessage({
        type: 'success',
        text: `Статус обновлен для ${selectedTechs.length} технологий`,
      });
      setSelectedTechs([]);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Ошибка при обновлении статусов',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplayName = (status: Technology['status']) => {
    const statusMap = {
      active: 'Активная',
      inactive: 'Неактивная',
      pending: 'В ожидании',
      completed: 'Завершена',
    };
    return statusMap[status];
  };

  const getStatusColor = (status: Technology['status']) => {
    const colorMap = {
      active: '#4caf50',
      inactive: '#f44336',
      pending: '#ff9800',
      completed: '#2196f3',
    };
    return colorMap[status];
  };

  // Группируем технологии по категориям для лучшей организации
  const technologiesByCategory = technologies.reduce(
    (acc, tech) => {
      if (!acc[tech.category]) {
        acc[tech.category] = [];
      }
      acc[tech.category].push(tech);
      return acc;
    },
    {} as Record<string, Technology[]>
  );

  return (
    <div className={styles.bulkEditor}>
      <div className={styles.editorHeader}>
        <h2>Массовое редактирование статусов технологий</h2>
        <p className={styles.subtitle}>
          Выберите технологии и установите для них новый статус
        </p>
      </div>

      {message && (
        <div
          className={`${styles.message} ${styles[message.type]}`}
          role="alert"
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.statusControl}>
          <label htmlFor="status-select" className={styles.label}>
            Новый статус:
          </label>
          <select
            id="status-select"
            value={newStatus}
            onChange={(e) =>
              setNewStatus(e.target.value as Technology['status'])
            }
            className={styles.select}
            disabled={loading}
          >
            <option value="active">Активная</option>
            <option value="inactive">Неактивная</option>
            <option value="pending">В ожидании</option>
            <option value="completed">Завершена</option>
          </select>
        </div>

        <div className={styles.actionButtons}>
          <button
            onClick={handleSelectAll}
            className={styles.secondaryButton}
            disabled={loading || technologies.length === 0}
            type="button"
          >
            {selectedTechs.length === technologies.length
              ? 'Снять все'
              : 'Выбрать все'}
          </button>

          <button
            onClick={handleStatusUpdate}
            disabled={loading || selectedTechs.length === 0}
            className={styles.primaryButton}
            type="button"
          >
            {loading ? 'Обновление...' : `Обновить (${selectedTechs.length})`}
          </button>
        </div>
      </div>

      <div className={styles.techList}>
        {Object.entries(technologiesByCategory).map(
          ([category, categoryTechs]) => (
            <div key={category} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.techGrid}>
                {categoryTechs.map((tech) => (
                  <div
                    key={tech.id}
                    className={`${styles.techCard} ${
                      selectedTechs.includes(tech.id) ? styles.selected : ''
                    }`}
                  >
                    <label className={styles.techLabel}>
                      <input
                        type="checkbox"
                        checked={selectedTechs.includes(tech.id)}
                        onChange={() => handleTechSelect(tech.id)}
                        className={styles.checkbox}
                        disabled={loading}
                        aria-label={`Выбрать технологию ${tech.name}`}
                      />
                      <div className={styles.techInfo}>
                        <span className={styles.techName}>{tech.name}</span>
                        <span
                          className={styles.statusBadge}
                          style={{
                            backgroundColor: getStatusColor(tech.status),
                          }}
                        >
                          {getStatusDisplayName(tech.status)}
                        </span>
                      </div>
                      {tech.description && (
                        <p className={styles.techDescription}>
                          {tech.description}
                        </p>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {technologies.length === 0 && (
          <div className={styles.emptyState}>
            <p>Нет технологий для отображения</p>
          </div>
        )}
      </div>

      <div className={styles.selectionInfo}>
        <p>
          Выбрано: <strong>{selectedTechs.length}</strong> из{' '}
          <strong>{technologies.length}</strong> технологий
        </p>
      </div>
    </div>
  );
};
