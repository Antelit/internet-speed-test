
import axios from 'axios';
import { performance } from 'node:perf_hooks';

const REQUEST_COUNT = 10;
const [, , url] = process.argv;

if (!url) {
    console.error('Не передан URL');
    process.exit(1);
}

try {
    const parsedUrl = new URL(url);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Не указан протокол');
} catch (error) {
    console.error(`Ошибка адреса: ${error.message}`);
    process.exit(1);
}

const measureSpeed = async () => {
    let totalBytes = 0;
    let totalTime = 0;

    for (let i = 1; i <= REQUEST_COUNT; i++) {
        const startTime = performance.now();
        const response = await axios.get(
            url,
            { responseType: 'arraybuffer', headers: { 'Accept-Encoding': 'identity' } }
        );

        const duration = performance.now() - startTime;
        const bytes = response.data.byteLength;

        totalBytes += bytes;
        totalTime += duration;

        console.log(
            `Запрос ${i}/${REQUEST_COUNT}: ` +
            `${duration.toFixed(2)} ms | ` +
            `${(bytes / 1024 / 1024).toFixed(2)} Мб | ` +
            `HTTP ${response.status}`
        );
    }

    const averageTime = totalTime / REQUEST_COUNT;
    const totalTimeSeconds = totalTime / 1_000;
    const totalMegabits = totalBytes * 8 / 1_000_000;
    const speedMbps = totalMegabits / totalTimeSeconds;

    console.log('\n========== Результат ==========');
    console.log(`Всего запросов: ${REQUEST_COUNT}`);
    console.log(`Среднее время: ${averageTime.toFixed(2)} ms`);
    console.log(`Скачанный объем: ${(totalBytes / 1024 / 1024).toFixed(2)} Мб`);
    console.log(`Время: ${totalTimeSeconds.toFixed(2)} сек`);
    console.log(`Скорость: ${speedMbps.toFixed(2)} Мб/сек`);
}

measureSpeed().catch(error => {
    console.error('\nОшибка:', error.message);
    process.exitCode = 1;
});