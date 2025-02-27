/**
 * Модуль проверки плагиата с использованием алгоритма "размытого шингла"
 */

class PlagiarismChecker {
    /**
     * Создаёт экземпляр проверки плагиата
     * @param {number} windowSize - Размер окна для анализа (размер размытого шингла)
     * @param {number} minMatchSize - Минимальное количество совпадающих слов для признания плагиатом
     */
    constructor(windowSize = 7, minMatchSize = 4) {
        this.windowSize = windowSize;
        this.minMatchSize = minMatchSize;
    }

    /**
     * Находит неуникальные фрагменты в двух текстах
     * @param {string} text1 - Первый текст (очищенный)
     * @param {string} text2 - Второй текст (очищенный)
     * @return {Object} - Информация о неуникальных фрагментах и процентах совпадений
     */
    checkPlagiarism(text1, text2) {
        // Разбиваем тексты на массивы слов (с учётом предложений)
        const sentences1 = text1.split('\n').filter(s => s.trim());
        const sentences2 = text2.split('\n').filter(s => s.trim());
        
        const words1 = this._flattenSentences(sentences1);
        const words2 = this._flattenSentences(sentences2);
        
        // Множества для хранения индексов неуникальных слов
        const nonUniqueIndices1 = new Set();
        const nonUniqueIndices2 = new Set();
        
        // Для удобства доступа к оригинальным предложениям
        const wordToSentenceMap1 = this._createWordToSentenceMap(words1, sentences1);
        const wordToSentenceMap2 = this._createWordToSentenceMap(words2, sentences2);
        
        // Проверяем первый текст относительно второго
        this._findNonUniqueFragments(
            words1, words2, nonUniqueIndices1, nonUniqueIndices2
        );
        
        // Проверяем второй текст относительно первого
        // (Это необходимо для поиска фрагментов, которые могли быть пропущены при первом проходе)
        this._findNonUniqueFragments(
            words2, words1, nonUniqueIndices2, nonUniqueIndices1
        );
        
        // Подсчитываем проценты неуникальности
        const percentNonUnique1 = words1.length > 0 
            ? (nonUniqueIndices1.size / words1.length) * 100 
            : 0;
        
        const percentNonUnique2 = words2.length > 0 
            ? (nonUniqueIndices2.size / words2.length) * 100 
            : 0;
        
        // Подготавливаем результаты для отображения
        const markedSentences1 = this._markNonUniqueSentences(sentences1, nonUniqueIndices1, wordToSentenceMap1);
        const markedSentences2 = this._markNonUniqueSentences(sentences2, nonUniqueIndices2, wordToSentenceMap2);
        
        return {
            markedText1: markedSentences1.join('\n'),
            markedText2: markedSentences2.join('\n'),
            percentNonUnique1: Math.round(percentNonUnique1),
            percentNonUnique2: Math.round(percentNonUnique2),
            totalWords1: words1.length,
            totalWords2: words2.length,
            nonUniqueWords1: nonUniqueIndices1.size,
            nonUniqueWords2: nonUniqueIndices2.size
        };
    }
    
    /**
     * Преобразует массив предложений в плоский массив слов
     * @private
     */
    _flattenSentences(sentences) {
        const words = [];
        for (const sentence of sentences) {
            const sentenceWords = sentence.split(/\s+/).filter(w => w.trim());
            words.push(...sentenceWords);
        }
        return words;
    }
    
    /**
     * Создаёт карту соответствия слова предложению и его позиции
     * @private
     */
    _createWordToSentenceMap(words, sentences) {
        const map = new Map();
        let globalIndex = 0;
        
        for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex++) {
            const sentenceWords = sentences[sentenceIndex].split(/\s+/).filter(w => w.trim());
            
            for (let wordIndex = 0; wordIndex < sentenceWords.length; wordIndex++) {
                map.set(globalIndex, {
                    sentenceIndex,
                    wordIndex
                });
                globalIndex++;
            }
        }
        
