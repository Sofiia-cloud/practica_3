// src/components/DataManager.tsx
import React, { useState, useRef } from 'react';
import styles from '../modules/DataManager.module.css';
import { Technology } from './BulkStatusEditor';

interface DataManagerProps {
  technologies: Technology[];
  onImport: (data: Technology[]) => Promise<void>;
}

export const DataManager: React.FC<DataManagerProps> = ({
  technologies,
  onImport,
}) => {
  const [importLoading, setImportLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const validateTechnology = (tech: any): tech is Technology => {
    return (
      typeof tech === 'object' &&
      typeof tech.id === 'string' &&
      typeof tech.name === 'string' &&
      typeof tech.status === 'string' &&
      ['active', 'inactive', 'pending', 'completed'].includes(tech.status) &&
      typeof tech.category === 'string'
    );
  };

  const validateImportData = (data: any): data is Technology[] => {
    if (!Array.isArray(data)) {
      throw new Error('Данные должны быть массивом');
    }

    if (data.length === 0) {
      throw new Error('Файл не содержит данных');
    }

    const invalidItems = data.filter((item) => !validateTechnology(item));
    if (invalidItems.length > 0) {
      throw new Error(`Найдено ${invalidItems.length} некорректных записей`);
    }

    return true;
  };

  // Вспомогательная функция для получения уникальных категорий
  const getUniqueCategories = (techs: Technology[]): string[] => {
    const categories = new Set<string>();
    techs.forEach((tech) => categories.add(tech.category));
    return Array.from(categories);
  };

  const handleExport = () => {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        technologies: technologies,
        metadata: {
          totalTechnologies: technologies.length,
          categories: getUniqueCategories(technologies),
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `technologies-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage(
        'success',
        `Экспортировано ${technologies.length} технологий`
      );
    } catch (error) {
      console.error('Export error:', error);
      showMessage('error', 'Ошибка при экспорте данных');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.name.endsWith('.json')) {
      showMessage('error', 'Файл должен быть в формате JSON');
      return;
    }

    setImportLoading(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Валидация структуры файла
      if (!data.technologies || !Array.isArray(data.technologies)) {
        throw new Error(
          'Неверный формат файла: отсутствует массив technologies'
        );
      }

      // Валидация каждой технологии
      validateImportData(data.technologies);

      // Подтверждение импорта
      if (
        !window.confirm(
          `Импортировать ${data.technologies.length} технологий? Существующие данные будут заменены.`
        )
      ) {
        return;
      }

      await onImport(data.technologies);
      showMessage(
        'success',
        `Успешно импортировано ${data.technologies.length} технологий`
      );

      // Сбрасываем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      if (error instanceof SyntaxError) {
        showMessage(
          'error',
          'Ошибка формата JSON: файл поврежден или имеет неверный формат'
        );
      } else if (error instanceof Error) {
        showMessage('error', `Ошибка импорта: ${error.message}`);
      } else {
        showMessage('error', 'Неизвестная ошибка при импорте');
      }
    } finally {
      setImportLoading(false);
    }
  };

  const uniqueCategoriesCount = getUniqueCategories(technologies).length;
  const activeCount = technologies.filter((t) => t.status === 'active').length;

  return (
    <div className={styles.dataManager}>
      <div className={styles.managerHeader}>
        <h2>Управление данными технологий</h2>
        <p className={styles.subtitle}>
          Экспортируйте и импортируйте данные в формате JSON
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

      <div className={styles.actions}>
        <div className={styles.exportSection}>
          <h3>Экспорт данных</h3>
          <p>Скачайте текущие данные в формате JSON</p>
          <div className={styles.exportButtons}>
            <button
              onClick={handleExport}
              className={styles.exportButton}
              disabled={technologies.length === 0}
            >
              Экспортировать ({technologies.length})
            </button>
          </div>
        </div>

        <div className={styles.importSection}>
          <h3>Импорт данных</h3>
          <p>Загрузите данные из JSON файла</p>
          <div className={styles.importArea}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className={styles.fileInput}
              id="import-file"
              disabled={importLoading}
            />
            <label
              htmlFor="import-file"
              className={`${styles.importButton} ${importLoading ? styles.loading : ''}`}
            >
              {importLoading ? '⏳ Загрузка...' : 'Выбрать файл для импорта'}
            </label>
          </div>
          <div className={styles.importInfo}>
            <p>
              <strong>Формат файла:</strong> JSON с массивом technologies
            </p>
            <p>
              <strong>Поддерживаемые статусы:</strong> active, inactive,
              pending, completed
            </p>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <h3>Статистика данных</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{technologies.length}</span>
            <span className={styles.statLabel}>Всего технологий</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{uniqueCategoriesCount}</span>
            <span className={styles.statLabel}>Категорий</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{activeCount}</span>
            <span className={styles.statLabel}>Активных</span>
          </div>
        </div>
      </div>
    </div>
  );
};
