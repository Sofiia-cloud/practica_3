// src/components/TechnologiesPage.tsx
import React, { useState, useEffect } from 'react';
import { BulkStatusEditor, Technology } from './BulkStatusEditor';
import { DataManager } from './DataManager';
import styles from '../modules/TechnologiesPage.module.css';

export const TechnologiesPage: React.FC = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка технологий (в реальном приложении - из API)
  useEffect(() => {
    const loadTechnologies = async () => {
      // Имитация загрузки
      setTimeout(() => {
        const mockTechnologies: Technology[] = [
          {
            id: '1',
            name: 'React',
            status: 'active',
            category: 'Frontend',
            description:
              'JavaScript библиотека для создания пользовательских интерфейсов',
          },
          {
            id: '2',
            name: 'Vue.js',
            status: 'active',
            category: 'Frontend',
            description:
              'Прогрессивный фреймворк для создания пользовательских интерфейсов',
          },
          {
            id: '3',
            name: 'Angular',
            status: 'pending',
            category: 'Frontend',
            description:
              'Платформа для построения мобильных и десктопных веб-приложений',
          },
          {
            id: '4',
            name: 'Node.js',
            status: 'active',
            category: 'Backend',
            description: 'JavaScript среда выполнения на движке V8',
          },
          {
            id: '5',
            name: 'Express.js',
            status: 'completed',
            category: 'Backend',
            description: 'Минималистичный веб-фреймворк для Node.js',
          },
          {
            id: '6',
            name: 'Django',
            status: 'inactive',
            category: 'Backend',
            description: 'Фреймворк для веб-приложений на Python',
          },
          {
            id: '7',
            name: 'TypeScript',
            status: 'active',
            category: 'Language',
            description: 'Статически типизированное надмножество JavaScript',
          },
          {
            id: '8',
            name: 'Python',
            status: 'active',
            category: 'Language',
            description:
              'Высокоуровневый язык программирования общего назначения',
          },
        ];
        setTechnologies(mockTechnologies);
        setLoading(false);
      }, 1000);
    };

    loadTechnologies();
  }, []);

  const handleStatusUpdate = async (
    techIds: string[],
    newStatus: Technology['status']
  ) => {
    // Имитация API запроса
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setTechnologies((prevTechs) =>
          prevTechs.map((tech) =>
            techIds.includes(tech.id) ? { ...tech, status: newStatus } : tech
          )
        );
        resolve();
      }, 500);
    });
  };

  const handleImport = async (importedTechs: Technology[]) => {
    // Имитация API запроса
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setTechnologies(importedTechs);
        resolve();
      }, 500);
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка технологий...</p>
      </div>
    );
  }

  return (
    <div className={styles.technologiesPage}>
      <div className={styles.pageHeader}>
        <h1>Управление технологиями</h1>
        <p>Массовое редактирование статусов и управление данными</p>
      </div>

      <DataManager technologies={technologies} onImport={handleImport} />

      <BulkStatusEditor
        technologies={technologies}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};