        return map;
    }
    
    /**
     * Находит неуникальные фрагменты между двумя текстами
     * @private
     */
    _findNonUniqueFragments(sourceWords, targetWords, sourceNonUniqueIndices, targetNonUniqueIndices) {
        // Если один из текстов короче размера окна, используем его размер как размер окна
        const effectiveWindowSize = Math.min(this.windowSize, sourceWords.length, targetWords.length);
        
        if (effectiveWindowSize < this.minMatchSize) {
            return; // Невозможно найти совпадения, если окно меньше минимального размера совпадения
        }
        
        // Перебираем окна в исходном тексте
        for (let i = 0; i <= sourceWords.length - effectiveWindowSize; i++) {
            // Создаём множество слов в текущем окне
            const sourceWindow = sourceWords.slice(i, i + effectiveWindowSize);
            const sourceWindowSet = new Set(sourceWindow);
            
            // Перебираем окна в целевом тексте
            for (let j = 0; j <= targetWords.length - effectiveWindowSize; j++) {
                // Создаём множество слов в текущем окне целевого текста
                const targetWindow = targetWords.slice(j, j + effectiveWindowSize);
                const targetWindowSet = new Set(targetWindow);
                
                // Находим общие слова
                const intersection = new Set(
                    [...sourceWindowSet].filter(x => targetWindowSet.has(x))
                );
                
                // Если количество общих слов больше или равно минимальному
                if (intersection.size >= this.minMatchSize) {
                    // Отмечаем слова в исходном тексте
                    for (let k = i; k < i + effectiveWindowSize; k++) {
                        if (k < sourceWords.length) {
                            sourceNonUniqueIndices.add(k);
                        }
                    }
                    
                    // Отмечаем совпадающие слова в целевом тексте
                    for (let k = j; k < j + effectiveWindowSize; k++) {
                        if (k < targetWords.length) {
                            targetNonUniqueIndices.add(k);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Создаёт HTML-разметку для выделения неуникальных слов
     * @private
     */
    _markNonUniqueSentences(sentences, nonUniqueIndices, wordToSentenceMap) {
      // Копируем предложения, чтобы не изменять оригинальные
      const markedSentences = [...sentences];
    
      // Создаём структуру для отслеживания неуникальных слов в каждом предложении
      const sentenceMarkers = {};
      
      // Генерируем цвета для разных групп совпадений
      // Используем базовый оранжевый и меняем его насыщенность и яркость
      const generateColor = (index) => {
          // Создаем несколько предопределенных оттенков оранжевого
          const colors = [
              '#ffaa33', // базовый оранжевый
              '#ff8800', // более темный оранжевый
              '#ffcc66', // светлый оранжевый
              '#ff7722', // красно-оранжевый
              '#ffbb44', // желто-оранжевый
              '#ff9933', // персиковый
              '#ff6600', // темно-оранжевый
          ];
          return colors[index % colors.length];
      };
      
      // Группируем неуникальные слова по совпадающим фрагментам
      const matchGroups = this._groupMatchedFragments(nonUniqueIndices, wordToSentenceMap);
      
      // Для каждой группы совпадений используем свой цвет
      let groupIndex = 0;
      for (const group of matchGroups) {
          const color = generateColor(groupIndex);
          
          for (const index of group) {
              const position = wordToSentenceMap.get(index);
              if (position) {
                  const { sentenceIndex, wordIndex } = position;
                  
                  if (!sentenceMarkers[sentenceIndex]) {
                      sentenceMarkers[sentenceIndex] = {};
                  }
                  
                  // Сохраняем цвет для каждого слова
                  if (!sentenceMarkers[sentenceIndex][wordIndex]) {
                      sentenceMarkers[sentenceIndex][wordIndex] = color;
                  }
              }
          }
          
          groupIndex++;
      }
      
      // Применяем маркировку к предложениям
      for (const sentenceIndex in sentenceMarkers) {
          const sentenceWords = markedSentences[sentenceIndex].split(/\s+/);
          const markers = sentenceMarkers[sentenceIndex];
          
          for (let i = 0; i < sentenceWords.length; i++) {
              if (markers[i]) {
                  sentenceWords[i] = `<span class="non-unique" style="background-color: ${markers[i]}">${sentenceWords[i]}</span>`;
              }
          }
          
          markedSentences[sentenceIndex] = sentenceWords.join(' ');
      }
      
      return markedSentences;
    }

    // Новый метод для группировки совпадающих фрагментов
_groupMatchedFragments(nonUniqueIndices, wordToSentenceMap) {
    // Здесь нужно реализовать алгоритм группировки совпадающих фрагментов
    // Для упрощения можем использовать последовательные индексы как признак группы
    const groups = [];
    let currentGroup = [];
    let lastIndex = -2;
    
    // Сортируем индексы для последовательной обработки
    const sortedIndices = Array.from(nonUniqueIndices).sort((a, b) => a - b);
    
    for (const index of sortedIndices) {
        if (index !== lastIndex + 1) {
            // Если последовательность прервалась, начинаем новую группу
            if (currentGroup.length > 0) {
                groups.push(currentGroup);
            }
            currentGroup = [index];
        } else {
            // Продолжаем текущую группу
            currentGroup.push(index);
        }
        lastIndex = index;
    }
    
    // Добавляем последнюю группу, если она не пустая
    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }
    
    return groups;
}
}


// Экспортируем класс для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlagiarismChecker;
} else {
    // Делаем класс доступным в глобальной области видимости в браузере
    window.PlagiarismChecker = PlagiarismChecker;
}
