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
    
    // Функция для очистки текста и разделения по предложениям
    function cleanText(text) {
        if (!text) return [];
        
        // Сначала сохраняем точки и пробелы, удаляем другие спец. символы
        let cleaned = text.replace(/[^\wа-яА-ЯёЁ\s.]/g, '');
        
        // Разбиваем текст на предложения (по точкам)
        // Используем позитивный просмотр вперед (?=\.), чтобы сохранить точки в результате
        let sentences = cleaned.split(/(?<=\.)\s*/);
        
        // Обрабатываем каждое предложение
        return sentences.map(sentence => {
            // Если предложение пустое, пропускаем его
            if (!sentence.trim()) return null;
            
            // Разбиваем предложение на слова
            let words = sentence.split(/\s+/);
            
            // Фильтруем слова, удаляя союзы и предлоги
            words = words.filter(word => {
                const wordLower = word.toLowerCase().replace(/[.]/g, '');
                return wordLower && !wordsToRemove.includes(wordLower);
            });
            
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
