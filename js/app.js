document.addEventListener('DOMContentLoaded', function() {
    // Получаем доступ к элементам
    const text1Input = document.getElementById('text1');
    const text2Input = document.getElementById('text2');
    const cleanedText1 = document.getElementById('cleaned-text1');
    const cleanedText2 = document.getElementById('cleaned-text2');
    const cleanButton = document.getElementById('clean-button');
    const checkButton = document.getElementById('check-button');
    const cleanedSection = document.getElementById('cleaned-section');
    
    // Список слов для удаления (союзы и предлоги)
    const wordsToRemove = [
        // Союзы
        'и', 'но', 'а', 'ж', 'же', 'то',
        // Предлоги
        'в', 'к', 'на', 'с', 'со', 'из', 'о', 'от'
    ];
    
    // Скрываем секцию с очищенными текстами изначально
    cleanedSection.style.display = 'none';
    
    /**
     * Выполняет упрощенный стемминг русскоязычного слова.
     * Удаляет окончания в зависимости от длины слова.
     * @param {string} word - Исходное слово
     * @return {string} - Слово после обработки
     */
    function simpleStemming(word) {
        // Проверяем, содержит ли слово только кириллические символы
        // (возможно с точкой в конце)
        if (!/^[а-яА-ЯёЁ]+\.?$/.test(word)) {
            return word; // Не обрабатываем латиницу и другие символы
        }
        
        // Удаляем точку, если она есть в конце слова
        let hasDot = word.endsWith('.');
        let cleanWord = hasDot ? word.slice(0, -1) : word;
        
        // Применяем правила в зависимости от длины слова
        let stemmedWord;
        
        if (cleanWord.length <= 4) {
            // Для слов до 4 символов включительно оставляем как есть
            stemmedWord = cleanWord;
        } else if (cleanWord.length === 5) {
            // Для слов из 5 символов удаляем последнюю букву
            stemmedWord = cleanWord.slice(0, -1);
        } else if (cleanWord.length === 6) {
            // Для слов из 6 символов удаляем две последние буквы
            stemmedWord = cleanWord.slice(0, -2);
        } else {
            // Для слов из 7 и более символов удаляем три последние буквы
            stemmedWord = cleanWord.slice(0, -3);
        }
        
        // Возвращаем слово, добавляя точку, если она была
        return hasDot ? stemmedWord + '.' : stemmedWord;
    }
    
    // Функция для очистки текста и разделения по предложениям
function cleanText(text) {
    if (!text) return [];
    
    // Заменяем дефисы на пробелы, чтобы слова не сливались
    let textWithSpaces = text.replace(/[-–—]/g, ' ');
    
    // Затем сохраняем точки и пробелы, удаляем другие спец. символы
    let cleaned = textWithSpaces.replace(/[^\wа-яА-ЯёЁ\s.]/g, '');
    
    // Разбиваем текст на предложения (по точкам)
    // Используем позитивный просмотр вперед (?=\.), чтобы сохранить точки в результате
    let sentences = cleaned.split(/(?<=\.)\s*/);
    
    // Обрабатываем каждое предложение
    return sentences.map(sentence => {
        // Если предложение пустое, пропускаем его
        if (!sentence.trim()) return null;
        
        // Разбиваем предложение на слова
        let words = sentence.split(/\s+/);
        
        // Фильтруем слова, удаляя союзы и предлоги, и применяем стемминг
        words = words
            .filter(word => {
                const wordLower = word.toLowerCase().replace(/[.]/g, '');
                return wordLower && !wordsToRemove.includes(wordLower);
            })
            .map(word => simpleStemming(word)); // Применяем стемминг к каждому слову
        
        // Собираем предложение обратно
        return words.join(' ');
    }).filter(sentence => sentence); // Удаляем пустые предложения
}
    
    // Функция для отображения очищенного текста
    function displayCleanedText(container, sentences) {
        // Очищаем контейнер
        container.innerHTML = '';
        
        if (sentences.length === 0) {
            container.innerHTML = '<p class="placeholder-text">Нет текста для отображения</p>';
            return;
        }
        
        // Добавляем каждое предложение как отдельный элемент
        sentences.forEach(sentence => {
            const sentenceElem = document.createElement('span');
            sentenceElem.className = 'sentence';
            sentenceElem.textContent = sentence;
            container.appendChild(sentenceElem);
        });
    }
    
    // Обработчик кнопки очистки
    cleanButton.addEventListener('click', function() {
        const originalText1 = text1Input.value.trim();
        const originalText2 = text2Input.value.trim();
        
        if (!originalText1 && !originalText2) {
            alert('Пожалуйста, введите текст хотя бы в одно поле');
            return;
        }
        
        // Очищаем и разбиваем тексты по предложениям
        const cleanedSentences1 = cleanText(originalText1);
        const cleanedSentences2 = cleanText(originalText2);
        
        // Отображаем очищенные тексты
        displayCleanedText(cleanedText1, cleanedSentences1);
        displayCleanedText(cleanedText2, cleanedSentences2);
        
        // Показываем секцию с очищенными текстами
        cleanedSection.style.display = 'block';
    });
    
    // Пока заглушка для кнопки проверки
    checkButton.addEventListener('click', function() {
        alert('Функция проверки на плагиат будет добавлена позже');
    });
});
